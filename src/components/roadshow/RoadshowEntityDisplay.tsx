import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText } from 'lucide-react';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { supabase } from '@/integrations/supabase/client';

interface RoadshowEntityDisplayProps {
  roadshowStopId: string;
}

interface OpportunityEntities {
  contacts: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string }>;
  quotes: Array<{ id: string; quote_number: string; total_amount?: number }>;
}

export const RoadshowEntityDisplay: React.FC<RoadshowEntityDisplayProps> = ({ roadshowStopId }) => {
  const { getRoadshowConnections } = useRoadshowEntityConnections();
  const [connections, setConnections] = useState<{
    contacts: RoadshowEntityConnection[];
    events: RoadshowEntityConnection[];
    quotes: RoadshowEntityConnection[];
    contracts: RoadshowEntityConnection[];
  }>({ contacts: [], events: [], quotes: [], contracts: [] });
  const [opportunityEntities, setOpportunityEntities] = useState<OpportunityEntities | null>(null);

  useEffect(() => {
    if (roadshowStopId) {
      loadConnections();
      loadOpportunityEntities();
    }
  }, [roadshowStopId]);

  const loadConnections = async () => {
    const data = await getRoadshowConnections(roadshowStopId);
    setConnections(data);
  };

  const loadOpportunityEntities = async () => {
    if (!roadshowStopId) return;
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
        .select(`
          role,
          contacts (
            id,
            first_name,
            last_name,
            company
          )
        `)
        .eq('opportunity_id', opportunityId);

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
        ...(contactsResponse.data || []).map((item: any) => ({
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

      const eventItems = (eventsResponse.data || []).map((item: any) => ({
        id: item.events?.id || '',
        title: item.events?.title || 'Événement inconnu',
      }));
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

      const contactsCombined = Array.from(
        new Map(contactItems.filter((c: any) => c.id).map((c: any) => [c.id, c])).values()
      ) as Array<{ id: string; name: string; role?: string }>;

      const eventsCombined = Array.from(
        new Map(eventItems.filter((e: any) => e.id).map((e: any) => [e.id, e])).values()
      ) as Array<{ id: string; title: string }>;

      setOpportunityEntities({
        contacts: contactsCombined,
        events: eventsCombined,
        quotes: [],
      });
    } catch (e) {
      console.error('Erreur chargement entités opportunité:', e);
      setOpportunityEntities(null);
    }
  };

  const hasData = 
    (opportunityEntities && (opportunityEntities.contacts.length > 0 || opportunityEntities.events.length > 0)) ||
    connections.contacts.length > 0 || 
    connections.events.length > 0;

  if (!hasData) return null;

  return (
    <div className="space-y-3 text-xs sm:text-sm">
      {opportunityEntities && opportunityEntities.contacts.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {opportunityEntities.contacts.slice(0, 3).map(c => (
              <Badge key={c.id} variant="secondary" className="text-xs">
                {c.name}
              </Badge>
            ))}
            {opportunityEntities.contacts.length > 3 && (
              <Badge variant="outline" className="text-xs">+{opportunityEntities.contacts.length - 3}</Badge>
            )}
          </div>
        </div>
      )}

      {opportunityEntities && opportunityEntities.events.length > 0 && (
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {opportunityEntities.events.slice(0, 2).map(e => (
              <Badge key={e.id} variant="secondary" className="text-xs">
                {e.title}
              </Badge>
            ))}
            {opportunityEntities.events.length > 2 && (
              <Badge variant="outline" className="text-xs">+{opportunityEntities.events.length - 2}</Badge>
            )}
          </div>
        </div>
      )}

      {connections.contacts.length > 0 && (
        <div className="flex items-start gap-2">
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="flex flex-wrap gap-1">
            {connections.contacts.slice(0, 3).map(c => (
              <Badge key={c.id} variant="outline" className="text-xs">
                {c.title}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
