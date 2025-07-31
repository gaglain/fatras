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

    if (!campaignId || !contactId) {
      return new Response('Missing parameters', { status: 400, headers: corsHeaders });
    }

    console.log(`Email opened - Campaign: ${campaignId}, Contact: ${contactId}`);

    // Get campaign user_id
    const { data: campaign } = await supabase
      .from('campaigns')
      .select('user_id')
      .eq('id', campaignId)
      .single();

    if (!campaign) {
      return new Response('Campaign not found', { status: 404, headers: corsHeaders });
    }

    // Track the open event
    await supabase
      .from('email_analytics')
      .insert({
        user_id: campaign.user_id,
        campaign_id: campaignId,
        contact_id: contactId,
        event_type: 'opened',
        event_data: { user_agent: req.headers.get('user-agent') }
      });

    // Update campaign stats
    await supabase.functions.invoke('update-campaign-stats', {
      body: {},
      method: 'GET',
      query: {
        campaign: campaignId,
        event_type: 'opened'
      }
    });

    // Return 1x1 transparent pixel
    const pixel = new Uint8Array([
      0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x21, 0xF9, 0x04, 0x01, 0x00, 0x00, 0x00,
      0x00, 0x2C, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0x02, 0x02,
      0x0C, 0x0A, 0x00, 0x3B
    ]);

    return new Response(pixel, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error('Error tracking email open:', error);
    return new Response('Error', { status: 500, headers: corsHeaders });
  }
};

serve(handler);