import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';
import { Webhook } from "https://esm.sh/svix@1.24.0";
import { normalizeEmail, canonicalEmail, findContactByEmail } from "../_shared/emailMatching.ts";

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

  // Extract campaign_id from tags if available
  let campaignId = null;
  let contactId = null;
  
  if (data.tags) {
    // Resend tags can be either an object or an array
    if (typeof data.tags === 'object' && !Array.isArray(data.tags)) {
      // Tags is an object like { campaign_id: "xxx", contact_id: "yyy" }
      campaignId = data.tags.campaign_id || null;
      contactId = data.tags.contact_id || null;
    } else if (Array.isArray(data.tags)) {
      // Tags is an array of objects like [{ name: "campaign_id", value: "xxx" }]
      const campaignTag = data.tags.find((tag: any) => tag.name === 'campaign_id');
      const contactTag = data.tags.find((tag: any) => tag.name === 'contact_id');
      if (campaignTag) campaignId = campaignTag.value;
      if (contactTag) contactId = contactTag.value;
    }
  }

  console.log('Campaign ID from tags:', campaignId);
  console.log('Contact ID from tags:', contactId);

  // Try to find email by message_id in emails table
  const { data: email, error: findError } = await supabase
    .from('emails')
    .select('*')
    .eq('message_id', data.email_id)
    .maybeSingle();

  let resolvedUserId: string | null = null;
  let resolvedToEmail: string | null = null;

  if (email) {
    // Update email status in emails table
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
    }

    // Use campaign_id from email record if available
    if (email.campaign_id) {
      campaignId = email.campaign_id;
    }
    resolvedUserId = email.user_id;
    resolvedToEmail = email.to_email;

    // Fallback de matching contact si non fourni dans les tags
    if (!contactId && resolvedToEmail) {
      const match = await findContactByEmail(supabase, resolvedToEmail, resolvedUserId || undefined);
      if (match) {
        contactId = match.contactId;
        // Backfill contact_id sur la ligne emails pour les futurs lookups
        if (!email.contact_id) {
          await supabase.from('emails').update({ contact_id: contactId }).eq('id', email.id);
        }
        console.log(`✅ Contact résolu via ${match.matchType}: ${contactId}`);
      }
    }
  } else {
    console.log('Email not found in emails table for message_id:', data.email_id);
    // Tentative de matching via les destinataires du payload Resend
    const recipients: string[] = Array.isArray(data?.to) ? data.to : (data?.to ? [data.to] : []);
    for (const r of recipients) {
      const match = await findContactByEmail(supabase, r);
      if (match) {
        contactId = match.contactId;
        resolvedToEmail = normalizeEmail(r);
        console.log(`✅ Contact résolu (sans ligne emails) via ${match.matchType}: ${contactId}`);
        break;
      }
    }
  }

  // 🚨 Alerte : ouverture/clic Resend non associable à un contact
  if ((type === 'email.opened' || type === 'email.clicked') && !contactId) {
    const targetUserId = resolvedUserId;
    const recipientForAlert = resolvedToEmail
      || (Array.isArray(data?.to) ? data.to[0] : data?.to)
      || 'inconnu';
    console.warn('⚠️ Événement Resend non associé à un contact:', { type, recipientForAlert, email_id: data.email_id });

    if (targetUserId) {
      try {
        await supabase.from('notifications').insert({
          user_id: targetUserId,
          type: 'email_unmatched',
          title: type === 'email.opened' ? 'Ouverture email non rattachée' : 'Clic email non rattaché',
          message: `Un événement Resend (${type}) pour ${recipientForAlert} n'a pas pu être associé à un contact connu.`,
          data: {
            email_id: data.email_id,
            recipient: recipientForAlert,
            recipient_canonical: canonicalEmail(recipientForAlert),
            event_type: type,
          },
        });
      } catch (notifErr) {
        console.error('Erreur création notification email_unmatched:', notifErr);
      }
    }
  }

  // If this is a campaign email (from tags or email record), update campaign stats
  if (campaignId) {
    console.log('Updating campaign stats for campaign:', campaignId);
    await updateCampaignStats(supabase, campaignId, type);
    
    // Also log the event in email_analytics
    if (contactId) {
      try {
        // Get campaign to find user_id
        const { data: campaign } = await supabase
          .from('email_campaigns')
          .select('user_id')
          .eq('id', campaignId)
          .single();

        if (campaign) {
          await supabase.from('email_analytics').insert({
            user_id: campaign.user_id,
            campaign_id: campaignId,
            contact_id: contactId,
            event_type: status,
            event_data: { email_id: data.email_id, timestamp: new Date().toISOString() }
          });
        }
      } catch (analyticsError) {
        console.error('Error logging analytics:', analyticsError);
      }
    }
  } else if (contactId && resolvedUserId) {
    // Pas de campagne mais ouverture/clic individuel : on log quand même pour l'historique d'engagement
    try {
      await supabase.from('email_analytics').insert({
        user_id: resolvedUserId,
        campaign_id: null,
        contact_id: contactId,
        event_type: status,
        event_data: { email_id: data.email_id, timestamp: new Date().toISOString() },
      });
    } catch (e) {
      console.error('Erreur log email_analytics individuel:', e);
    }
  }

  console.log('Successfully processed webhook event');
}

async function updateCampaignStats(supabase: any, campaignId: string, _eventType: string) {
  // Les compteurs sont recalculés côté base à partir de email_analytics
  // (contacts uniques, un clic vaut une ouverture, taux basés sur les emails livrés).
  const { error } = await supabase.rpc('recompute_campaign_stats', { p_campaign_id: campaignId });
  if (error) {
    console.error('Erreur recompute_campaign_stats:', error);
  } else {
    console.log('Campaign stats recomputed for', campaignId);
  }
}

serve(handler);
