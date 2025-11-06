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
      const roadshowResponse: any = await supabase
        .from('roadshow_stops')
        .select('opportunity_id')
        .eq('id', roadshowStopId)
        .single();

      if (roadshowResponse.error || !roadshowResponse.data?.opportunity_id) {
        setOpportunityEntities(null);
        return;
      }

      const opportunityId = roadshowResponse.data.opportunity_id;

      // Get contacts linked to the opportunity
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
      const contactsData = contactsResponse.data;

      // Get events linked to the opportunity
      const eventsResponse: any = await supabase
        .from('opportunity_events')
        .select(`
          events (
            id,
            title
          )
        `)
        .eq('opportunity_id', opportunityId);
      const eventsData = eventsResponse.data;

      // Get quotes via events linked to the opportunity (quotes don't have opportunity_id)
      let quotesData: any[] = [];
      try {
        const eventIds = (eventsData || [])
          .map((item: any) => item.events?.id)
          .filter((id: string) => !!id);
        if (eventIds.length > 0) {
          const quotesResp: any = await (supabase
            .from('quotes')
            .select('id, quote_number, total_amount, event_id') as any)
            .in('event_id', eventIds);
          quotesData = quotesResp.data || [];
        }
      } catch (qErr) {
        console.warn('Quotes fetch skipped (no opportunity_id on quotes):', qErr);
      }

      setOpportunityEntities({
        contacts: (contactsData || []).map((item: any) => ({
          id: item.contacts?.id || '',
          name: item.contacts ? 
            `${item.contacts.first_name} ${item.contacts.last_name}${item.contacts.company ? ` (${item.contacts.company})` : ''}` 
            : 'Contact inconnu',
          role: item.role
        })),
        events: (eventsData || []).map((item: any) => ({
          id: item.events?.id || '',
          title: item.events?.title || 'Événement inconnu'
        })),
        quotes: (quotesData || []).map((quote: any) => ({
          id: quote.id || '',
          quote_number: quote.quote_number || 'N/A',
          total_amount: quote.total_amount
        }))
      });
    } catch (error) {
      console.error('Error loading opportunity entities:', error);
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
