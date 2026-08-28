import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';
import { Webhook } from "npm:svix@1.21.0";

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

    // Verify webhook signature (Svix)
    const svixId = req.headers.get('svix-id');
    const svixTimestamp = req.headers.get('svix-timestamp');
    const svixSignature = req.headers.get('svix-signature');

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.log('❌ En-têtes Svix manquants');
      return new Response(JSON.stringify({ error: 'Missing Svix headers' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await req.text();

    let payload: ResendWebhookPayload;
    try {
      const wh = new Webhook(signingSecret);
      payload = wh.verify(body, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ResendWebhookPayload;
    } catch (err: any) {
      console.log('❌ Signature invalide:', err?.message || err);
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
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