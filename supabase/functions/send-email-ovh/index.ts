import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  to: string[];
  subject: string;
  html: string;
  from?: string;
  fromName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from, fromName }: EmailRequest = await req.json();
    
    console.log('📧 Sending email with OVH SMTP:', { to, subject, from });

    // Récupérer les paramètres SMTP OVH
    const smtpHost = Deno.env.get('OVH_SMTP_HOST') || 'ssl0.ovh.net';
    const smtpPort = parseInt(Deno.env.get('OVH_SMTP_PORT') || '587');
    const smtpUsername = Deno.env.get('OVH_SMTP_USERNAME');
    const smtpPassword = Deno.env.get('OVH_SMTP_PASSWORD');

    if (!smtpUsername || !smtpPassword) {
      throw new Error('Configuration SMTP OVH manquante');
    }

    // Construire l'email
    const fromEmail = from || smtpUsername;
    const fromField = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    
    const emailContent = [
      `From: ${fromField}`,
      `To: ${to.join(', ')}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html
    ].join('\r\n');

    // Établir la connexion TLS
    console.log('🔗 Connecting to OVH SMTP server...');
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Helper pour lire la réponse
    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // Helper pour envoyer une commande
    const sendCommand = async (command: string): Promise<string> => {
      console.log('→', command.replace(/AUTH PLAIN .+/, 'AUTH PLAIN [hidden]'));
      await conn.write(encoder.encode(command + '\r\n'));
      const response = await readResponse();
      console.log('←', response.trim());
      return response;
    };

    try {
      // Lire le message d'accueil
      let response = await readResponse();
      console.log('👋 Server greeting:', response.trim());

      // EHLO
      response = await sendCommand(`EHLO ${smtpHost}`);
      if (!response.startsWith('250')) {
        throw new Error(`EHLO failed: ${response}`);
      }

      // AUTH PLAIN
      const authString = btoa(`\0${smtpUsername}\0${smtpPassword}`);
      response = await sendCommand(`AUTH PLAIN ${authString}`);
      if (!response.startsWith('235')) {
        throw new Error(`AUTH failed: ${response}`);
      }

      // MAIL FROM
      response = await sendCommand(`MAIL FROM:<${fromEmail}>`);
      if (!response.startsWith('250')) {
        throw new Error(`MAIL FROM failed: ${response}`);
      }

      // RCPT TO pour chaque destinataire
      for (const recipient of to) {
        response = await sendCommand(`RCPT TO:<${recipient}>`);
        if (!response.startsWith('250')) {
          throw new Error(`RCPT TO failed for ${recipient}: ${response}`);
        }
      }

      // DATA
      response = await sendCommand('DATA');
      if (!response.startsWith('354')) {
        throw new Error(`DATA failed: ${response}`);
      }

      // Envoyer le contenu de l'email
      await conn.write(encoder.encode(emailContent + '\r\n.\r\n'));
      response = await readResponse();
      console.log('📨 Email sent:', response.trim());
      
      if (!response.startsWith('250')) {
        throw new Error(`Email sending failed: ${response}`);
      }

      // QUIT
      await sendCommand('QUIT');

      console.log('✅ Email sent successfully');
      
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Email sent successfully via OVH SMTP'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });

    } finally {
      conn.close();
    }

  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);