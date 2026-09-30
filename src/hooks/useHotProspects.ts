import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Contact } from '@/types/contact.types';

export interface HotProspect {
  contact: Contact;
  lastEngagementAt: string;
  engagement: 'opened' | 'clicked';
  subject: string | null;
}

const WINDOW_HOURS = 48;

/**
 * Contacts who opened or clicked one of our emails in the last 48h
 * and have not replied since — the best moment to call them.
 */
export const useHotProspects = () => {
  const { user } = useAuth();
  const [hotProspects, setHotProspects] = useState<HotProspect[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      setHotProspects([]);
      return;
    }
    setLoading(true);
    try {
      const since = new Date(Date.now() - WINDOW_HOURS * 3600 * 1000).toISOString();

      const { data: engaged } = await supabase
        .from('emails')
        .select('id, contact_id, to_email, subject, opened_at, status')
        .eq('direction', 'sent')
        .not('opened_at', 'is', null)
        .gte('opened_at', since)
        .order('opened_at', { ascending: false })
        .limit(500);

      if (!engaged || engaged.length === 0) {
        setHotProspects([]);
        return;
      }

      // Keep the most recent engagement per contact / address
      const best = new Map<string, { opened_at: string; subject: string | null; status: string | null; contact_id: string | null; to_email: string | null }>();
      for (const row of engaged) {
        const key = (row.contact_id || row.to_email || '').toLowerCase();
        if (!key) continue;
        const existing = best.get(key);
        if (!existing || (row.opened_at || '') > existing.opened_at) {
          best.set(key, {
            opened_at: row.opened_at as string,
            subject: row.subject ?? null,
            status: row.status ?? null,
            contact_id: row.contact_id ?? null,
            to_email: row.to_email ?? null,
          });
        }
      }

      const contactIds = Array.from(new Set(Array.from(best.values()).map(v => v.contact_id).filter(Boolean) as string[]));
      const emailAddresses = Array.from(new Set(
        Array.from(best.values()).filter(v => !v.contact_id && v.to_email).map(v => (v.to_email as string).toLowerCase())
      ));

      // Resolve contacts, by id then by address
      const contactsById = new Map<string, Contact>();
      if (contactIds.length > 0) {
        const { data } = await supabase.from('contacts').select('*').in('id', contactIds);
        (data || []).forEach((c: any) => contactsById.set(c.id, c as Contact));
      }
      const contactsByEmail = new Map<string, Contact>();
      if (emailAddresses.length > 0) {
        const { data } = await supabase.from('contacts').select('*').in('email', emailAddresses);
        (data || []).forEach((c: any) => { if (c.email) contactsByEmail.set(String(c.email).toLowerCase(), c as Contact); });
      }

      // Exclude contacts who already replied after engaging
      const allIds = Array.from(new Set([
        ...contactIds,
        ...Array.from(contactsByEmail.values()).map(c => c.id!).filter(Boolean),
      ]));
      const repliedAt = new Map<string, string>();
      if (allIds.length > 0) {
        const { data: replies } = await supabase
          .from('emails')
          .select('contact_id, received_at, created_at')
          .eq('direction', 'received')
          .in('contact_id', allIds)
          .gte('created_at', since);
        (replies || []).forEach((r: any) => {
          const when = r.received_at || r.created_at;
          if (!r.contact_id || !when) return;
          const prev = repliedAt.get(r.contact_id);
          if (!prev || when > prev) repliedAt.set(r.contact_id, when);
        });
      }

      const result: HotProspect[] = [];
      for (const entry of best.values()) {
        const contact = entry.contact_id
          ? contactsById.get(entry.contact_id)
          : contactsByEmail.get((entry.to_email || '').toLowerCase());
        if (!contact?.id) continue;
        const reply = repliedAt.get(contact.id);
        if (reply && reply > entry.opened_at) continue;
        result.push({
          contact,
          lastEngagementAt: entry.opened_at,
          engagement: entry.status === 'clicked' ? 'clicked' : 'opened',
          subject: entry.subject,
        });
      }

      result.sort((a, b) => (a.lastEngagementAt < b.lastEngagementAt ? 1 : -1));
      setHotProspects(result);
    } catch {
      setHotProspects([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  return { hotProspects, loading, refresh };
};
