import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface ArtistDashboardTabsProps {
  contacts: any[];
  opportunities: any[];
  quotes: any[];
  events: any[];
  tasks: any[];
  publications: any[];
  contactLists: any[];
  campaigns: any[];
  onContactClick: (contact: any) => void;
  onOpportunityClick: (opp: any) => void;
  onQuoteClick: (quote: any) => void;
  onEventClick: (event: any) => void;
  onTaskClick: (task: any) => void;
  onPublicationClick: (pub: any) => void;
}

interface EntityListProps {
  title: string;
  items: any[];
  emptyText: string;
  renderItem: (item: any) => React.ReactNode;
}

const EntityList: React.FC<EntityListProps> = ({ title, items, emptyText, renderItem }) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-4">{items.map(renderItem)}</div>
      )}
    </CardContent>
  </Card>
);

const ClickableRow: React.FC<{ item: any; onClick: () => void; label: string; sub?: string }> = ({ item, onClick, label, sub }) => (
  <div key={item.id} className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2" onClick={onClick}>
    <div>
      <p className="font-medium">{label}</p>
      {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
    </div>
    <Badge>{item.status}</Badge>
  </div>
);

export const ArtistDashboardTabs: React.FC<ArtistDashboardTabsProps> = ({
  contacts, opportunities, quotes, events, tasks, publications, contactLists, campaigns,
  onContactClick, onOpportunityClick, onQuoteClick, onEventClick, onTaskClick, onPublicationClick
}) => {
  return (
    <Tabs defaultValue="contacts" className="space-y-4">
      <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-muted/50 p-1">
        <TabsTrigger value="contacts" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Contacts</TabsTrigger>
        <TabsTrigger value="opportunities" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
          <span className="hidden sm:inline">Opportunités</span><span className="sm:hidden">Opport.</span>
        </TabsTrigger>
        <TabsTrigger value="quotes" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Devis</TabsTrigger>
        <TabsTrigger value="events" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
          <span className="hidden sm:inline">Événements</span><span className="sm:hidden">Événem.</span>
        </TabsTrigger>
        <TabsTrigger value="tasks" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Tâches</TabsTrigger>
        <TabsTrigger value="publications" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
          <span className="hidden sm:inline">Publications</span><span className="sm:hidden">Publi.</span>
        </TabsTrigger>
        <TabsTrigger value="lists" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Listes</TabsTrigger>
        <TabsTrigger value="campaigns" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
          <span className="hidden sm:inline">Campagnes</span><span className="sm:hidden">Camp.</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="contacts" className="space-y-4">
        <EntityList title="Contacts récents" items={contacts} emptyText="Aucun contact lié"
          renderItem={(c) => <ClickableRow key={c.id} item={c} onClick={() => onContactClick(c)} label={`${c.first_name} ${c.last_name}`} sub={c.company} />} />
      </TabsContent>

      <TabsContent value="opportunities" className="space-y-4">
        <EntityList title="Opportunités" items={opportunities} emptyText="Aucune opportunité"
          renderItem={(o) => <ClickableRow key={o.id} item={o} onClick={() => onOpportunityClick(o)} label={o.title} sub={o.venue} />} />
      </TabsContent>

      <TabsContent value="quotes" className="space-y-4">
        <EntityList title="Devis récents" items={quotes} emptyText="Aucun devis"
          renderItem={(q) => <ClickableRow key={q.id} item={q} onClick={() => onQuoteClick(q)} label={q.title} sub={`${q.total_amount}€`} />} />
      </TabsContent>

      <TabsContent value="events" className="space-y-4">
        <EntityList title="Événements à venir" items={events} emptyText="Aucun événement"
          renderItem={(e) => <ClickableRow key={e.id} item={e} onClick={() => onEventClick(e)} label={e.title} sub={e.venue} />} />
      </TabsContent>

      <TabsContent value="tasks" className="space-y-4">
        <EntityList title="Tâches en cours" items={tasks} emptyText="Aucune tâche"
          renderItem={(t) => <ClickableRow key={t.id} item={t} onClick={() => onTaskClick(t)} label={t.title} sub={t.description} />} />
      </TabsContent>

      <TabsContent value="publications" className="space-y-4">
        <EntityList title="Publications planifiées" items={publications} emptyText="Aucune publication"
          renderItem={(p) => <ClickableRow key={p.id} item={p} onClick={() => onPublicationClick(p)} label={p.title} sub={p.platform} />} />
      </TabsContent>

      <TabsContent value="lists" className="space-y-4">
        <EntityList title="Listes de contacts liées" items={contactLists} emptyText="Aucune liste liée à cet artiste"
          renderItem={(list: any) => (
            <div key={list.id} className="flex items-center justify-between border-b pb-2 rounded p-2">
              <div><p className="font-medium">{list.name}</p><p className="text-sm text-muted-foreground">{list.description}</p></div>
              <Badge variant="secondary">{new Date(list.created_at).toLocaleDateString('fr-FR')}</Badge>
            </div>
          )} />
      </TabsContent>

      <TabsContent value="campaigns" className="space-y-4">
        <EntityList title="Campagnes email liées" items={campaigns} emptyText="Aucune campagne liée à cet artiste"
          renderItem={(c: any) => (
            <div key={c.id} className="flex items-center justify-between border-b pb-2 rounded p-2">
              <div><p className="font-medium">{c.name}</p><p className="text-sm text-muted-foreground">{c.subject}</p></div>
              <Badge>{c.status}</Badge>
            </div>
          )} />
      </TabsContent>
    </Tabs>
  );
};
