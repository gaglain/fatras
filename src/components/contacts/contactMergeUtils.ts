import { supabase } from '@/integrations/supabase/client';
import { Contact } from '@/types/contact.types';

const MERGE_FIELDS = [
  'first_name', 'last_name', 'email', 'phone', 'position', 'company',
  'address', 'city', 'postal_code', 'country', 'status', 'source', 'notes', 'role',
] as const;

/**
 * Smart-merge a group of duplicate contacts.
 * - Keeps the most recently updated contact as primary
 * - For each field, picks the first non-empty value (newest first)
 * - Merges tags
 * - Reassigns relationships from secondaries to primary
 * - Deletes secondaries
 */
export async function smartMergeContacts(contacts: Contact[]): Promise<void> {
  if (contacts.length < 2) return;

  const sorted = [...contacts].sort((a, b) => {
    const da = a.updated_at || a.created_at || '';
    const db = b.updated_at || b.created_at || '';
    return db.localeCompare(da);
  });

  const primary = sorted[0];
  const secondaryIds = sorted.slice(1).map(c => c.id!).filter(Boolean);

  const merged: Record<string, any> = {};
  for (const field of MERGE_FIELDS) {
    const found = sorted.find(c => {
      const v = (c as any)[field];
      return v !== undefined && v !== null && v !== '';
    });
    merged[field] = found ? (found as any)[field] : null;
  }
  const allTags = new Set<string>();
  for (const c of sorted) (c.tags || []).forEach(t => allTags.add(t));
  merged.tags = Array.from(allTags);

  const { error: updateError } = await supabase
    .from('contacts')
    .update(merged)
    .eq('id', primary.id!);
  if (updateError) throw updateError;

  const reassignJoin = async (
    table: 'contact_events' | 'contact_artists' | 'contact_opportunities' | 'contact_quotes' | 'contact_list_members',
    extraCol: string,
  ) => {
    for (const secId of secondaryIds) {
      const { data } = await supabase.from(table).select(`${extraCol}`).eq('contact_id', secId);
      if (data?.length) {
        await supabase.from(table).delete().eq('contact_id', secId);
        for (const row of data) {
          const payload: any = { contact_id: primary.id!, [extraCol]: (row as any)[extraCol] };
          const { error } = await supabase.from(table).insert(payload);
          if (error && !error.message?.includes('duplicate')) {
            console.warn(`[BulkMerge] ${table} insert warning:`, error.message);
          }
        }
      }
    }
  };

  await reassignJoin('contact_events', 'event_id');
  await reassignJoin('contact_artists', 'artist_id');
  await reassignJoin('contact_opportunities', 'opportunity_id');
  await reassignJoin('contact_quotes', 'quote_id');
  await reassignJoin('contact_list_members', 'contact_list_id');

  for (const secId of secondaryIds) {
    await supabase.from('emails').update({ contact_id: primary.id! }).eq('contact_id', secId);
    await supabase.from('interactions').update({ contact_id: primary.id! }).eq('contact_id', secId);
    await supabase.from('tasks').update({ contact_id: primary.id! }).eq('contact_id', secId);
  }

  const { error: deleteError } = await supabase
    .from('contacts')
    .delete()
    .in('id', secondaryIds);
  if (deleteError) throw deleteError;
}
