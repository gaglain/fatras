import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from, userId }: EmailRequest = await req.json();

    console.log('📧 Envoi email SMTP vers:', to);
    console.log('📝 Sujet:', subject);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer la config SMTP depuis app_settings
    const { data: smtpSettings } = await supabaseClient
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('user_id', userId)
      .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_from']);

    if (!smtpSettings || smtpSettings.length === 0) {
      throw new Error('Configuration SMTP non trouvée');
    }

    const config: any = {};
    smtpSettings.forEach(s => {
      config[s.setting_key] = s.setting_value;
    });

    const smtpHost = config.smtp_host;
    const smtpPort = parseInt(config.smtp_port || '587');
    const smtpUser = config.smtp_user;
    const smtpPassword = config.smtp_password;
    const fromEmail = from || config.smtp_from;

    if (!smtpHost || !smtpUser || !smtpPassword) {
      throw new Error('Configuration SMTP incomplète');
    }

    console.log('🔗 Connexion SMTP:', smtpHost, smtpPort);

    // Connexion SMTP
    let conn;
    try {
      conn = await Deno.connect({
        hostname: smtpHost,
        port: smtpPort,
      });
    } catch (e) {
      throw new Error(`Impossible de se connecter au serveur SMTP: ${e.message}`);
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const readResponse = async () => {
      const buffer = new Uint8Array(4096);
      const n = await conn.read(buffer);
      if (n === null) throw new Error('Connexion fermée');
      return decoder.decode(buffer.subarray(0, n));
    };

    const sendCommand = async (command: string) => {
      console.log('→', command.startsWith('AUTH') ? 'AUTH [hidden]' : command);
      await conn.write(encoder.encode(command + '\r\n'));
      const response = await readResponse();
      console.log('←', response.trim());
      return response;
    };

    try {
      // Lire le greeting
      let response = await readResponse();
      console.log('👋', response);

      // EHLO
      response = await sendCommand(`EHLO ${smtpHost}`);
      if (!response.startsWith('250')) {
        throw new Error('EHLO failed');
      }

      // STARTTLS si port 587
      if (smtpPort === 587) {
        response = await sendCommand('STARTTLS');
        if (!response.startsWith('220')) {
          throw new Error('STARTTLS failed');
        }
        
        // Upgrade to TLS
        conn = await Deno.startTls(conn, { hostname: smtpHost });
        
        // Re-EHLO après TLS
        response = await sendCommand(`EHLO ${smtpHost}`);
      }

      // AUTH LOGIN
      response = await sendCommand('AUTH LOGIN');
      if (!response.startsWith('334')) {
        throw new Error('AUTH LOGIN failed');
      }

      // Envoyer username (base64)
      const usernameB64 = btoa(smtpUser);
      response = await sendCommand(usernameB64);
      if (!response.startsWith('334')) {
        throw new Error('Username rejected');
      }

      // Envoyer password (base64)
      const passwordB64 = btoa(smtpPassword);
      response = await sendCommand(passwordB64);
      if (!response.startsWith('235')) {
        throw new Error('Authentication failed');
      }

      console.log('✅ Authentification SMTP réussie');

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${fromEmail}>`);
      if (!response.startsWith('250')) {
        throw new Error('MAIL FROM failed');
      }

      // RCPT TO pour chaque destinataire
      for (const recipient of to) {
        response = await sendCommand(`RCPT TO:<${recipient}>`);
        if (!response.startsWith('250')) {
          throw new Error(`RCPT TO failed for ${recipient}`);
        }
      }

      // DATA
      response = await sendCommand('DATA');
      if (!response.startsWith('354')) {
        throw new Error('DATA command failed');
      }

      // Construire le message
      const message = [
        `From: ${fromEmail}`,
        `To: ${to.join(', ')}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html,
        '.',
      ].join('\r\n');

      response = await sendCommand(message);
      if (!response.startsWith('250')) {
        throw new Error('Message not accepted');
      }

      console.log('✅ Email envoyé via SMTP');

      // Stocker dans la table emails
      const { error: dbError } = await supabaseClient
        .from('emails')
        .insert({
          user_id: userId,
          from_email: fromEmail,
          to_email: to[0],
          subject,
          html_content: html,
          content: html.replace(/<[^>]*>/g, ''), // Strip HTML for plain text
          status: 'sent',
          sent_at: new Date().toISOString(),
          direction: 'outbound',
          provider: 'smtp'
        });

      if (dbError) {
        console.error('⚠️ Erreur stockage email:', dbError);
      } else {
        console.log('✅ Email stocké dans la base de données');
      }

      // QUIT
      await sendCommand('QUIT');
      conn.close();

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Email envoyé via SMTP et synchronisé'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );

    } finally {
      try {
        conn.close();
      } catch (e) {
        // Ignorer
      }
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
