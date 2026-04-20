import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OpportunityEntities {
  contacts: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string }>;
  quotes: Array<{ id: string; quote_number: string; title?: string; total_amount?: number }>;
}

export const useRoadshowOpportunityEntities = (roadshowStopId: string) => {
  const [opportunityEntities, setOpportunityEntities] = useState<OpportunityEntities | null>(null);
  const [loadingOpportunity, setLoadingOpportunity] = useState(false);

  const loadOpportunityEntities = async () => {
    if (!roadshowStopId) return;
    setLoadingOpportunity(true);
    try {
      const rsResp: any = await supabase
        .from('roadshow_stops')
        .select('opportunity_id')
        .eq('id', roadshowStopId)
        .maybeSingle();

      let opportunityId = rsResp?.data?.opportunity_id as string | null;

      if (!opportunityId) {
        const roResp: any = await supabase
          .from('roadshow_opportunities')
          .select('opportunity_id')
          .eq('roadshow_stop_id', roadshowStopId)
          .maybeSingle();
        opportunityId = roResp?.data?.opportunity_id || null;
      }

      if (!opportunityId) {
        setOpportunityEntities(null);
        return;
      }

      const contactsResponse: any = await supabase
        .from('contact_opportunities')
        .select(`role, contacts (id, first_name, last_name, company)`)
        .eq('opportunity_id', opportunityId);
      const contactsData = contactsResponse.data || [];

      const oppResp: any = await supabase
        .from('opportunities')
        .select('contact_id, event_id')
        .eq('id', opportunityId)
        .maybeSingle();
      const oppData = oppResp?.data || {};

      const eventsResponse: any = await supabase
        .from('opportunity_events')
        .select(`events (id, title)`)
        .eq('opportunity_id', opportunityId);
      const eventsData = eventsResponse.data || [];

      let directContact: any = null;
      if (oppData.contact_id) {
        const directContactResp: any = await supabase
          .from('contacts')
          .select('id, first_name, last_name, company')
          .eq('id', oppData.contact_id)
          .maybeSingle();
        directContact = directContactResp?.data || null;
      }

      const contactItems = [
        ...contactsData.map((item: any) => ({
          id: item.contacts?.id || '',
          name: item.contacts
            ? `${item.contacts.first_name} ${item.contacts.last_name}${item.contacts.company ? ` (${item.contacts.company})` : ''}`
            : 'Contact inconnu',
          role: item.role as string | undefined,
        })),
        ...(directContact
          ? [{
              id: directContact.id,
              name: `${directContact.first_name} ${directContact.last_name}${directContact.company ? ` (${directContact.company})` : ''}`,
            }]
          : []),
      ];
      const contactsCombined = Array.from(
        new Map(contactItems.filter(c => c.id).map(c => [c.id, c])).values()
      );

      const eventItems = [
        ...eventsData.map((item: any) => ({
          id: item.events?.id || '',
          title: item.events?.title || 'Événement inconnu',
        })),
      ];
      if (oppData.event_id) {
        const directEventResp: any = await supabase
          .from('events')
          .select('id, title')
          .eq('id', oppData.event_id)
          .maybeSingle();
        if (directEventResp?.data) {
          eventItems.push({ id: directEventResp.data.id, title: directEventResp.data.title || 'Événement' });
        }
      }
      const eventsCombined = Array.from(
        new Map(eventItems.filter(e => e.id).map(e => [e.id, e])).values()
      );

      let quotesData: any[] = [];
      try {
        const qoResp: any = await supabase
          .from('quote_opportunities')
          .select(`quotes (id, quote_number, total_amount)`)
          .eq('opportunity_id', opportunityId);
        quotesData = (qoResp?.data || []).map((row: any) => row.quotes).filter(Boolean);
      } catch {}

      if (quotesData.length === 0) {
        try {
          const eventIds = eventsCombined.map((e: any) => e.id).filter((id: string) => !!id);
          if (eventIds.length > 0) {
            const quotesResp: any = await (supabase
              .from('quotes')
              .select('id, quote_number, total_amount, event_id') as any)
              .in('event_id', eventIds);
            quotesData = quotesResp.data || [];
          }
        } catch {}
      }

      setOpportunityEntities({
        contacts: contactsCombined,
        events: eventsCombined,
        quotes: quotesData.map((quote: any) => ({
          id: quote.id || '',
          quote_number: quote.quote_number || 'N/A',
          total_amount: quote.total_amount,
        })),
      });
    } catch {
      setOpportunityEntities(null);
    } finally {
      setLoadingOpportunity(false);
    }
  };

  useEffect(() => {
    if (roadshowStopId) loadOpportunityEntities();
  }, [roadshowStopId]);

  return { opportunityEntities, loadingOpportunity };
};
