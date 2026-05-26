import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetUrl } = await req.json()

    if (!email) {
      throw new Error('Email is required')
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Generate password reset link with explicit redirectTo
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: resetUrl || 'https://booking.fatras.net/auth/reset-password',
      },
    })

    if (error) {
      // Handle user not found specifically
      if (error.code === 'user_not_found') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Aucun utilisateur trouvé avec l'email: ${email}` 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          }
        )
      }
      throw error
    }

    const resetLink = data.properties?.action_link
    console.log(`✅ Password reset link generated for ${email}`)

    // Send email via Resend
    const resendApiKey = Deno.env.get("RESEND_API_KEY")
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lien généré mais envoi email impossible (RESEND_API_KEY manquante)',
          resetLink: resetLink,
          emailSent: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const resend = new Resend(resendApiKey)

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Réinitialisation de mot de passe</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">Fatras Booking</h1>
        </div>
        <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333;">Réinitialisation de votre mot de passe</h2>
          <p>Bonjour,</p>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email.</p>
          <p style="color: #666; font-size: 14px;">Ce lien expire dans 24 heures.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Fatras Booking - Gestion de booking artistique
          </p>
        </div>
      </body>
      </html>
    `

    try {
      const emailResponse = await resend.emails.send({
        from: "Fatras Booking <booking@fatras.net>",
        to: [email],
        subject: "Réinitialisation de votre mot de passe - Fatras Booking",
        html: emailHtml,
      })

      console.log("✅ Password reset email sent:", emailResponse)

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email de réinitialisation envoyé',
          emailSent: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (emailError: any) {
      console.error('❌ Error sending email via Resend:', emailError)
      
      // Return link if email fails
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Lien généré mais erreur envoi email',
          resetLink: resetLink,
          emailSent: false,
          emailError: emailError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }
  } catch (error: any) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
}

serve(handler)
