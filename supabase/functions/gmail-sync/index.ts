import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GmailSyncRequest {
  userId: string;
  accessToken: string;
  action: 'sync' | 'send' | 'get_profile';
  emailData?: {
    to: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, accessToken, action, emailData }: GmailSyncRequest = await req.json();

    console.log('📧 Gmail sync request:', { userId, action });

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier l'utilisateur
    if (!userId || !accessToken) {
      throw new Error('userId et accessToken requis');
    }

    const gmailApiBase = 'https://gmail.googleapis.com/gmail/v1/users/me';
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    switch (action) {
      case 'get_profile':
        return await getGmailProfile(gmailApiBase, headers);
      
      case 'sync':
        return await syncEmails(gmailApiBase, headers, supabase, userId);
      
      case 'send':
        if (!emailData) {
          throw new Error('emailData requis pour l\'envoi');
        }
        return await sendGmailEmail(gmailApiBase, headers, emailData);
      
      default:
        throw new Error(`Action non supportée: ${action}`);
    }

  } catch (error: any) {
    console.error('❌ Erreur Gmail sync:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur lors de la synchronisation Gmail'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

// Obtenir le profil Gmail
async function getGmailProfile(apiBase: string, headers: any): Promise<Response> {
  try {
    const response = await fetch(`${apiBase}/profile`, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur API Gmail: ${response.status}`);
    }
    
    const profile = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      profile: {
        email: profile.emailAddress,
        messagesTotal: profile.messagesTotal,
        threadsTotal: profile.threadsTotal
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Erreur profil Gmail:', error);
    throw error;
  }
}

// Synchroniser les emails
async function syncEmails(apiBase: string, headers: any, supabase: any, userId: string): Promise<Response> {
  try {
    console.log('🔄 Synchronisation des emails Gmail...');
    
    // Obtenir la liste des messages récents (100 derniers)
    const messagesResponse = await fetch(
      `${apiBase}/messages?maxResults=100&q=in:inbox`,
      { headers }
    );
    
    if (!messagesResponse.ok) {
      throw new Error(`Erreur récupération messages: ${messagesResponse.status}`);
    }
    
    const messagesData = await messagesResponse.json();
    const messages = messagesData.messages || [];
    
    console.log(`📥 ${messages.length} messages trouvés`);
    
    let syncedCount = 0;
    const emailsToInsert = [];
    
    // Traiter chaque message (limité à 20 pour éviter les timeouts)
    for (const message of messages.slice(0, 20)) {
      try {
        // Obtenir les détails du message
        const messageResponse = await fetch(
          `${apiBase}/messages/${message.id}?format=full`,
          { headers }
        );
        
        if (!messageResponse.ok) continue;
        
        const messageData = await messageResponse.json();
        
        // Extraire les informations du message
        const payload = messageData.payload;
        const messageHeaders = payload.headers || [];
        
        const getHeader = (name: string) => {
          const header = messageHeaders.find((h: any) => 
            h.name.toLowerCase() === name.toLowerCase()
          );
          return header?.value || '';
        };
        
        const fromEmail = getHeader('From');
        const toEmail = getHeader('To');
        const subject = getHeader('Subject');
        const date = getHeader('Date');
        
        // Extraire le contenu
        let content = '';
        let htmlContent = '';
        
        if (payload.body?.data) {
          content = atob(payload.body.data.replace(/-/g, '+').replace(/_/g, '/'));
        } else if (payload.parts) {
          // Message multipart
          for (const part of payload.parts) {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              content = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            } else if (part.mimeType === 'text/html' && part.body?.data) {
              htmlContent = atob(part.body.data.replace(/-/g, '+').replace(/_/g, '/'));
            }
          }
        }
        
        // Vérifier si l'email existe déjà
        const { data: existingEmail } = await supabase
          .from('inbound_emails')
          .select('id')
          .eq('message_id', message.id)
          .eq('user_id', userId)
          .single();
        
        if (!existingEmail) {
          emailsToInsert.push({
            user_id: userId,
            message_id: message.id,
            from_email: fromEmail,
            to_email: toEmail,
            subject: subject,
            content: content,
            html_content: htmlContent || null,
            provider: 'gmail',
            thread_id: messageData.threadId,
            received_at: date ? new Date(date).toISOString() : new Date().toISOString(),
            labels: messageData.labelIds || []
          });
          
          syncedCount++;
        }
        
      } catch (error) {
        console.error('❌ Erreur traitement message:', error);
        continue;
      }
    }
    
    // Insérer les nouveaux emails
    if (emailsToInsert.length > 0) {
      const { error } = await supabase
        .from('inbound_emails')
        .insert(emailsToInsert);
      
      if (error) {
        console.error('❌ Erreur insertion emails:', error);
        throw error;
      }
    }
    
    console.log(`✅ ${syncedCount} nouveaux emails synchronisés`);
    
    return new Response(JSON.stringify({
      success: true,
      syncedCount,
      totalProcessed: messages.length
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Erreur sync emails:', error);
    throw error;
  }
}

// Envoyer un email via Gmail
async function sendGmailEmail(apiBase: string, headers: any, emailData: any): Promise<Response> {
  try {
    console.log('📤 Envoi email via Gmail API...');
    
    // Construire l'email au format RFC 2822
    const emailLines = [
      `To: ${emailData.to.join(', ')}`,
      `Subject: ${emailData.subject}`,
      'MIME-Version: 1.0',
      emailData.isHtml ? 
        'Content-Type: text/html; charset=UTF-8' : 
        'Content-Type: text/plain; charset=UTF-8',
      '',
      emailData.body
    ];
    
    const email = emailLines.join('\r\n');
    const encodedEmail = btoa(email).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    const response = await fetch(`${apiBase}/messages/send`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        raw: encodedEmail
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erreur envoi Gmail: ${errorData.error?.message || response.status}`);
    }
    
    const result = await response.json();
    
    console.log('✅ Email envoyé via Gmail:', result.id);
    
    return new Response(JSON.stringify({
      success: true,
      messageId: result.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
    
  } catch (error: any) {
    console.error('❌ Erreur envoi Gmail:', error);
    throw error;
  }
}

serve(handler);