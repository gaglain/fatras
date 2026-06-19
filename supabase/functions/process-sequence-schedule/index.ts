import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const nowIso = new Date().toISOString();
    const { data: steps, error } = await supabase
      .from("email_sequence_steps")
      .select("id, campaign_id, source_list_ids, excluded_list_ids, status, scheduled_at")
      .in("status", ["draft", "ready"])
      .not("scheduled_at", "is", null)
      .lte("scheduled_at", nowIso);
    if (error) throw error;

    const results: any[] = [];
    for (const step of steps || []) {
      if (!step.campaign_id) {
        results.push({ id: step.id, skipped: "no campaign linked" });
        continue;
      }
      try {
        // Sync lists -> campaign
        await supabase.from("campaign_contact_lists").delete().eq("campaign_id", step.campaign_id);
        const rows = [
          ...((step.source_list_ids as string[]) || []).map((id) => ({ campaign_id: step.campaign_id, contact_list_id: id, kind: "include" })),
          ...((step.excluded_list_ids as string[]) || []).map((id) => ({ campaign_id: step.campaign_id, contact_list_id: id, kind: "exclude" })),
        ];
        if (rows.length > 0) {
          await supabase.from("campaign_contact_lists").insert(rows);
        }

        await supabase
          .from("email_sequence_steps")
          .update({ status: "sending", sent_at: new Date().toISOString() })
          .eq("id", step.id);

        const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-campaign-emails`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_ROLE}`,
            apikey: SERVICE_ROLE,
          },
          body: JSON.stringify({ campaignId: step.campaign_id }),
        });
        const body = await resp.json().catch(() => ({}));
        if (!resp.ok) {
          await supabase.from("email_sequence_steps").update({ status: "ready" }).eq("id", step.id);
          results.push({ id: step.id, ok: false, body });
        } else {
          await supabase.from("email_sequence_steps").update({ status: "sent", scheduled_at: null }).eq("id", step.id);
          results.push({ id: step.id, ok: true });
        }
      } catch (e: any) {
        results.push({ id: step.id, ok: false, error: e.message });
      }
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
