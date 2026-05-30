import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_CFG = {
  enabled: false,
  throttleMinutes: 30,
  subject: '✏️ Mise à jour : {city} — {venue}',
  intro: 'La feuille de route a été mise à jour. Voici les principaux changements :',
};

async function loadCfg(supabase: any) {
  const { data } = await supabase
    .from('app_settings')
    .select('setting_value')
    .eq('setting_key', 'roadshow_email_update')
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.setting_value) return DEFAULT_CFG;
  try { return { ...DEFAULT_CFG, ...JSON.parse(data.setting_value) }; } catch { return DEFAULT_CFG; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { userIds, stopId, city, venue, changes, _test } = await req.json();
    const cfg = await loadCfg(supabase);

    if (!cfg.enabled && !_test) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!userIds?.length) {
      return new Response(JSON.stringify({ error: 'No userIds' }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Throttle: skip if a previous update notification was sent for this stop within throttleMinutes
    if (stopId && cfg.throttleMinutes > 0 && !_test) {
      const since = new Date(Date.now() - cfg.throttleMinutes * 60_000).toISOString();
      const { data: recent } = await supabase
        .from('roadshow_reminder_logs')
        .select('id')
        .eq('roadshow_stop_id', stopId)
        .eq('reminder_type', 'update')
        .gt('created_at', since)
        .limit(1);
      if (recent && recent.length > 0) {
        return new Response(JSON.stringify({ skipped: true, reason: 'throttled' }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, email, first_name, username')
      .in('user_id', userIds);

    if (!profiles?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const appUrl = stopId ? `https://fatras.lovable.app/feuille-de-route/${stopId}` : 'https://fatras.lovable.app';
    const subject = (cfg.subject || DEFAULT_CFG.subject)
      .replaceAll('{city}', city || '')
      .replaceAll('{venue}', venue || '');

    const changesList = Array.isArray(changes) && changes.length > 0
      ? `<ul style="margin:8px 0 0;padding-left:20px;color:#444;font-size:14px;line-height:1.6;">${changes.map((c: string) => `<li>${c}</li>`).join('')}</ul>`
      : '<p style="color:#666;font-size:14px;font-style:italic;">Détails dans l\'application.</p>';

    let sent = 0;
    for (const p of profiles) {
      if (!p.email) continue;
      const firstName = p.first_name || p.username || 'Équipier';
      const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f3ee;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e5e3dd;">
    <div style="background:#1e1e1e;padding:28px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:20px;">✏️ Feuille de route mise à jour</h1>
      <p style="color:#c4654a;margin:6px 0 0;font-size:13px;">${city || ''} — ${venue || ''}</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;color:#1e1e1e;margin:0 0 12px;">Bonjour <strong>${firstName}</strong>,</p>
      <p style="font-size:14px;color:#444;line-height:1.6;margin:0 0 16px;">${cfg.intro}</p>
      <div style="background:#f5f3ee;border-left:3px solid #c4654a;border-radius:4px;padding:14px 16px;margin:16px 0;">
        <h4 style="margin:0 0 6px;color:#1e1e1e;font-size:14px;">Changements</h4>
        ${changesList}
      </div>
      <div style="text-align:center;margin:24px 0;">
        <a href="${appUrl}" style="display:inline-block;background:#c4654a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Voir la feuille de route</a>
      </div>
      <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">Email automatique — Fatras.</p>
    </div>
  </div>
</body></html>`;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { Authorization: `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ from: 'Fatras <noreply@fatras.net>', to: [p.email], subject, html }),
        });
        if (res.ok) sent++; else console.error('Resend error:', await res.text());
      } catch (e) { console.error('Send error:', e); }
    }

    if (stopId && sent > 0 && !_test) {
      await supabase.from('roadshow_reminder_logs').insert({
        roadshow_stop_id: stopId, user_id: profiles[0].user_id, reminder_type: 'update',
      });
    }

    return new Response(JSON.stringify({ success: true, sent }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
