import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

interface ContactLink {
  id: string;
  contact_id: string;
  role?: string;
  contacts: {
    id: string;
    first_name: string;
    last_name: string;
    email?: string;
    company?: string;
  } | null;
}

interface EventLink {
  id: string;
  event_id: string;
  events: {
    id: string;
    title: string;
    start_date?: string;
    venue?: string;
  } | null;
}

interface QuoteLink {
  id: string;
  quote_id: string;
  quotes: {
    id: string;
    quote_number: string;
    total_amount: number;
    status?: string;
  } | null;
}

interface ContractLink {
  id: string;
  contract_id: string;
}
export interface RoadshowEntityConnection {
  id: string;
  entityId: string;
  entityType: 'contact' | 'event' | 'quote' | 'contract';
  title: string;
  role?: string;
}

export const useRoadshowEntityConnections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Fetch all entities connected to a roadshow stop
  const getRoadshowConnections = async (roadshowStopId: string) => {
    if (!user) return { contacts: [], events: [], quotes: [], contracts: [] };

    setLoading(true);
    try {
      // Fetch connected contacts (non-bloquant)
      const { data: contactLinksRaw, error: contactError } = await supabase
        .from('roadshow_stop_contacts')
        .select(`
          id,
          contact_id,
          role,
          contacts (
            id,
            first_name,
            last_name,
            email,
            company
          )
        `)
        .eq('roadshow_stop_id', roadshowStopId);

      const contactLinks = (contactLinksRaw || []) as ContactLink[];
      if (contactError) {
        logger.warn('roadshow_stop_contacts select error:', contactError.message || contactError);
      }

      // Fetch connected events (non-bloquant)
      const { data: eventLinksRaw, error: eventError } = await supabase
        .from('roadshow_stop_events')
        .select(`
          id,
          event_id,
          events (
            id,
            title,
            start_date,
            venue
          )
        `)
        .eq('roadshow_stop_id', roadshowStopId);

      const eventLinks = (eventLinksRaw || []) as EventLink[];
      if (eventError) {
        logger.warn('roadshow_stop_events select error:', eventError.message || eventError);
      }

      // Fetch connected quotes (non-bloquant)
      const { data: quoteLinksRaw, error: quoteError } = await supabase
        .from('roadshow_stop_quotes')
        .select(`
          id,
          quote_id,
          quotes (
            id,
            quote_number,
            total_amount,
            status
          )
        `)
        .eq('roadshow_stop_id', roadshowStopId);

      const quoteLinks = (quoteLinksRaw || []) as QuoteLink[];
      if (quoteError) {
        logger.warn('roadshow_stop_quotes select error:', quoteError.message || quoteError);
      }

      // Fetch connected contracts (non-bloquant)
      const { data: contractLinksRaw, error: contractError } = await supabase
        .from('roadshow_stop_contracts')
        .select(`
          id,
          contract_id
        `)
        .eq('roadshow_stop_id', roadshowStopId);

      const contractLinks = (contractLinksRaw || []) as ContractLink[];
      if (contractError) {
        logger.warn('roadshow_stop_contracts select error:', contractError.message || contractError);
      }

      // Start building result arrays from direct roadshow_stop_* tables
      let contacts: RoadshowEntityConnection[] = contactLinks.map((link) => ({
        id: link.id,
        entityId: link.contact_id,
        entityType: 'contact' as const,
        title: link.contacts 
          ? `${link.contacts.first_name} ${link.contacts.last_name}${link.contacts.company ? ` (${link.contacts.company})` : ''}`
          : 'Contact inconnu',
        role: link.role
      }));

      let events: RoadshowEntityConnection[] = eventLinks.map((link) => ({
        id: link.id,
        entityId: link.event_id,
        entityType: 'event' as const,
        title: link.events?.title || 'Événement inconnu'
      }));

      let quotes: RoadshowEntityConnection[] = quoteLinks.map((link) => ({
        id: link.id,
        entityId: link.quote_id,
        entityType: 'quote' as const,
        title: link.quotes 
          ? `Devis ${link.quotes.quote_number} - ${link.quotes.total_amount}€`
          : 'Devis inconnu'
      }));

      const contracts: RoadshowEntityConnection[] = contractLinks.map((link) => ({
        id: link.id,
        entityId: link.contract_id,
        entityType: 'contract' as const,
        title: `Contrat ${link.contract_id.substring(0, 8)}`
      }));

      // Augment with implicit links on the roadshow stop itself (quote_id, opportunity_id)
      const { data: stopRow } = await supabase
        .from('roadshow_stops')
        .select('id, quote_id, opportunity_id')
        .eq('id', roadshowStopId)
        .maybeSingle();

      // If the stop has a direct quote_id, include it
      if (stopRow?.quote_id) {
        const { data: directQuote, error: directQuoteError } = await supabase
          .from('quotes')
          .select('id, quote_number, total_amount')
          .eq('id', stopRow.quote_id)
          .maybeSingle();
        if (directQuote) {
          quotes.push({
            id: `rsq_${directQuote.id}`,
            entityId: directQuote.id,
            entityType: 'quote',
            title: `Devis ${directQuote.quote_number} - ${directQuote.total_amount}€`
          });
        } else {
          // Fallback: afficher un indicateur même si le devis n'est pas lisible (RLS) ou manquant
          quotes.push({
            id: `rsq_${stopRow.quote_id}`,
            entityId: stopRow.quote_id,
            entityType: 'quote',
            title: `Devis lié (${String(stopRow.quote_id).slice(0, 8)}…)`
          });
        }
      }

      // Resolve opportunity id: direct column or via mapping table
      let opportunityId: string | null = stopRow?.opportunity_id || null;
      if (!opportunityId) {
        const { data: roMap } = await supabase
          .from('roadshow_opportunities')
          .select('opportunity_id')
          .eq('roadshow_stop_id', roadshowStopId)
          .maybeSingle();
        opportunityId = roMap?.opportunity_id || null;
      }

      if (opportunityId) {
        // Contacts from opportunity
        const { data: oppContacts } = await supabase
          .from('contact_opportunities')
          .select(`role, contacts (id, first_name, last_name, company)`) 
          .eq('opportunity_id', opportunityId);
        if (oppContacts) {
          type OppContact = { role?: string; contacts: { id: string; first_name: string; last_name: string; company?: string } | null };
          contacts.push(
            ...(oppContacts as OppContact[])
              .filter((c) => c.contacts)
              .map((c) => ({
                id: `opc_${c.contacts!.id}`,
                entityId: c.contacts!.id,
                entityType: 'contact' as const,
                title: `${c.contacts!.first_name} ${c.contacts!.last_name}${c.contacts!.company ? ` (${c.contacts!.company})` : ''}`,
                role: c.role || undefined,
              }))
          );
        }

        // Events from opportunity
        const { data: oppEvents } = await supabase
          .from('opportunity_events')
          .select(`events (id, title)`) 
          .eq('opportunity_id', opportunityId);
        type OppEvent = { events: { id: string; title: string } | null };
        const oppEventIds = ((oppEvents || []) as OppEvent[])
          .map((e) => e.events?.id)
          .filter(Boolean);
        if (oppEvents) {
          events.push(
            ...((oppEvents as OppEvent[])
              .filter((e) => e.events)
              .map((e) => ({
                id: `ope_${e.events!.id}`,
                entityId: e.events!.id,
                entityType: 'event' as const,
                title: e.events!.title || 'Événement'
              })))
          );
        }

        // Quotes via quote_opportunities
        const { data: oppQuotes } = await supabase
          .from('quote_opportunities')
          .select(`quotes (id, quote_number, total_amount)`) 
          .eq('opportunity_id', opportunityId);
        type OppQuote = { quotes: { id: string; quote_number: string; total_amount: number } | null };
        if (oppQuotes && oppQuotes.length > 0) {
          const quoteData = (oppQuotes as OppQuote[])
            .map((q) => q.quotes)
            .filter((q): q is NonNullable<typeof q> => q !== null);
          quotes.push(
            ...quoteData.map((q) => ({
              id: `opq_${q.id}`,
              entityId: q.id,
              entityType: 'quote' as const,
              title: `Devis ${q.quote_number} - ${q.total_amount}€`
            }))
          );
        } else if (oppEventIds.length > 0) {
          // Fallback: quotes linked to collected event ids
          type EventQuote = { id: string; quote_number: string; total_amount: number; event_id: string };
          const { data: evQuotes } = await supabase
            .from('quotes')
            .select('id, quote_number, total_amount, event_id')
            .in('event_id', oppEventIds);
          if (evQuotes) {
            quotes.push(
              ...(evQuotes as EventQuote[]).map((q) => ({
                id: `evq_${q.id}`,
                entityId: q.id,
                entityType: 'quote' as const,
                title: `Devis ${q.quote_number} - ${q.total_amount}€`
              }))
            );
          }
        }
      }

      // Deduplicate by entityId for each type
      const uniqBy = <T extends RoadshowEntityConnection>(arr: T[]) =>
        Array.from(new Map(arr.map((i) => [i.entityId, i])).values());

      contacts = uniqBy(contacts);
      events = uniqBy(events);
      quotes = uniqBy(quotes);

      logger.debug('Roadshow connections for stop', roadshowStopId, { contacts: contacts.length, events: events.length, quotes: quotes.length, contracts: contracts.length });
      return { contacts, events, quotes, contracts };
    } catch (error) {
      logger.error('Error fetching roadshow connections:', error);
      return { contacts: [], events: [], quotes: [], contracts: [] };
    } finally {
      setLoading(false);
    }
  };

  // Link a contact to a roadshow stop
  const linkContact = async (roadshowStopId: string, contactId: string, role?: string) => {
    try {
      const { error } = await supabase
        .from('roadshow_stop_contacts')
        .insert({ roadshow_stop_id: roadshowStopId, contact_id: contactId, role });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error linking contact:', error);
      return false;
    }
  };

  // Link an event to a roadshow stop
  const linkEvent = async (roadshowStopId: string, eventId: string) => {
    try {
      const { error } = await supabase
        .from('roadshow_stop_events')
        .insert({ roadshow_stop_id: roadshowStopId, event_id: eventId });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error linking event:', error);
      return false;
    }
  };

  // Link a quote to a roadshow stop
  const linkQuote = async (roadshowStopId: string, quoteId: string) => {
    try {
      const { error } = await supabase
        .from('roadshow_stop_quotes')
        .insert({ roadshow_stop_id: roadshowStopId, quote_id: quoteId });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error linking quote:', error);
      return false;
    }
  };

  // Link a contract to a roadshow stop
  const linkContract = async (roadshowStopId: string, contractId: string) => {
    try {
      const { error } = await supabase
        .from('roadshow_stop_contracts')
        .insert({ roadshow_stop_id: roadshowStopId, contract_id: contractId });

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error linking contract:', error);
      return false;
    }
  };

  // Unlink any entity from a roadshow stop
  const unlinkEntity = async (linkId: string, entityType: 'contact' | 'event' | 'quote' | 'contract') => {
    try {
      let error;
      
      if (entityType === 'contact') {
        const result = await supabase.from('roadshow_stop_contacts').delete().eq('id', linkId);
        error = result.error;
      } else if (entityType === 'event') {
        const result = await supabase.from('roadshow_stop_events').delete().eq('id', linkId);
        error = result.error;
      } else if (entityType === 'quote') {
        const result = await supabase.from('roadshow_stop_quotes').delete().eq('id', linkId);
        error = result.error;
      } else if (entityType === 'contract') {
        const result = await supabase.from('roadshow_stop_contracts').delete().eq('id', linkId);
        error = result.error;
      }

      if (error) throw error;
      return true;
    } catch (error) {
      logger.error('Error unlinking entity:', error);
      return false;
    }
  };

  // Link entities from an opportunity to a roadshow stop
  const linkOpportunityEntities = async (roadshowStopId: string, opportunityId: string) => {
    if (!user) return false;

    try {
      // Get all entities linked to the opportunity
      const { data: opportunityContacts } = await supabase
        .from('contact_opportunities')
        .select('contact_id, role')
        .eq('opportunity_id', opportunityId);

      const { data: opportunityEvents } = await supabase
        .from('opportunity_events')
        .select('event_id')
        .eq('opportunity_id', opportunityId);

      // Link all contacts
      if (opportunityContacts && opportunityContacts.length > 0) {
        for (const contact of opportunityContacts) {
          await linkContact(roadshowStopId, contact.contact_id, contact.role || undefined);
        }
      }

      // Link all events
      if (opportunityEvents && opportunityEvents.length > 0) {
        for (const event of opportunityEvents) {
          await linkEvent(roadshowStopId, event.event_id);
        }
      }

      return true;
    } catch (error) {
      logger.error('Error linking opportunity entities:', error);
      return false;
    }
  };

  return {
    loading,
    getRoadshowConnections,
    linkContact,
    linkEvent,
    linkQuote,
    linkContract,
    unlinkEntity,
    linkOpportunityEntities
  };
};
