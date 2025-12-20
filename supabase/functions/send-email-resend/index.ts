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

    const { to, subject, html, fromName = 'Application', from, userId, attachments }: EmailRequest = await req.json();

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