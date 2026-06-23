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

const PAGE_SIZE = 1000;

async function fetchAllRows(table: string, selectFields: string, buildQuery: (query: any) => any): Promise<any[]> {
  const all: any[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await buildQuery(
      supabase.from(table).select(selectFields).range(from, from + PAGE_SIZE - 1),
    );
    if (error) throw error;
    const rows = data ?? [];
    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return all;
}

async function fetchListMembers(listIds: string[], selectFields: string): Promise<any[]> {
  if (!listIds.length) return [];
  return fetchAllRows("contact_list_members", selectFields, (query) => query.in("contact_list_id", listIds));
}

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

    // 2. Gather actual eligible recipients with the same rules used by send-campaign-emails
    const sourceIds: string[] = step.source_list_ids ?? [];
    const stepExcludedIds: string[] = step.excluded_list_ids ?? [];

    const { data: globalExcludeLists } = await supabase
      .from("contact_lists")
      .select("id")
      .eq("user_id", userId)
      .eq("is_exclusion", true);
    const globalExcludedIds = (globalExcludeLists ?? []).map((list: any) => list.id);
    const excludedListIds = Array.from(new Set([...stepExcludedIds, ...globalExcludedIds]));

    const excludedContactIds = new Set<string>();
    const excludedEmails = new Set<string>();
    const excludedMembers = await fetchListMembers(excludedListIds, "contact_id, contacts!inner(id, email)");
    for (const member of excludedMembers) {
      if (member.contacts?.id) excludedContactIds.add(member.contacts.id);
      if (member.contacts?.email) excludedEmails.add(String(member.contacts.email).toLowerCase());
    }

    // eslint-disable-next-line no-control-regex
    const isAsciiEmail = (email: string) => /^[\x00-\x7F]+$/.test(email);
    const sourceMembers = await fetchListMembers(
      sourceIds,
      "contact_id, contacts!inner(id, email, accepts_marketing_emails)",
    );
    const uniqueContacts = (sourceMembers ?? [])
      .filter((member: any) => {
        const contact = member.contacts;
        const email = contact?.email;
        if (!contact?.accepts_marketing_emails) return false;
        if (!email || !String(email).includes("@")) return false;
        if (!isAsciiEmail(String(email))) return false;
        if (excludedContactIds.has(contact.id)) return false;
        if (excludedEmails.has(String(email).toLowerCase())) return false;
        return true;
      })
      .map((member: any) => member.contacts)
      .filter((contact: any, index: number, self: any[]) =>
        index === self.findIndex((candidate: any) => candidate.email === contact.email),
      );

    // 3. Read all analytics for this campaign. Supabase defaults to 1,000 rows, so paginate.
    const analytics = await fetchAllRows(
      "email_analytics",
      "contact_id, event_type",
      (query) => query.eq("campaign_id", step.campaign_id).not("contact_id", "is", null),
    );

    const sent = new Set<string>();
    const bounced = new Set<string>();
    const opened = new Set<string>();
    const clicked = new Set<string>();
    for (const ev of analytics ?? []) {
      const cid = (ev as any).contact_id;
      if (!cid) continue;
      const type = (ev as any).event_type;
      if (type === "sent") sent.add(cid);
      if (type === "bounced" || type === "complained") bounced.add(cid);
      if (type === "opened") opened.add(cid);
      if (type === "clicked") { clicked.add(cid); opened.add(cid); }
    }

    const allRecipients = uniqueContacts.map((contact: any) => contact.id) as string[];
    const sentRecipients = allRecipients.filter((contactId) => sent.has(contactId));
    const segments: Record<string, string[]> = {
      bounced: sentRecipients.filter((c) => bounced.has(c)),
      clicked: sentRecipients.filter((c) => clicked.has(c) && !bounced.has(c)),
      opened: sentRecipients.filter((c) => opened.has(c) && !clicked.has(c) && !bounced.has(c)),
      not_opened: sentRecipients.filter((c) => !opened.has(c) && !clicked.has(c) && !bounced.has(c)),
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
