import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  fromName?: string;
  from?: string; // optional full from header or email, e.g., "Your App <onboarding@resend.dev>"
  userId?: string;
  attachments?: Array<{
    filename?: string;
    name?: string;
    content?: string; // base64 or raw string
    url?: string;     // public URL to fetch
    contentType?: string;
  }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, fromName = 'Application', from, userId, attachments }: EmailRequest = await req.json();

    console.log('🔄 Tentative d\'envoi email pour userId:', userId);

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer la configuration email de l'utilisateur
    let fromEmail = 'noreply@fatras-booking.com';
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (userId) {
      console.log('📧 Récupération de la config email pour l\'utilisateur:', userId);
      
      const { data: emailConfig, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', userId)
        .in('setting_key', ['from_email', 'resend_api_key']);

      if (error) {
        console.error('❌ Erreur récupération config:', error);
      } else if (emailConfig && emailConfig.length > 0) {
        const configMap = emailConfig.reduce((acc: any, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {});
        
        if (configMap.from_email) {
          fromEmail = configMap.from_email;
          console.log('✅ Email expéditeur configuré:', fromEmail);
        }
        
        if (configMap.resend_api_key) {
          resendApiKey = configMap.resend_api_key;
          console.log('✅ Clé API Resend personnalisée trouvée');
        }
      }
    }

    if (!resendApiKey) {
      throw new Error('Clé API Resend non configurée');
    }

    // Initialiser Resend
    const resend = new Resend(resendApiKey);

    // Déterminer l'adresse d'expéditeur finale
    const finalFrom = (from && from.includes('@')) ? from : `${fromName} <${fromEmail}>`;

    console.log('📤 Envoi email via Resend:', {
      from: finalFrom,
      to: to,
      subject: subject
    });

    // Préparer les pièces jointes si fournies
    let resendAttachments: Array<{ filename: string; content: Uint8Array | string; contentType?: string }> | undefined;
    if (attachments && attachments.length > 0) {
      console.log(`📎 Préparation de ${attachments.length} pièce(s) jointe(s)`);
      resendAttachments = [];
      for (const att of attachments) {
        const filename = att.filename || att.name || 'attachment';
        if (att.content) {
          // Supporte base64 (data URL) ou contenu brut
          let content: string | Uint8Array = att.content;
          if (att.content.startsWith('data:')) {
            const base64 = att.content.split(',')[1] || '';
            content = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
          }
          resendAttachments.push({ filename, content, contentType: att.contentType });
        } else if (att.url) {
          const res = await fetch(att.url);
          const buf = new Uint8Array(await res.arrayBuffer());
          const contentType = att.contentType || res.headers.get('content-type') || undefined;
          resendAttachments.push({ filename, content: buf, contentType });
        }
      }
    }

    // Envoyer l'email
    const emailResponse = await resend.emails.send({
      from: finalFrom,
      to: to,
      subject: subject,
      html: html,
      attachments: resendAttachments,
    });

    console.log('✅ Email envoyé avec succès:', emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: 'Email envoyé avec succès',
      id: emailResponse.data?.id
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('❌ Erreur lors de l\'envoi email:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi de l\'email'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);