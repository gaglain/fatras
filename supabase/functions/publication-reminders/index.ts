import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, serviceKey);

    const now = new Date();
    const inTen = new Date(now.getTime() + 10 * 60 * 1000).toISOString();
    const nowIso = now.toISOString();

    // Publications programmées dans les 10 prochaines minutes et non publiées
    const { data: pubs, error: pubsError } = await supabase
      .from('publications')
      .select('*')
      .eq('status', 'scheduled')
      .gte('scheduled_date', nowIso)
      .lte('scheduled_date', inTen);

    if (pubsError) throw pubsError;

    let created = 0;
    for (const pub of pubs || []) {
      const targetUser = pub.assigned_to || pub.user_id;

      // Vérifier si une notification récente existe déjà pour cette publication
      const { data: existing, error: existErr } = await supabase
        .from('notifications')
        .select('id, created_at, data')
        .eq('user_id', targetUser)
        .eq('type', 'publication_due')
        .gte('created_at', new Date(now.getTime() - 60 * 60 * 1000).toISOString());

      if (existErr) console.warn('Check existing notifications error', existErr);
      const already = (existing || []).some((n: any) => n.data?.publication_id === pub.id);
      if (already) continue;

      const title = 'Rappel publication imminente';
      const message = `${pub.platform} à ${new Date(pub.scheduled_date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;

      const { error: insErr } = await supabase.from('notifications').insert({
        user_id: targetUser,
        type: 'publication_due',
        title,
        message,
        data: { publication_id: pub.id, scheduled_date: pub.scheduled_date },
        read: false,
      });
      if (!insErr) created += 1;
    }

    return new Response(JSON.stringify({ success: true, created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    console.error('publication-reminders error', e);
    return new Response(JSON.stringify({ success: false, error: String(e) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
