import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const BATCH = 25;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (b: unknown, status = 200) =>
    new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const { data: due, error } = await supabase
      .from("email_followups")
      .select("*")
      .eq("status", "pending")
      .lte("send_at", new Date().toISOString())
      .order("send_at")
      .limit(BATCH);
    if (error) throw error;

    const results: unknown[] = [];
    for (const f of due || []) {
      // Claim the row (single-flight): only proceed if still pending
      const { data: claimed } = await supabase
        .from("email_followups")
        .update({ status: "processing", updated_at: new Date().toISOString() })
        .eq("id", f.id).eq("status", "pending").select("id");
      if (!claimed?.length) continue;

      // Cancel if the recipient replied since the original was sent
      const { count } = await supabase
        .from("emails")
        .select("id", { count: "exact", head: true })
        .eq("direction", "received")
        .ilike("from_email", f.to_email)
        .gt("created_at", f.created_at);
      if ((count ?? 0) > 0) {
        await supabase.from("email_followups")
          .update({ status: "cancelled", error: "Réponse reçue", updated_at: new Date().toISOString() })
          .eq("id", f.id);
        results.push({ id: f.id, cancelled: true });
        continue;
      }

      const from = `Fatras <${f.from_email || "booking@fatras.net"}>`;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [f.to_email], subject: f.subject, html: f.html_content }),
      });
      const body = await res.text();
      if (!res.ok) {
        console.error(`Resend failed [${res.status}]: ${body}`);
        await supabase.from("email_followups")
          .update({ status: "failed", error: `[${res.status}] ${body}`.slice(0, 1000), updated_at: new Date().toISOString() })
          .eq("id", f.id);
        results.push({ id: f.id, failed: res.status });
        if (res.status === 429 || res.status === 401 || res.status === 403) break;
        continue;
      }

      const now = new Date().toISOString();
      await supabase.from("email_followups")
        .update({ status: "sent", sent_at: now, updated_at: now }).eq("id", f.id);
      await supabase.from("emails").insert({
        user_id: f.user_id, to_email: f.to_email, from_email: f.from_email, subject: f.subject,
        content: f.html_content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
        html_content: f.html_content, direction: "sent", status: "sent", sent_at: now,
        contact_id: f.contact_id, provider: "resend",
        metadata: { kind: "followup", followup_id: f.id, in_reply_to_email_id: f.original_email_id },
      });
      results.push({ id: f.id, sent: true });
    }
    return json({ processed: results.length, results });
  } catch (e) {
    console.error(e);
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
