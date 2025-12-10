import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, subject, message }: ContactFormRequest = await req.json();

    console.log('📧 Nouvelle soumission formulaire contact:', { name, email, subject });

    // Validation des champs requis
    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Tous les champs obligatoires doivent être remplis'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Adresse email invalide'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Initialiser Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Récupérer l'email de destination depuis les settings (contact_email)
    let recipientEmail = 'Booking@fatras.net'; // Valeur par défaut
    
    const { data: settings, error: settingsError } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['contact_email', 'company_name']);

    if (settingsError) {
      console.error('❌ Erreur récupération settings:', settingsError);
    } else if (settings && settings.length > 0) {
      const configMap = settings.reduce((acc: any, s) => {
        acc[s.setting_key] = s.setting_value;
        return acc;
      }, {});
      
      if (configMap.contact_email) {
        recipientEmail = configMap.contact_email;
        console.log('✅ Email destinataire configuré:', recipientEmail);
      }
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      throw new Error('Clé API Resend non configurée');
    }

    const resend = new Resend(resendApiKey);

    // Construire l'email HTML
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7C3AED; border-bottom: 2px solid #7C3AED; padding-bottom: 10px;">
          Nouveau message depuis le formulaire de contact
        </h2>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Nom:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Téléphone:</strong> ${phone}</p>` : ''}
          <p><strong>Sujet:</strong> ${subject}</p>
        </div>
        
        <div style="background-color: #FFFFFF; padding: 20px; border: 1px solid #E5E7EB; border-radius: 8px;">
          <h3 style="margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;" />
        <p style="color: #6B7280; font-size: 12px;">
          Ce message a été envoyé depuis le formulaire de contact du site web.
        </p>
      </div>
    `;

    console.log('📤 Envoi email vers:', recipientEmail);

    const emailResponse = await resend.emails.send({
      from: 'Formulaire Contact <onboarding@resend.dev>',
      to: [recipientEmail],
      replyTo: email,
      subject: `[Contact] ${subject}`,
      html: htmlContent,
    });

    console.log('✅ Email contact envoyé:', emailResponse);

    // Optionnel: Envoyer une confirmation à l'expéditeur
    try {
      await resend.emails.send({
        from: 'Confirmation <onboarding@resend.dev>',
        to: [email],
        subject: `Confirmation: Nous avons bien reçu votre message`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7C3AED;">Merci pour votre message !</h2>
            <p>Bonjour ${name},</p>
            <p>Nous avons bien reçu votre message concernant "<strong>${subject}</strong>".</p>
            <p>Nous vous répondrons dans les plus brefs délais.</p>
            <p>Cordialement,<br/>L'équipe</p>
          </div>
        `,
      });
      console.log('✅ Email de confirmation envoyé à:', email);
    } catch (confirmError) {
      console.warn('⚠️ Erreur envoi confirmation (non bloquant):', confirmError);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Message envoyé avec succès'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Erreur formulaire contact:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Erreur lors de l\'envoi du message'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
