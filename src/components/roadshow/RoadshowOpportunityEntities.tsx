import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, FileText } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface OpportunityEntities {
  contacts: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string }>;
  quotes: Array<{ id: string; quote_number: string; total_amount?: number }>;
}

interface RoadshowOpportunityEntitiesProps {
  opportunityEntities: OpportunityEntities;
}

export const RoadshowOpportunityEntities: React.FC<RoadshowOpportunityEntitiesProps> = ({ opportunityEntities }) => {
  const hasAny = opportunityEntities.contacts.length > 0 || opportunityEntities.events.length > 0 || opportunityEntities.quotes.length > 0;

  return (
    <>
      <div className="space-y-3">
        <div>
          <h4 className="font-semibold">Entités de l'opportunité</h4>
          <p className="text-sm text-muted-foreground">Liées automatiquement depuis l'opportunité.</p>
        </div>
        {opportunityEntities.contacts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><Users className="h-4 w-4" /><span>Contacts</span></div>
            <div className="flex flex-wrap gap-2">
              {opportunityEntities.contacts.map(c => (
                <Badge key={c.id} variant="secondary">{c.name}{c.role && <span className="ml-1 text-xs opacity-70">({c.role})</span>}</Badge>
              ))}
            </div>
          </div>
        )}
        {opportunityEntities.events.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><Calendar className="h-4 w-4" /><span>Événements</span></div>
            <div className="flex flex-wrap gap-2">
              {opportunityEntities.events.map(e => (
                <Badge key={e.id} variant="secondary">{e.title}</Badge>
              ))}
            </div>
          </div>
        )}
        {opportunityEntities.quotes.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4" /><span>Devis</span></div>
            <div className="flex flex-wrap gap-2">
              {opportunityEntities.quotes.map(q => (
                <Badge key={q.id} variant="secondary">Devis {q.quote_number}{q.total_amount && <span className="ml-1">- {q.total_amount}€</span>}</Badge>
              ))}
            </div>
          </div>
        )}
        {!hasAny && (
          <p className="text-sm text-muted-foreground">Aucune entité liée à l'opportunité.</p>
        )}
      </div>
      <Separator />
    </>
  );
};
