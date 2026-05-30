import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { userIds, stopId, city, venue, _test } = await req.json();

    const DEFAULT_CFG = {
      enabled: true,
      subject: '🎤 Invitation : {city} — {venue}',
      intro: "Vous avez été invité(e) à participer à la feuille de route ci-dessous. Veuillez prendre connaissance des détails et confirmer votre disponibilité dans l'application.",
    };
    const { data: cfgRow } = await supabase
      .from('app_settings').select('setting_value')
      .eq('setting_key', 'roadshow_email_invitation')
      .order('updated_at', { ascending: false }).limit(1).maybeSingle();
    let cfg = DEFAULT_CFG;
    if (cfgRow?.setting_value) { try { cfg = { ...DEFAULT_CFG, ...JSON.parse(cfgRow.setting_value) }; } catch {} }

    if (!cfg.enabled && !_test) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: "No userIds provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: stop } = stopId ? await supabase
      .from("roadshow_stops")
      .select("*")
      .eq("id", stopId)
      .single() : { data: null as any };

    const { data: profiles } = await supabase
      .from("user_profiles")
      .select("user_id, email, first_name, last_name, username")
      .in("user_id", userIds);

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No profiles found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const subjectLine = (cfg.subject || DEFAULT_CFG.subject)
      .replaceAll('{city}', city || '').replaceAll('{venue}', venue || '');
    const introText = cfg.intro || DEFAULT_CFG.intro;

    const formatTime = (t: string | null) => t || "—";
    const formatDate = (d: string | null) => {
      if (!d) return "—";
      const date = new Date(d + "T00:00:00");
      return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    };

    const shareUrl = `${supabaseUrl.replace('.supabase.co', '.supabase.co')}/functions/v1/get-roadsheet?id=${stopId}`;
    const appUrl = `https://fatras.lovable.app/feuille-de-route/${stopId}`;

    let emailsSent = 0;

    for (const profile of profiles) {
      if (!profile.email) continue;

      const firstName = profile.first_name || profile.username || "Équipier";

      const htmlContent = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 24px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">🎤 Nouvelle invitation</h1>
      <p style="color:#a0aec0;margin:8px 0 0;font-size:14px;">Feuille de route — ${city} / ${venue}</p>
    </div>
    <div style="padding:24px;">
      <p style="font-size:15px;color:#333;">Bonjour <strong>${firstName}</strong>,</p>
      <p style="font-size:14px;color:#555;line-height:1.6;">
        ${introText}
      </p>
      
      
      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
        <h3 style="margin:0 0 12px;color:#1a1a2e;font-size:16px;">📍 ${city} — ${venue}</h3>
        ${stop?.address ? `<p style="margin:4px 0;font-size:13px;color:#666;">Adresse : ${stop.address}</p>` : ""}
        ${stop?.event_date ? `<p style="margin:4px 0;font-size:13px;color:#666;">📅 Date : <strong>${formatDate(stop.event_date)}</strong></p>` : ""}
        ${stop?.event_time ? `<p style="margin:4px 0;font-size:13px;color:#666;">🕐 Heure : ${formatTime(stop.event_time)}</p>` : ""}
      </div>

      ${(stop?.meeting_point_time || stop?.soundcheck_time || stop?.show_start_time) ? `
      <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0;">
        <h4 style="margin:0 0 8px;color:#166534;font-size:14px;">⏰ Horaires</h4>
        ${stop?.meeting_point_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Rendez-vous : ${formatTime(stop.meeting_point_time)}${stop?.meeting_point_location ? ` (${stop.meeting_point_location})` : ""}</p>` : ""}
        ${stop?.departure_to_show_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Départ vers le lieu : ${formatTime(stop.departure_to_show_time)}</p>` : ""}
        ${stop?.check_in_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Check-in : ${formatTime(stop.check_in_time)}</p>` : ""}
        ${stop?.soundcheck_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Balance : ${formatTime(stop.soundcheck_time)}</p>` : ""}
        ${stop?.doors_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Ouverture portes : ${formatTime(stop.doors_time)}</p>` : ""}
        ${stop?.show_start_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Début show : ${formatTime(stop.show_start_time)}</p>` : ""}
        ${stop?.show_end_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Fin show : ${formatTime(stop.show_end_time)}</p>` : ""}
        ${stop?.curfew_time ? `<p style="margin:3px 0;font-size:13px;color:#555;">Couvre-feu : ${formatTime(stop.curfew_time)}</p>` : ""}
      </div>` : ""}

      ${(stop?.accommodation || stop?.transport) ? `
      <div style="background:#fef3c7;border-radius:8px;padding:16px;margin:16px 0;">
        <h4 style="margin:0 0 8px;color:#92400e;font-size:14px;">🏨 Logistique</h4>
        ${stop?.accommodation ? `<p style="margin:3px 0;font-size:13px;color:#555;">Hébergement : ${stop.accommodation}</p>` : ""}
        ${stop?.accommodation_address ? `<p style="margin:3px 0;font-size:13px;color:#555;">Adresse hébergement : ${stop.accommodation_address}</p>` : ""}
        ${stop?.transport ? `<p style="margin:3px 0;font-size:13px;color:#555;">Transport : ${stop.transport}</p>` : ""}
        ${stop?.local_contact ? `<p style="margin:3px 0;font-size:13px;color:#555;">Contact local : ${stop.local_contact}${stop?.local_contact_phone ? ` — ${stop.local_contact_phone}` : ""}</p>` : ""}
      </div>` : ""}

      <div style="text-align:center;margin:24px 0;">
        <a href="${appUrl}" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:bold;">
          Voir la feuille de route & confirmer
        </a>
      </div>

      <p style="font-size:12px;color:#999;text-align:center;margin-top:24px;">
        Cet email a été envoyé automatiquement depuis l'application Fatras.
      </p>
    </div>
  </div>
</body>
</html>`;

      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Fatras <noreply@fatras.net>",
            to: [profile.email],
            subject: `🎤 Invitation : ${city} — ${venue}`,
            html: htmlContent,
          }),
        });

        if (res.ok) {
          emailsSent++;
          console.log(`Invitation email sent to ${profile.email}`);
        } else {
          const errText = await res.text();
          console.error(`Failed to send to ${profile.email}:`, errText);
        }
      } catch (emailErr) {
        console.error(`Error sending to ${profile.email}:`, emailErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: emailsSent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
