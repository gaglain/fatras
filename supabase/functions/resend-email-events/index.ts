import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { Webhook } from "https://esm.sh/svix@1.24.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const webhookSecret = Deno.env.get('RESEND_WEBHOOK_SECRET');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify webhook signature if secret is provided
    if (webhookSecret) {
      const svixId = req.headers.get('svix-id');
      const svixTimestamp = req.headers.get('svix-timestamp');
      const svixSignature = req.headers.get('svix-signature');

      if (!svixId || !svixTimestamp || !svixSignature) {
        console.log('Missing svix headers');
        return new Response('Missing svix headers', { status: 400, headers: corsHeaders });
      }

      const payload = await req.text();
      const wh = new Webhook(webhookSecret);

      try {
        wh.verify(payload, {
          'svix-id': svixId,
          'svix-timestamp': svixTimestamp,
          'svix-signature': svixSignature,
        });
      } catch (err) {
        console.error('Webhook verification failed:', err);
        return new Response('Webhook verification failed', { status: 401, headers: corsHeaders });
      }

      const body = JSON.parse(payload);
      await processWebhookEvent(supabase, body);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // No webhook secret, process without verification
      const body = await req.json();
      await processWebhookEvent(supabase, body);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function processWebhookEvent(supabase: any, body: any) {
  const { type, data } = body;

  console.log('Processing webhook event:', type, data);

  // Map Resend event types to our database statuses
  const eventTypeMap: { [key: string]: string } = {
    'email.sent': 'sent',
    'email.delivered': 'delivered',
    'email.delivery_delayed': 'pending',
    'email.complained': 'bounced',
    'email.bounced': 'bounced',
    'email.opened': 'opened',
    'email.clicked': 'clicked',
  };

  const status = eventTypeMap[type];
  if (!status) {
    console.log('Ignoring event type:', type);
    return;
  }

  // Find email by message_id
  const { data: email, error: findError } = await supabase
    .from('emails')
    .select('*')
    .eq('message_id', data.email_id)
    .single();

  if (findError || !email) {
    console.log('Email not found for message_id:', data.email_id);
    return;
  }

  // Update email status
  const updateData: any = { status };

  if (type === 'email.delivered') {
    updateData.delivered_at = new Date().toISOString();
  } else if (type === 'email.opened') {
    updateData.opened_at = new Date().toISOString();
    updateData.is_read = true;
  }

  const { error: updateError } = await supabase
    .from('emails')
    .update(updateData)
    .eq('id', email.id);

  if (updateError) {
    console.error('Error updating email:', updateError);
    return;
  }

  // If this is a campaign email, update campaign stats
  if (email.campaign_id) {
    await updateCampaignStats(supabase, email.campaign_id, type);
  }

  console.log('Successfully processed webhook event');
}

async function updateCampaignStats(supabase: any, campaignId: string, eventType: string) {
  const { data: campaign, error: campaignError } = await supabase
    .from('email_campaigns')
    .select('*')
    .eq('id', campaignId)
    .single();

  if (campaignError || !campaign) {
    console.log('Campaign not found:', campaignId);
    return;
  }

  let updateData: any = {};

  switch (eventType) {
    case 'email.delivered':
      updateData.delivered_count = (campaign.delivered_count || 0) + 1;
      break;
    case 'email.opened':
      updateData.opened_count = (campaign.opened_count || 0) + 1;
      if (campaign.sent_count > 0) {
        updateData.open_rate = ((updateData.opened_count || campaign.opened_count) / campaign.sent_count) * 100;
      }
      break;
    case 'email.clicked':
      updateData.clicked_count = (campaign.clicked_count || 0) + 1;
      if (campaign.sent_count > 0) {
        updateData.click_rate = ((updateData.clicked_count || campaign.clicked_count) / campaign.sent_count) * 100;
      }
      break;
    case 'email.bounced':
    case 'email.complained':
      updateData.bounced_count = (campaign.bounced_count || 0) + 1;
      break;
  }

  await supabase
    .from('email_campaigns')
    .update(updateData)
    .eq('id', campaignId);

  console.log('Campaign stats updated:', updateData);
}

serve(handler);
