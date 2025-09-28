import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  resetUrl?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetUrl }: PasswordResetRequest = await req.json();

    if (!email) {
      throw new Error("Email is required");
    }

    console.log("📧 Sending password reset email to:", email);

    const defaultResetUrl = resetUrl || "https://1430f060-d630-4b55-b692-677815f70ace.lovableproject.com/auth/reset-password";

    const emailResponse = await resend.emails.send({
      from: "Support <onboarding@resend.dev>",
      to: [email],
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Réinitialisation de mot de passe</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Réinitialisation de mot de passe</h1>
            
            <p style="font-size: 16px; margin-bottom: 30px;">
              Vous avez demandé la réinitialisation de votre mot de passe. 
              Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
            </p>
            
            <a href="${defaultResetUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin: 20px 0;">
              Réinitialiser le mot de passe
            </a>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </p>
            
            <p style="font-size: 14px; color: #666;">
              Ce lien expire dans 24 heures pour votre sécurité.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #9ca3af;">
              Cet email a été envoyé automatiquement, merci de ne pas y répondre.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email de réinitialisation envoyé avec succès",
        messageId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("❌ Error sending password reset email:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        message: "Erreur lors de l'envoi de l'email de réinitialisation"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);