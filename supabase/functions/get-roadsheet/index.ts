import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const stopId = url.searchParams.get('id');

    if (!stopId) {
      return new Response(JSON.stringify({ error: 'Missing stop id' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: stop, error } = await supabase
      .from('roadshow_stops')
      .select('*')
      .eq('id', stopId)
      .single();

    if (error || !stop) {
      return new Response(JSON.stringify({ error: 'Stop not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch artists from lineup
    let artists: any[] = [];
    if (stop.artist_lineup && Array.isArray(stop.artist_lineup)) {
      const artistIds = stop.artist_lineup
        .map((a: any) => typeof a === 'string' ? a : a?.id || a?.userId || a?.artistId)
        .filter(Boolean);

      if (artistIds.length > 0) {
        const { data: artistData } = await supabase
          .from('centralized_artists')
          .select('id, name, image')
          .in('id', artistIds);
        artists = artistData || [];
      }
    }

    // Fetch user profiles for lineup members
    let lineupMembers: any[] = [];
    if (stop.artist_lineup && Array.isArray(stop.artist_lineup)) {
      const userIds = stop.artist_lineup
        .map((a: any) => a?.userId)
        .filter(Boolean);

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, avatar_url, function_title')
          .in('user_id', userIds);
        lineupMembers = profiles || [];
      }
    }

    return new Response(JSON.stringify({ stop, artists, lineupMembers }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
