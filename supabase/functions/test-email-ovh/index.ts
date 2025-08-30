import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to }: TestEmailRequest = await req.json();

    // Configuration OVH SMTP
    const smtpHost = Deno.env.get("OVH_SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("OVH_SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("OVH_SMTP_USERNAME");
    const smtpPass = Deno.env.get("OVH_SMTP_PASSWORD");

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Configuration SMTP OVH manquante");
    }

    // Test de base64 pour l'authentification
    const authUser = btoa(smtpUser);
    const authPass = btoa(smtpPass);

    // Créer le message de test
    const emailContent = `Subject: Test Email OVH - Fatras
From: ${smtpUser}
To: ${to}
MIME-Version: 1.0
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Test Email</title>
</head>
<body>
    <h1>Email de test depuis Fatras</h1>
    <p>Ceci est un email de test pour vérifier la configuration SMTP OVH.</p>
    <p>Configuration utilisée :</p>
    <ul>
        <li>Host: ${smtpHost}</li>
        <li>Port: ${smtpPort}</li>
        <li>Username: ${smtpUser}</li>
    </ul>
    <p>Si vous recevez cet email, la configuration fonctionne correctement !</p>
</body>
</html>

`;

    // Connexion SMTP
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort,
    });

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Fonction pour lire la réponse
    const readResponse = async () => {
      const buffer = new Uint8Array(1024);
      const n = await conn.read(buffer);
      if (n === null) return "";
      return decoder.decode(buffer.subarray(0, n));
    };

    // Fonction pour envoyer une commande
    const sendCommand = async (command: string) => {
      await conn.write(encoder.encode(command + "\r\n"));
      return await readResponse();
    };

    // Séquence SMTP
    const responses = [];
    
    // Salutation initiale
    let response = await readResponse();
    responses.push(`INITIAL: ${response}`);

    // EHLO
    response = await sendCommand(`EHLO ${smtpHost}`);
    responses.push(`EHLO: ${response}`);

    // AUTH LOGIN
    response = await sendCommand("AUTH LOGIN");
    responses.push(`AUTH LOGIN: ${response}`);

    // Username
    response = await sendCommand(authUser);
    responses.push(`USERNAME: ${response}`);

    // Password
    response = await sendCommand(authPass);
    responses.push(`PASSWORD: ${response}`);

    // MAIL FROM
    response = await sendCommand(`MAIL FROM:<${smtpUser}>`);
    responses.push(`MAIL FROM: ${response}`);

    // RCPT TO
    response = await sendCommand(`RCPT TO:<${to}>`);
    responses.push(`RCPT TO: ${response}`);

    // DATA
    response = await sendCommand("DATA");
    responses.push(`DATA: ${response}`);

    // Send email content
    await conn.write(encoder.encode(emailContent));
    response = await sendCommand(".");
    responses.push(`EMAIL CONTENT: ${response}`);

    // QUIT
    response = await sendCommand("QUIT");
    responses.push(`QUIT: ${response}`);

    conn.close();

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de test envoyé avec succès",
        responses: responses,
        config: {
          host: smtpHost,
          port: smtpPort,
          username: smtpUser
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erreur test email:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);