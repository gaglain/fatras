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

    // Recalcul centralisé (contacts uniques, un clic vaut une ouverture, taux sur les livrés)
    const { error: rpcError } = await supabase.rpc('recompute_campaign_stats', { p_campaign_id: campaignId });
    if (rpcError) {
      console.error('Erreur recompute_campaign_stats:', rpcError);
      return new Response('Error', { status: 500, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ success: true }), {
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