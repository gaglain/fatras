import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { fetchRoadshowConnections } from './useRoadshowConnectionsData';

const syncEventToNylas = async (eventId: string, trigger: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-event-to-nylas', {
      body: { event_id: eventId, trigger, grant_id_override: '1689aa22-c0cc-48b2-ac09-6f221aff790f' }
    });
    if (error) logger.warn('Nylas sync failed:', error);
    else if (data?.success) logger.info(`Nylas sync ${data.action}: event ${eventId}`);
  } catch (err) { logger.warn('Nylas sync error:', err); }
};

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

  const getRoadshowConnections = async (roadshowStopId: string) => {
    if (!user) return { contacts: [], events: [], quotes: [], contracts: [] };
    setLoading(true);
    try {
      const result = await fetchRoadshowConnections(roadshowStopId);
      logger.debug('Roadshow connections for stop', roadshowStopId, { contacts: result.contacts.length, events: result.events.length, quotes: result.quotes.length, contracts: result.contracts.length });
      return result;
    } catch (error) {
      logger.error('Error fetching roadshow connections:', error);
      return { contacts: [], events: [], quotes: [], contracts: [] };
    } finally { setLoading(false); }
  };

  const linkContact = async (roadshowStopId: string, contactId: string, role?: string) => {
    try { const { error } = await supabase.from('roadshow_stop_contacts').insert({ roadshow_stop_id: roadshowStopId, contact_id: contactId, role }); if (error) throw error; return true; } catch (error) { logger.error('Error linking contact:', error); return false; }
  };

  const linkEvent = async (roadshowStopId: string, eventId: string) => {
    try { const { error } = await supabase.from('roadshow_stop_events').insert({ roadshow_stop_id: roadshowStopId, event_id: eventId }); if (error) throw error; syncEventToNylas(eventId, 'route_sheet_linked'); return true; } catch (error) { logger.error('Error linking event:', error); return false; }
  };

  const linkQuote = async (roadshowStopId: string, quoteId: string) => {
    try { const { error } = await supabase.from('roadshow_stop_quotes').insert({ roadshow_stop_id: roadshowStopId, quote_id: quoteId }); if (error) throw error; return true; } catch (error) { logger.error('Error linking quote:', error); return false; }
  };

  const linkContract = async (roadshowStopId: string, contractId: string) => {
    try { const { error } = await supabase.from('roadshow_stop_contracts').insert({ roadshow_stop_id: roadshowStopId, contract_id: contractId }); if (error) throw error; return true; } catch (error) { logger.error('Error linking contract:', error); return false; }
  };

  const unlinkEntity = async (linkId: string, entityType: 'contact' | 'event' | 'quote' | 'contract') => {
    try {
      const table = entityType === 'contact' ? 'roadshow_stop_contacts' : entityType === 'event' ? 'roadshow_stop_events' : entityType === 'quote' ? 'roadshow_stop_quotes' : 'roadshow_stop_contracts';
      const { error } = await supabase.from(table).delete().eq('id', linkId);
      if (error) throw error; return true;
    } catch (error) { logger.error('Error unlinking entity:', error); return false; }
  };

  const linkOpportunityEntities = async (roadshowStopId: string, opportunityId: string) => {
    if (!user) return false;
    try {
      const [{ data: oppContacts }, { data: oppEvents }] = await Promise.all([
        supabase.from('contact_opportunities').select('contact_id, role').eq('opportunity_id', opportunityId),
        supabase.from('opportunity_events').select('event_id').eq('opportunity_id', opportunityId),
      ]);
      for (const c of (oppContacts || [])) await linkContact(roadshowStopId, c.contact_id, c.role || undefined);
      for (const e of (oppEvents || [])) await linkEvent(roadshowStopId, e.event_id);
      return true;
    } catch (error) { logger.error('Error linking opportunity entities:', error); return false; }
  };

  return { loading, getRoadshowConnections, linkContact, linkEvent, linkQuote, linkContract, unlinkEntity, linkOpportunityEntities };
};
