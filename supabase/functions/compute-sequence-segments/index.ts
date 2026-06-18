import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.9";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { stepId } = await req.json();
    if (!stepId) throw new Error("stepId required");

    // 1. Load the step
    const { data: step, error: stepErr } = await supabase
      .from("email_sequence_steps")
      .select("*, email_sequences!inner(user_id, name)")
      .eq("id", stepId)
      .single();
    if (stepErr || !step) throw new Error("Step not found: " + stepErr?.message);
    if (!step.campaign_id) throw new Error("Step has no campaign attached");

    const userId = (step as any).email_sequences.user_id;
    const sequenceName = (step as any).email_sequences.name;

    // 2. Gather all recipient contacts (from source lists minus excluded)
    const sourceIds: string[] = step.source_list_ids ?? [];
    const excludedIds: string[] = step.excluded_list_ids ?? [];

    const { data: sourceMembers } = await supabase
      .from("contact_list_members")
      .select("contact_id")
      .in("contact_list_id", sourceIds.length ? sourceIds : ["00000000-0000-0000-0000-000000000000"]);
    const sourceContactIds = new Set((sourceMembers ?? []).map((m: any) => m.contact_id));

    if (excludedIds.length) {
      const { data: exMembers } = await supabase
        .from("contact_list_members")
        .select("contact_id")
        .in("contact_list_id", excludedIds);
      for (const m of exMembers ?? []) sourceContactIds.delete((m as any).contact_id);
    }

    // 3. Read analytics for this campaign
    const { data: analytics } = await supabase
      .from("email_analytics")
      .select("contact_id, event_type")
      .eq("campaign_id", step.campaign_id);

    const bounced = new Set<string>();
    const opened = new Set<string>();
    const clicked = new Set<string>();
    for (const ev of analytics ?? []) {
      const cid = (ev as any).contact_id;
      if (!cid) continue;
      const type = (ev as any).event_type;
      if (type === "bounced" || type === "complained") bounced.add(cid);
      if (type === "opened") opened.add(cid);
      if (type === "clicked") { clicked.add(cid); opened.add(cid); }
    }

    const allRecipients = Array.from(sourceContactIds) as string[];
    const segments: Record<string, string[]> = {
      bounced: allRecipients.filter((c) => bounced.has(c)),
      clicked: allRecipients.filter((c) => clicked.has(c)),
      opened: allRecipients.filter((c) => opened.has(c) && !clicked.has(c) && !bounced.has(c)),
      not_opened: allRecipients.filter((c) => !opened.has(c) && !bounced.has(c)),
    };

    // 4. Create / update lists for each segment
    const results: any[] = [];
    for (const [segType, contactIds] of Object.entries(segments)) {
      // Upsert segment row to know if list already exists
      const { data: existing } = await supabase
        .from("email_sequence_segments")
        .select("id, list_id")
        .eq("step_id", stepId)
        .eq("segment_type", segType)
        .maybeSingle();

      let listId = existing?.list_id;

      if (!listId) {
        const listName = `[Seq: ${sequenceName}] ${step.name} – ${segType}`;
        const { data: newList, error: listErr } = await supabase
          .from("contact_lists")
          .insert({ user_id: userId, name: listName, description: `Auto-généré (séquence emailing)` })
          .select()
          .single();
        if (listErr) throw new Error("Failed to create list: " + listErr.message);
        listId = newList.id;
      } else {
        // Wipe existing membership
        await supabase.from("contact_list_members").delete().eq("contact_list_id", listId);
      }

      if (contactIds.length) {
        const rows = contactIds.map((cid) => ({ contact_list_id: listId!, contact_id: cid }));
        // chunk inserts
        for (let i = 0; i < rows.length; i += 500) {
          await supabase.from("contact_list_members").insert(rows.slice(i, i + 500));
        }
      }

      await supabase.from("email_sequence_segments").upsert({
        step_id: stepId,
        segment_type: segType,
        list_id: listId,
        contact_count: contactIds.length,
      }, { onConflict: "step_id,segment_type" });

      results.push({ segment_type: segType, count: contactIds.length, list_id: listId });
    }

    await supabase.from("email_sequence_steps").update({
      status: "segmented",
      segmented_at: new Date().toISOString(),
    }).eq("id", stepId);

    return new Response(JSON.stringify({ success: true, segments: results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    console.error("compute-sequence-segments error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
