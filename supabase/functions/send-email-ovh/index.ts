import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, html, from, replyTo }: EmailRequest = await req.json();

    // Récupérer les paramètres SMTP OVH depuis les secrets
    const smtpHost = Deno.env.get("OVH_SMTP_HOST"); // ex: ssl0.ovh.net
    const smtpPort = parseInt(Deno.env.get("OVH_SMTP_PORT") || "465"); // 465 pour SSL
    const smtpUser = Deno.env.get("OVH_SMTP_USERNAME"); // votre email complet
    const smtpPass = Deno.env.get("OVH_SMTP_PASSWORD"); // mot de passe email

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Configuration SMTP OVH manquante");
    }

    // Construire l'email au format MIME
    const toAddresses = Array.isArray(to) ? to.join(", ") : to;
    const fromAddress = from || smtpUser;
    
    const mimeEmail = [
      `From: ${fromAddress}`,
      `To: ${toAddresses}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      `Content-Transfer-Encoding: 8bit`,
      replyTo ? `Reply-To: ${replyTo}` : "",
      ``,
      html
    ].filter(line => line !== "").join("\r\n");

    // Connexion SMTP avec TLS
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Fonction pour lire la réponse SMTP
    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      return decoder.decode(buffer.subarray(0, n || 0));
    };

    // Fonction pour envoyer une commande SMTP
    const sendCommand = async (command: string): Promise<string> => {
      await conn.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    // Protocole SMTP
    console.log("Connexion SMTP établie");
    
    // Lire le message de bienvenue
    const welcome = await readResponse();
    console.log("Welcome:", welcome);

    // EHLO
    const ehlo = await sendCommand(`EHLO ${smtpHost}`);
    console.log("EHLO:", ehlo);

    // AUTH LOGIN
    const authLogin = await sendCommand("AUTH LOGIN");
    console.log("AUTH LOGIN:", authLogin);

    // Username en base64
    const username64 = btoa(smtpUser);
    const userAuth = await sendCommand(username64);
    console.log("User auth:", userAuth);

    // Password en base64
    const password64 = btoa(smtpPass);
    const passAuth = await sendCommand(password64);
    console.log("Pass auth:", passAuth);

    // MAIL FROM
    const mailFrom = await sendCommand(`MAIL FROM:<${fromAddress}>`);
    console.log("MAIL FROM:", mailFrom);

    // RCPT TO
    const recipients = Array.isArray(to) ? to : [to];
    for (const recipient of recipients) {
      const rcptTo = await sendCommand(`RCPT TO:<${recipient}>`);
      console.log(`RCPT TO ${recipient}:`, rcptTo);
    }

    // DATA
    const dataCmd = await sendCommand("DATA");
    console.log("DATA:", dataCmd);

    // Envoyer le contenu de l'email
    await conn.write(encoder.encode(mimeEmail + "\r\n.\r\n"));
    const dataResponse = await readResponse();
    console.log("Data response:", dataResponse);

    // QUIT
    const quit = await sendCommand("QUIT");
    console.log("QUIT:", quit);

    conn.close();

    console.log("Email envoyé avec succès via OVH SMTP");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email envoyé avec succès via OVH",
        to: toAddresses,
        subject 
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Erreur envoi email OVH:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: "Vérifiez la configuration SMTP OVH"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);