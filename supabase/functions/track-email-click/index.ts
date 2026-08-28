import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

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

    // Get campaign
    const { data: campaign } = await supabase
      .from('email_campaigns')
      .select('user_id, clicked_count, opened_count, sent_count')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      console.error('Campaign not found');
      // Still redirect even if campaign not found
      return Response.redirect(decodeURIComponent(originalUrl), 302);
    }

    // Track the click event (allow multiple clicks from same contact)
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

    // Recalcul centralisé des stats (contacts uniques, clic = ouverture implicite)
    await supabase.rpc('recompute_campaign_stats', { p_campaign_id: campaignId });
    console.log('Campaign stats recomputed after click');

    // Redirect to original URL
    return Response.redirect(decodeURIComponent(originalUrl), 302);
  } catch (error: any) {
    console.error('Error tracking email click:', error);
    // Still redirect on error
    const url = new URL(req.url);
    const originalUrl = url.searchParams.get('url');
    if (originalUrl) {
      return Response.redirect(decodeURIComponent(originalUrl), 302);
    }
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);