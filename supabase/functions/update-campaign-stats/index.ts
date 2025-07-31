import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaign');
    const eventType = url.searchParams.get('event_type');

    if (!campaignId || !eventType) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    console.log(`Updating campaign stats - Campaign: ${campaignId}, Event: ${eventType}`);

    // Get current campaign stats
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response('Campaign not found', { status: 404, headers: corsHeaders });
    }

    // Calculate new stats based on event type
    let updateData: any = {};

    switch (eventType) {
      case 'opened':
        updateData.opened_count = (campaign.opened_count || 0) + 1;
        if (campaign.sent_count > 0) {
          updateData.open_rate = (updateData.opened_count / campaign.sent_count) * 100;
        }
        break;
      case 'clicked':
        updateData.clicked_count = (campaign.clicked_count || 0) + 1;
        if (campaign.sent_count > 0) {
          updateData.click_rate = (updateData.clicked_count / campaign.sent_count) * 100;
        }
        break;
      case 'bounced':
        updateData.bounced_count = (campaign.bounced_count || 0) + 1;
        break;
      case 'unsubscribed':
        updateData.unsubscribed_count = (campaign.unsubscribed_count || 0) + 1;
        break;
    }

    // Update campaign stats
    await supabase
      .from('email_campaigns')
      .update(updateData)
      .eq('id', campaignId);

    console.log(`Campaign stats updated:`, updateData);

    return new Response(JSON.stringify({ success: true, updated: updateData }), {
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error updating campaign stats:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);