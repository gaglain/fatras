import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { normalizeEmail, canonicalEmail, findContactByEmail } from "../_shared/emailMatching.ts";

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

const toBase64 = (input: Uint8Array): string => {
  let binary = '';
  const chunkSize = 0x8000;

  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require valid authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Missing Authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Authentication required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Initialize Supabase with service role for data access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Verify user authentication
    const userSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await userSupabase.auth.getUser();
    if (authError || !user) {
      console.error('❌ Invalid authentication:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid authentication' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let { to, subject, html, fromName = 'Application', from, userId, attachments }: EmailRequest = await req.json();

    // Normaliser les destinataires : accepter string ou array, séparateurs , ; espace
    const normalizeRecipients = (input: unknown): string[] => {
      const raw = Array.isArray(input) ? input : [input];
      const out: string[] = [];
      for (const item of raw) {
        if (typeof item !== 'string') continue;
        const parts = item.split(/[,;\s]+/);
        for (const p of parts) {
          const cleaned = p.trim().replace(/^mailto:/i, '').replace(/^<|>$/g, '').trim();
          if (cleaned && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) out.push(cleaned);
        }
      }
      return Array.from(new Set(out));
    };
    to = normalizeRecipients(to);
    if (to.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Aucune adresse destinataire valide' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Validate that userId matches authenticated user (if provided)
    if (userId && userId !== user.id) {
      console.error('❌ User ID mismatch - forbidden');
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden - user ID mismatch' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Use authenticated user's ID for config lookup
    const effectiveUserId = userId || user.id;
    console.log('🔄 Tentative d\'envoi email pour userId:', effectiveUserId);

    // Initialize Supabase with service role for data access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer la configuration email de l'utilisateur
    let fromEmail = 'noreply@fatras-booking.com';
    let resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    console.log('📧 Récupération de la config email pour l\'utilisateur:', effectiveUserId);
    
    const { data: emailConfig, error } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('user_id', effectiveUserId)
      .in('setting_key', ['from_email', 'resend_api_key']);

    if (error) {
      console.error('❌ Erreur récupération config:', error);
    } else if (emailConfig && emailConfig.length > 0) {
      const configMap = emailConfig.reduce((acc: Record<string, string>, setting) => {
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
    let resendAttachments: Array<{ filename: string; content: string; contentType?: string }> | undefined;
    if (attachments && attachments.length > 0) {
      console.log(`📎 Préparation de ${attachments.length} pièce(s) jointe(s)`);
      resendAttachments = [];
      for (const att of attachments) {
        const filename = att.filename || att.name || 'attachment';
        if (att.content) {
          let content = att.content;
          if (att.content.startsWith('data:')) {
            content = att.content.split(',')[1] || '';
          }
          resendAttachments.push({ filename, content, contentType: att.contentType });
        } else if (att.url) {
          const res = await fetch(att.url);
          if (!res.ok) {
            throw new Error(`Impossible de récupérer la pièce jointe: ${filename}`);
          }
          const buf = new Uint8Array(await res.arrayBuffer());
          const contentType = att.contentType || res.headers.get('content-type') || undefined;
          resendAttachments.push({ filename, content: toBase64(buf), contentType });
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

    if (emailResponse.error) {
      console.error('❌ Resend a rejeté l\'email:', emailResponse.error);
      return new Response(JSON.stringify({
        success: false,
        error: emailResponse.error.message,
        details: emailResponse.error,
      }), {
        status: emailResponse.error.statusCode || 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    console.log('✅ Email envoyé avec succès:', emailResponse);

    // Persister chaque destinataire dans la table `emails` pour qu'ils
    // apparaissent dans l'historique du contact (parité avec SMTP/IMAP).
    try {
      const sentAt = new Date().toISOString();
      const messageId = emailResponse.data?.id;
      const plainContent = (html || '').replace(/<[^>]*>/g, '').trim();
      const recipientList = Array.isArray(to) ? to : [to];

      // Extraire l'email "pur" depuis finalFrom (ex: "Name <a@b.com>")
      const fromMatch = finalFrom.match(/<([^>]+)>/);
      const fromEmailClean = (fromMatch ? fromMatch[1] : fromEmail).toLowerCase().trim();

      // Lookup robuste des contacts par adresse (exact + canonique gmail/+alias)
      const contactIdByRecipient = new Map<string, string>();
      for (const r of recipientList) {
        if (typeof r !== 'string' || !r) continue;
        const match = await findContactByEmail(supabase, r, effectiveUserId);
        if (match) contactIdByRecipient.set(normalizeEmail(r), match.contactId);
      }

      const rows = recipientList.map((recipient: string) => {
        const norm = normalizeEmail(recipient);
        return {
          user_id: effectiveUserId,
          // Utiliser l'email_id Resend comme message_id pour que le webhook
          // (delivered/opened/clicked/bounced) puisse retrouver et mettre à jour cette ligne.
          message_id: messageId,
          from_email: fromEmailClean,
          from_name: fromName,
          to_email: recipient,
          subject,
          html_content: html,
          content: plainContent,
          status: 'sent',
          sent_at: sentAt,
          direction: 'outbound',
          provider: 'resend',
          contact_id: contactIdByRecipient.get(norm) || null,
        };
      });

      const { error: dbError } = await supabase.from('emails').insert(rows);
      if (dbError) {
        console.error('⚠️ Erreur stockage email Resend:', dbError);
      } else {
        console.log(`✅ ${rows.length} email(s) Resend stocké(s) en base`);
      }
    } catch (persistErr) {
      console.error('⚠️ Exception persistance email Resend:', persistErr);
    }

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

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur lors de l\'envoi de l\'email';
    console.error('❌ Erreur lors de l\'envoi email:', errorMessage);
    
    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
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