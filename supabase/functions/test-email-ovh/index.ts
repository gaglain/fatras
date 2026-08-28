import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, userId }: TestEmailRequest = await req.json();

    // Créer le client Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const { createClient } = await import('npm:@supabase/supabase-js@2');
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer la configuration SMTP depuis les préférences utilisateur
    const { data: smtpSettings } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('user_id', userId)
      .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password']);

    const settingsMap = smtpSettings?.reduce((acc: any, setting: any) => {
      acc[setting.setting_key] = setting.setting_value;
      return acc;
    }, {}) || {};

    const smtpHost = settingsMap.smtp_host || "pro1.mail.ovh.net";
    const smtpPort = parseInt(settingsMap.smtp_port || "587");
    const smtpUser = settingsMap.smtp_username;
    const smtpPass = settingsMap.smtp_password;

    console.log("📧 Configuration SMTP récupérée:", { 
      host: smtpHost, 
      port: smtpPort, 
      user: smtpUser, 
      hasPassword: !!smtpPass,
      settings: Object.keys(settingsMap)
    });

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new Error("Configuration SMTP manquante dans les préférences utilisateur");
    }

    console.log("Configuration SMTP:", { host: smtpHost, port: smtpPort, user: smtpUser });

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

    // Connexion SMTP - Utiliser le port configuré
    const conn = await Deno.connectTls({
      hostname: smtpHost,
      port: smtpPort === 587 ? 465 : smtpPort, // Utiliser SSL/TLS selon le port
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