import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.9';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const campaignId = url.searchParams.get('campaign');
    const contactId = url.searchParams.get('contact');
    const originalUrl = url.searchParams.get('url');

    if (!campaignId || !contactId || !originalUrl) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    console.log(`Email link clicked - Campaign: ${campaignId}, Contact: ${contactId}, URL: ${originalUrl}`);

    // Get campaign user_id
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('user_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return new Response('Campaign not found', { status: 404, headers: corsHeaders });
    }

    // Track the click event
    await supabase
      .from('email_analytics')
      .insert({
        user_id: campaign.user_id,
        campaign_id: campaignId,
        contact_id: contactId,
        event_type: 'clicked',
        event_data: { 
          url: originalUrl,
          user_agent: req.headers.get('user-agent'),
          referer: req.headers.get('referer')
        }
      });

    // Update campaign stats
    await supabase.functions.invoke('update-campaign-stats', {
      body: {},
      method: 'GET',
      query: {
        campaign: campaignId,
        event_type: 'clicked'
      }
    });

    // Redirect to original URL
    return Response.redirect(decodeURIComponent(originalUrl), 302);
  } catch (error: any) {
    console.error('Error tracking email click:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);