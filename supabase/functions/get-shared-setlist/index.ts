import { createClient } from "npm:@supabase/supabase-js@2";

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
    const token = url.searchParams.get('token');

    if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { data: setlist, error } = await supabase
      .from('show_bible_setlists')
      .select('id, title, description, sacem_program_number, artist_id')
      .eq('share_token', token)
      .maybeSingle();

    if (error || !setlist) {
      return new Response(JSON.stringify({ error: 'Setlist not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: songs } = await supabase
      .from('show_bible_setlist_songs')
      .select('id, title, duration, tonality, bpm, notes, lyrics, sacem_number, position')
      .eq('setlist_id', setlist.id)
      .order('position', { ascending: true });

    let artistName: string | null = null;
    if (setlist.artist_id) {
      const { data: a } = await supabase
        .from('centralized_artists')
        .select('name')
        .eq('id', setlist.artist_id)
        .maybeSingle();
      artistName = a?.name ?? null;
    }

    return new Response(JSON.stringify({ setlist, songs: songs || [], artistName }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
