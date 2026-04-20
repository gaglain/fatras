import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { RoadshowEntityConnection } from './useRoadshowEntityConnections';

interface ContactLink {
  id: string;
  contact_id: string;
  role?: string;
  contacts: { id: string; first_name: string; last_name: string; email?: string; company?: string } | null;
}
interface EventLink {
  id: string;
  event_id: string;
  events: { id: string; title: string; start_date?: string; venue?: string } | null;
}
interface QuoteLink {
  id: string;
  quote_id: string;
  quotes: { id: string; quote_number: string; title: string; total_amount: number; status?: string } | null;
}
interface ContractLink { id: string; contract_id: string; }

export async function fetchRoadshowConnections(roadshowStopId: string) {
  const [contactRes, eventRes, quoteRes, contractRes] = await Promise.all([
    supabase.from('roadshow_stop_contacts').select('id, contact_id, role, contacts (id, first_name, last_name, email, company)').eq('roadshow_stop_id', roadshowStopId),
    supabase.from('roadshow_stop_events').select('id, event_id, events (id, title, start_date, venue)').eq('roadshow_stop_id', roadshowStopId),
    supabase.from('roadshow_stop_quotes').select('id, quote_id, quotes (id, quote_number, title, total_amount, status)').eq('roadshow_stop_id', roadshowStopId),
    supabase.from('roadshow_stop_contracts').select('id, contract_id').eq('roadshow_stop_id', roadshowStopId),
  ]);

  if (contactRes.error) logger.warn('roadshow_stop_contacts error:', contactRes.error.message);
  if (eventRes.error) logger.warn('roadshow_stop_events error:', eventRes.error.message);
  if (quoteRes.error) logger.warn('roadshow_stop_quotes error:', quoteRes.error.message);
  if (contractRes.error) logger.warn('roadshow_stop_contracts error:', contractRes.error.message);

  let contacts: RoadshowEntityConnection[] = ((contactRes.data || []) as ContactLink[]).map(link => ({
    id: link.id, entityId: link.contact_id, entityType: 'contact',
    title: link.contacts ? `${link.contacts.first_name} ${link.contacts.last_name}${link.contacts.company ? ` (${link.contacts.company})` : ''}` : 'Contact inconnu',
    role: link.role,
  }));

  let events: RoadshowEntityConnection[] = ((eventRes.data || []) as EventLink[]).map(link => ({
    id: link.id, entityId: link.event_id, entityType: 'event', title: link.events?.title || 'Événement inconnu',
  }));

  let quotes: RoadshowEntityConnection[] = ((quoteRes.data || []) as QuoteLink[]).map(link => ({
    id: link.id, entityId: link.quote_id, entityType: 'quote',
    title: link.quotes?.title || (link.quotes ? `Devis ${link.quotes.quote_number}` : 'Devis inconnu'),
  }));

  const contracts: RoadshowEntityConnection[] = ((contractRes.data || []) as ContractLink[]).map(link => ({
    id: link.id, entityId: link.contract_id, entityType: 'contract', title: `Contrat ${link.contract_id.substring(0, 8)}`,
  }));

  // Augment with implicit links
  const { data: stopRow } = await supabase.from('roadshow_stops').select('id, quote_id, opportunity_id').eq('id', roadshowStopId).maybeSingle();

  if (stopRow?.quote_id) {
    const { data: directQuote } = await supabase.from('quotes').select('id, quote_number, total_amount').eq('id', stopRow.quote_id).maybeSingle();
    quotes.push({
      id: `rsq_${stopRow.quote_id}`, entityId: directQuote?.id || stopRow.quote_id, entityType: 'quote',
      title: directQuote ? `Devis ${directQuote.quote_number} - ${directQuote.total_amount}€` : `Devis lié (${String(stopRow.quote_id).slice(0, 8)}…)`,
    });
  }

  let opportunityId: string | null = stopRow?.opportunity_id || null;
  if (!opportunityId) {
    const { data: roMap } = await supabase.from('roadshow_opportunities').select('opportunity_id').eq('roadshow_stop_id', roadshowStopId).maybeSingle();
    opportunityId = roMap?.opportunity_id || null;
  }

  if (opportunityId) {
    const { data: oppContacts } = await supabase.from('contact_opportunities').select('role, contacts (id, first_name, last_name, company)').eq('opportunity_id', opportunityId);
    type OC = { role?: string; contacts: { id: string; first_name: string; last_name: string; company?: string } | null };
    if (oppContacts) {
      contacts.push(...(oppContacts as OC[]).filter(c => c.contacts).map(c => ({
        id: `opc_${c.contacts!.id}`, entityId: c.contacts!.id, entityType: 'contact' as const,
        title: `${c.contacts!.first_name} ${c.contacts!.last_name}${c.contacts!.company ? ` (${c.contacts!.company})` : ''}`,
        role: c.role || undefined,
      })));
    }

    const { data: oppEvents } = await supabase.from('opportunity_events').select('events (id, title)').eq('opportunity_id', opportunityId);
    type OE = { events: { id: string; title: string } | null };
    const oppEventIds = ((oppEvents || []) as OE[]).map(e => e.events?.id).filter(Boolean) as string[];
    if (oppEvents) {
      events.push(...(oppEvents as OE[]).filter(e => e.events).map(e => ({
        id: `ope_${e.events!.id}`, entityId: e.events!.id, entityType: 'event' as const, title: e.events!.title || 'Événement',
      })));
    }

    const { data: oppQuotes } = await supabase.from('quote_opportunities').select('quotes (id, quote_number, total_amount)').eq('opportunity_id', opportunityId);
    type OQ = { quotes: { id: string; quote_number: string; total_amount: number } | null };
    if (oppQuotes && oppQuotes.length > 0) {
      quotes.push(...(oppQuotes as OQ[]).map(q => q.quotes).filter((q): q is NonNullable<typeof q> => q !== null).map(q => ({
        id: `opq_${q.id}`, entityId: q.id, entityType: 'quote' as const, title: `Devis ${q.quote_number} - ${q.total_amount}€`,
      })));
    } else if (oppEventIds.length > 0) {
      const { data: evQuotes } = await supabase.from('quotes').select('id, quote_number, total_amount, event_id').in('event_id', oppEventIds);
      type EQ = { id: string; quote_number: string; total_amount: number };
      if (evQuotes) {
        quotes.push(...(evQuotes as EQ[]).map(q => ({
          id: `evq_${q.id}`, entityId: q.id, entityType: 'quote' as const, title: `Devis ${q.quote_number} - ${q.total_amount}€`,
        })));
      }
    }
  }

  const uniqBy = <T extends RoadshowEntityConnection>(arr: T[]) => Array.from(new Map(arr.map(i => [i.entityId, i])).values());
  return { contacts: uniqBy(contacts), events: uniqBy(events), quotes: uniqBy(quotes), contracts };
}
