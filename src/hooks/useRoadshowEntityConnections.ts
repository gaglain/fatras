import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
      // Fetch connected contacts
      const { data: contactLinks, error: contactError } = await supabase
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

      if (contactError) throw contactError;

      // Fetch connected events
      const { data: eventLinks, error: eventError } = await supabase
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

      if (eventError) throw eventError;

      // Fetch connected quotes
      const { data: quoteLinks, error: quoteError } = await supabase
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

      if (quoteError) throw quoteError;

      // Fetch connected contracts
      const { data: contractLinks, error: contractError } = await supabase
        .from('roadshow_stop_contracts')
        .select(`
          id,
          contract_id
        `)
        .eq('roadshow_stop_id', roadshowStopId);

      if (contractError) throw contractError;

      // Transform to standardized format
      const contacts: RoadshowEntityConnection[] = (contactLinks || []).map((link: any) => ({
        id: link.id,
        entityId: link.contact_id,
        entityType: 'contact' as const,
        title: link.contacts 
          ? `${link.contacts.first_name} ${link.contacts.last_name}${link.contacts.company ? ` (${link.contacts.company})` : ''}`
          : 'Contact inconnu',
        role: link.role
      }));

      const events: RoadshowEntityConnection[] = (eventLinks || []).map((link: any) => ({
        id: link.id,
        entityId: link.event_id,
        entityType: 'event' as const,
        title: link.events?.title || 'Événement inconnu'
      }));

      const quotes: RoadshowEntityConnection[] = (quoteLinks || []).map((link: any) => ({
        id: link.id,
        entityId: link.quote_id,
        entityType: 'quote' as const,
        title: link.quotes 
          ? `Devis ${link.quotes.quote_number} - ${link.quotes.total_amount}€`
          : 'Devis inconnu'
      }));

      const contracts: RoadshowEntityConnection[] = (contractLinks || []).map((link: any) => ({
        id: link.id,
        entityId: link.contract_id,
        entityType: 'contract' as const,
        title: `Contrat ${link.contract_id.substring(0, 8)}`
      }));

      return { contacts, events, quotes, contracts };
    } catch (error) {
      console.error('Error fetching roadshow connections:', error);
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
      console.error('Error linking contact:', error);
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
      console.error('Error linking event:', error);
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
      console.error('Error linking quote:', error);
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
      console.error('Error linking contract:', error);
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
      console.error('Error unlinking entity:', error);
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
      console.error('Error linking opportunity entities:', error);
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
