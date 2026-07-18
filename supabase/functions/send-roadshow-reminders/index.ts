import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_DAYS = [15, 7, 1];
const DEFAULT_CFG = {
  enabled: true,
  days: DEFAULT_DAYS,
  subjectTemplate: '🎤 Rappel : {city} – {venue} {daysLabel}',
  intro: 'Voici le récapitulatif de votre prochaine date {daysLabel} :',
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Load settings
    const { data: cfgRow } = await supabase
      .from('app_settings').select('setting_value')
      .eq('setting_key', 'roadshow_email_reminders')
      .order('updated_at', { ascending: false }).limit(1).maybeSingle();
    let cfg = DEFAULT_CFG;
    if (cfgRow?.setting_value) { try { cfg = { ...DEFAULT_CFG, ...JSON.parse(cfgRow.setting_value) }; } catch {} }

    if (!cfg.enabled) {
      return new Response(JSON.stringify({ skipped: true, reason: 'disabled' }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results: Array<{ stopId: string; city: string; reminderType: string; emailsSent: number }> = [];

    const reminderDays = Array.isArray(cfg.days) && cfg.days.length > 0 ? cfg.days : DEFAULT_DAYS;
    for (const days of reminderDays) {
      const targetDate = new Date(today);
      targetDate.setDate(targetDate.getDate() + days);
      const targetDateStr = targetDate.toISOString().split("T")[0];
      const reminderType = `j-${days}`;

      // Fetch roadshow stops matching this target date
      const { data: stops, error: stopsError } = await supabase
        .from("roadshow_stops")
        .select("id, city, venue, address, event_date, event_time, check_in_time, departure_time, meeting_point_time, meeting_point_location, departure_to_show_time, soundcheck_time, doors_time, show_start_time, show_end_time, curfew_time, meal_time, meal_location, accommodation, accommodation_address, transport, local_contact, local_contact_phone, artist_lineup, user_id, status")
        .eq("event_date", targetDateStr)
        .neq("status", "cancelled");

      if (stopsError) {
        console.error("Error fetching stops:", stopsError);
        continue;
      }

      if (!stops || stops.length === 0) continue;

      for (const stop of stops) {
        const lineup = stop.artist_lineup as Array<{ userId: string; confirmed: boolean }> | null;
        if (!lineup || lineup.length === 0) continue;

        const userIds = lineup.map((l) => l.userId);

        // Check which reminders have already been sent
        const { data: sentLogs } = await supabase
          .from("roadshow_reminder_logs")
          .select("user_id")
          .eq("roadshow_stop_id", stop.id)
          .eq("reminder_type", reminderType)
          .in("user_id", userIds);

        const alreadySentUserIds = new Set((sentLogs || []).map((l: any) => l.user_id));
        const usersToNotify = userIds.filter((uid) => !alreadySentUserIds.has(uid));

        if (usersToNotify.length === 0) continue;

        // Get user profiles for emails
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, email, first_name, last_name")
          .in("user_id", usersToNotify);

        if (!profiles || profiles.length === 0) continue;

        // Fetch attached documents for this stop
        const { data: docsRows } = await supabase
          .from('roadshow_documents')
          .select('file_name, file_path, category')
          .eq('roadshow_stop_id', stop.id)
          .order('created_at', { ascending: false });

        const documents = (docsRows || []).map((d: any) => {
          const { data: pub } = supabase.storage
            .from('roadshow-documents')
            .getPublicUrl(d.file_path);
          return { name: d.file_name, url: pub.publicUrl, category: d.category };
        });

        let emailsSent = 0;

        for (const profile of profiles) {
          if (!profile.email) continue;

          const shareUrl = `https://fatras.lovable.app/feuille-de-route/${stop.id}`;
          const userName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || "Membre de l'équipe";
          const eventDate = stop.event_date ? new Date(stop.event_date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date non définie";

          const daysLabel = days === 0 ? "aujourd'hui" : (days === 1 ? "demain" : `dans ${days} jours`);
          const subject = (cfg.subjectTemplate || DEFAULT_CFG.subjectTemplate)
            .replaceAll('{city}', stop.city || '')
            .replaceAll('{venue}', stop.venue || '')
            .replaceAll('{daysLabel}', daysLabel);
          const introLine = (cfg.intro || DEFAULT_CFG.intro).replaceAll('{daysLabel}', daysLabel);

          const html = buildEmailHtml({
            userName,
            city: stop.city,
            venue: stop.venue,
            address: stop.address,
            eventDate,
            eventTime: stop.event_time,
            checkInTime: stop.check_in_time,
            departureTime: stop.departure_time,
            departureToShowTime: stop.departure_to_show_time,
            curfewTime: stop.curfew_time,
            meetingPointTime: stop.meeting_point_time,
            meetingPointLocation: stop.meeting_point_location,
            soundcheckTime: stop.soundcheck_time,
            doorsTime: stop.doors_time,
            showStartTime: stop.show_start_time,
            showEndTime: stop.show_end_time,
            mealTime: stop.meal_time,
            mealLocation: stop.meal_location,
            accommodation: stop.accommodation,
            accommodationAddress: stop.accommodation_address,
            transport: stop.transport,
            localContact: stop.local_contact,
            localContactPhone: stop.local_contact_phone,
            shareUrl,
            daysLabel,
            introLine,
            documents,
          });

          // Send via Resend
          if (resendApiKey) {
            try {
              const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${resendApiKey}`,
                },
                body: JSON.stringify({
                  from: "Fatras <noreply@fatras.net>",
                  to: [profile.email],
                  subject,
                  html,
                }),
              });

              if (res.ok) {
                // Log the sent reminder
                await supabase.from("roadshow_reminder_logs").insert({
                  roadshow_stop_id: stop.id,
                  user_id: profile.user_id,
                  reminder_type: reminderType,
                });
                emailsSent++;
              } else {
                const errBody = await res.text();
                console.error(`Resend error for ${profile.email}:`, errBody);
              }
            } catch (emailErr) {
              console.error(`Failed to send to ${profile.email}:`, emailErr);
            }
          }
        }

        if (emailsSent > 0) {
          results.push({ stopId: stop.id, city: stop.city, reminderType, emailsSent });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Roadshow reminders error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

interface EmailParams {
  userName: string;
  city: string;
  venue: string;
  address: string | null;
  eventDate: string;
  eventTime: string | null;
  checkInTime: string | null;
  departureTime: string | null;
  departureToShowTime: string | null;
  curfewTime: string | null;
  meetingPointTime: string | null;
  meetingPointLocation: string | null;
  soundcheckTime: string | null;
  doorsTime: string | null;
  showStartTime: string | null;
  showEndTime: string | null;
  mealTime: string | null;
  mealLocation: string | null;
  accommodation: string | null;
  accommodationAddress: string | null;
  transport: string | null;
  localContact: string | null;
  localContactPhone: string | null;
  shareUrl: string;
  daysLabel: string;
  introLine: string;
  documents: Array<{ name: string; url: string; category: string }>;
}

function buildEmailHtml(p: EmailParams): string {
  const timeRow = (label: string, value: string | null) =>
    value ? `<tr><td style="padding:4px 12px;color:#666;font-size:14px;">${label}</td><td style="padding:4px 12px;font-weight:600;font-size:14px;">${value}</td></tr>` : "";

  const infoBlock = (label: string, value: string | null) =>
    value ? `<p style="margin:4px 0;font-size:14px;"><strong>${label} :</strong> ${value}</p>` : "";

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    
    <div style="background:linear-gradient(135deg,#1a1a2e,#16213e);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:22px;">🎤 Rappel Feuille de Route</h1>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:15px;">${p.city} – ${p.daysLabel}</p>
    </div>

    <div style="padding:24px;">
      <p style="font-size:15px;color:#333;">Bonjour ${p.userName},</p>
      <p style="font-size:15px;color:#333;">${p.introLine}</p>

      <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;border-left:4px solid #3b82f6;">
        <h2 style="margin:0 0 4px;font-size:18px;color:#1e293b;">${p.venue}</h2>
        ${p.address ? `<p style="margin:0;color:#64748b;font-size:14px;">📍 ${p.address}</p>` : ""}
        <p style="margin:4px 0 0;color:#64748b;font-size:14px;">📅 ${p.eventDate}${p.eventTime ? ` à ${p.eventTime}` : ""}</p>
      </div>

      <h3 style="margin:20px 0 8px;font-size:16px;color:#1e293b;">⏰ Horaires</h3>
      <table style="width:100%;border-collapse:collapse;">
        ${timeRow("Rendez-vous équipe", p.meetingPointTime)}
        ${timeRow("Départ vers le lieu", p.departureToShowTime)}
        ${timeRow("Arrivée / Check-in", p.checkInTime)}
        ${timeRow("Balance", p.soundcheckTime)}
        ${timeRow("Ouverture portes", p.doorsTime)}
        ${timeRow("Début show", p.showStartTime)}
        ${timeRow("Fin show", p.showEndTime)}
        ${timeRow("Couvre-feu", p.curfewTime)}
        ${p.mealTime ? timeRow("🍽️ Repas", p.mealTime + (p.mealLocation ? ' - ' + p.mealLocation : '')) : ''}
        ${timeRow("Départ retour", p.departureTime)}
      </table>

      ${(p.accommodation || p.transport || p.localContact) ? `
      <h3 style="margin:20px 0 8px;font-size:16px;color:#1e293b;">🏨 Logistique</h3>
      <div style="background:#f0fdf4;border-radius:8px;padding:12px 16px;">
        ${infoBlock("Hébergement", p.accommodation)}
        ${infoBlock("Adresse hébergement", p.accommodationAddress)}
        ${infoBlock("Transport", p.transport)}
        ${infoBlock("Contact local", p.localContact)}
        ${infoBlock("Téléphone", p.localContactPhone)}
        ${p.meetingPointLocation ? infoBlock("Lieu de RDV", p.meetingPointLocation) : ""}
      </div>
      ` : ""}

      <div style="text-align:center;margin:28px 0 16px;">
        <a href="${p.shareUrl}" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:15px;font-weight:600;">
          📋 Voir la feuille de route complète
        </a>
      </div>

      <p style="font-size:13px;color:#94a3b8;text-align:center;margin-top:20px;">
        Cet email a été envoyé automatiquement par Fatras.
      </p>
    </div>
  </div>
</body>
</html>`;
}
