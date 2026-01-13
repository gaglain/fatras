import React, { useEffect, useState } from 'react';
import { RoadshowEntityLinks } from './RoadshowEntityLinks';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText } from 'lucide-react';

interface EntityLinksFormProps {
  roadshowStopId?: string;
}

interface OpportunityEntities {
  contacts: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string }>;
  quotes: Array<{ id: string; quote_number: string; total_amount?: number }>;
}

export const EntityLinksForm: React.FC<EntityLinksFormProps> = ({ roadshowStopId }) => {
  const [opportunityEntities, setOpportunityEntities] = useState<OpportunityEntities | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roadshowStopId) {
      loadOpportunityEntities();
    }
  }, [roadshowStopId]);

  const loadOpportunityEntities = async () => {
    if (!roadshowStopId) return;

    setLoading(true);
    try {
      // Get the opportunity_id from the roadshow stop
      // Resolve opportunity_id from roadshow_stop or via roadshow_opportunities fallback
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

      // Get contacts linked to the opportunity (junction table)
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
      const contactsData = contactsResponse.data || [];

      // Also fetch direct contact/event from the opportunity record itself
      const oppResp: any = await supabase
        .from('opportunities')
        .select('contact_id, event_id')
        .eq('id', opportunityId)
        .maybeSingle();
      const oppData = oppResp?.data || {};

      // Get events linked to the opportunity (junction table)
      const eventsResponse: any = await supabase
        .from('opportunity_events')
        .select(`
          events (
            id,
            title
          )
        `)
        .eq('opportunity_id', opportunityId);
      const eventsData = eventsResponse.data || [];

      // Build combined contacts (junction + direct contact_id)
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
      // Deduplicate contacts by id
      const contactsCombined = Array.from(
        new Map(contactItems.filter(c => c.id).map(c => [c.id, c])).values()
      );

      // Build combined events (junction + direct event_id)
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

      // Get quotes linked via quote_opportunities; fallback to quotes via all collected event ids
      let quotesData: any[] = [];
      try {
        const qoResp: any = await supabase
          .from('quote_opportunities')
          .select(`
            quotes (
              id,
              quote_number,
              total_amount
            )
          `)
          .eq('opportunity_id', opportunityId);
        quotesData = (qoResp?.data || [])
          .map((row: any) => row.quotes)
          .filter(Boolean);
      } catch {
        // quote_opportunities fetch failed, continue
      }

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
        } catch {
          // Quotes fetch via events failed, continue
        }
      }


      setOpportunityEntities({
        contacts: contactsCombined,
        events: eventsCombined,
        quotes: (quotesData || []).map((quote: any) => ({
          id: quote.id || '',
          quote_number: quote.quote_number || 'N/A',
          total_amount: quote.total_amount,
        })),
      });
    } catch {
      setOpportunityEntities(null);
    } finally {
      setLoading(false);
    }
  };

  if (!roadshowStopId) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Les entités liées seront disponibles après la création de l'étape de tournée.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Opportunity-linked entities section */}
      {opportunityEntities && (
        <>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Entités de l'opportunité</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Ces entités sont automatiquement liées via l'opportunité associée à cette étape.
              </p>
            </div>

            {/* Contacts */}
            {opportunityEntities.contacts.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Users className="h-4 w-4" />
                  <span>Contacts</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunityEntities.contacts.map((contact) => (
                    <Badge key={contact.id} variant="secondary">
                      {contact.name}
                      {contact.role && <span className="ml-1 text-xs opacity-70">({contact.role})</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {opportunityEntities.events.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Calendar className="h-4 w-4" />
                  <span>Événements</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunityEntities.events.map((event) => (
                    <Badge key={event.id} variant="secondary">
                      {event.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Quotes */}
            {opportunityEntities.quotes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <FileText className="h-4 w-4" />
                  <span>Devis</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {opportunityEntities.quotes.map((quote) => (
                    <Badge key={quote.id} variant="secondary">
                      Devis {quote.quote_number}
                      {quote.total_amount && <span className="ml-1">- {quote.total_amount}€</span>}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {opportunityEntities.contacts.length === 0 && 
             opportunityEntities.events.length === 0 && 
             opportunityEntities.quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucune entité liée à l'opportunité.
              </p>
            )}
          </div>

          <Separator />
        </>
      )}

      {/* Manual entity links section */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium mb-2">Entités supplémentaires</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Ajoutez manuellement d'autres contacts, événements, devis et contrats à cette étape.
          </p>
        </div>
        <RoadshowEntityLinks roadshowStopId={roadshowStopId} />
      </div>
    </div>
  );
};
