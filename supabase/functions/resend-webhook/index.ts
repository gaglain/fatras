import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendWebhookPayload {
  type: string;
  created_at: string;
  data: {
    created_at: string;
    email_id: string;
    from: string;
    html?: string;
    reply_to?: string;
    subject: string;
    text?: string;
    to: string[];
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const signingSecret = Deno.env.get('RESEND_SIGNING_SECRET')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify webhook signature
    const signature = req.headers.get('resend-signature');
    if (!signature) {
      console.log('❌ Signature manquante');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await req.text();
    
    // Verify signature using crypto
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(signingSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const parts = signature.split(',');
    const timestamp = parts.find(p => p.startsWith('t='))?.split('=')[1];
    const expectedSignature = parts.find(p => p.startsWith('v1='))?.split('=')[1];
    
    if (!timestamp || !expectedSignature) {
      console.log('❌ Format de signature invalide');
      return new Response(JSON.stringify({ error: 'Invalid signature format' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const signedPayload = `${timestamp}.${body}`;
    const actualSignature = await crypto.subtle.sign(
      'HMAC',
      key,
      encoder.encode(signedPayload)
    );

    const actualSignatureHex = Array.from(new Uint8Array(actualSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (actualSignatureHex !== expectedSignature) {
      console.log('❌ Signature invalide');
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const payload: ResendWebhookPayload = JSON.parse(body);
    
    console.log('📧 Resend webhook received:', payload.type);

    // Nous nous intéressons uniquement aux emails entrants
    if (payload.type !== 'email.received') {
      return new Response(JSON.stringify({ success: true, message: 'Event ignored' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const emailData = payload.data;
    
    // Trouver l'utilisateur basé sur l'email de destination
    const destinationEmail = emailData.to[0];
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('user_id')
      .eq('email', destinationEmail)
      .single();

    if (!userProfile) {
      console.log('❌ Aucun utilisateur trouvé pour:', destinationEmail);
      return new Response(JSON.stringify({ success: false, error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Vérifier si l'email existe déjà
    const { data: existingEmail } = await supabase
      .from('inbound_emails')
      .select('id')
      .eq('message_id', emailData.email_id)
      .eq('user_id', userProfile.user_id)
      .single();

    if (existingEmail) {
      console.log('📧 Email déjà existant:', emailData.email_id);
      return new Response(JSON.stringify({ success: true, message: 'Email already exists' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parser l'adresse email FROM
    let fromEmail = emailData.from;
    let fromName = '';
    
    const fromMatch = emailData.from.match(/^(.*?)\s*<([^>]+)>$/);
    if (fromMatch) {
      fromName = fromMatch[1].trim().replace(/"/g, '');
      fromEmail = fromMatch[2];
    }

    // Insérer le nouvel email
    const { error } = await supabase
      .from('inbound_emails')
      .insert({
        user_id: userProfile.user_id,
        message_id: emailData.email_id,
        from_email: fromEmail,
        from_name: fromName || '',
        to_email: destinationEmail,
        subject: emailData.subject || '',
        content: emailData.text || '',
        html_content: emailData.html || '',
        provider: 'resend',
        received_at: emailData.created_at,
        labels: ['INBOX']
      });

    if (error) {
      console.error('❌ Erreur insertion email:', error);
      return new Response(JSON.stringify({ success: false, error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('✅ Email inséré avec succès:', emailData.email_id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Email processed successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Erreur webhook Resend:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);