import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Allowlist of domains permitted as password reset redirect targets.
// Any caller-supplied resetUrl must match one of these origins, otherwise
// we fall back to the default production URL.
const ALLOWED_REDIRECT_ORIGINS = [
  'https://booking.fatras.net',
  'https://fatras.net',
  'https://fatras.lovable.app',
  'http://localhost:5173',
  'http://localhost:3000',
]
const DEFAULT_RESET_URL = 'https://booking.fatras.net/auth/reset-password'

function sanitizeResetUrl(input: unknown): string {
  if (typeof input !== 'string' || !input) return DEFAULT_RESET_URL
  try {
    const u = new URL(input)
    const origin = `${u.protocol}//${u.host}`
    if (ALLOWED_REDIRECT_ORIGINS.includes(origin)) {
      return u.toString()
    }
  } catch {
    // fallthrough
  }
  return DEFAULT_RESET_URL
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, resetUrl } = await req.json()

    if (!email || typeof email !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const safeResetUrl = sanitizeResetUrl(resetUrl)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Generic response to avoid user enumeration and never leak the link.
    const genericResponse = new Response(
      JSON.stringify({
        success: true,
        message: 'Si un compte existe pour cet email, un lien de réinitialisation a été envoyé.',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: safeResetUrl },
    })

    if (error) {
      console.warn(`Password reset generateLink failed for ${email}:`, error.message)
      // Always respond generically (do not reveal whether the user exists).
      return genericResponse
    }

    const resetLink = data.properties?.action_link
    if (!resetLink) {
      console.error('No action_link returned from generateLink')
      return genericResponse
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not configured — cannot send password reset email')
      // Do NOT leak the link in the response body.
      return genericResponse
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
      await resend.emails.send({
        from: 'Fatras Booking <booking@fatras.net>',
        to: [email],
        subject: 'Réinitialisation de votre mot de passe - Fatras Booking',
        html: emailHtml,
      })
      console.log(`✅ Password reset email sent to ${email}`)
    } catch (emailError: any) {
      console.error('❌ Error sending password reset email:', emailError?.message ?? emailError)
      // Still return generic response — never leak the reset link.
    }

    return genericResponse
  } catch (error: any) {
    console.error('❌ send-password-reset error:', error?.message ?? error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
}

serve(handler)
