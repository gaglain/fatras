import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, Plus, Users, Calendar, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useQuotes } from '@/hooks/useQuotes';
import { toast } from 'sonner';
import { RoadshowOpportunityEntities } from './RoadshowOpportunityEntities';
import { useRoadshowOpportunityEntities } from './useRoadshowOpportunityEntities';

interface RoadshowEntityLinksProps {
  roadshowStopId: string;
}

interface SearchOption {
  value: string;
  label: string;
  description?: string;
  searchText?: string;
}

const SearchableCombobox: React.FC<{
  options: SearchOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  emptyText?: string;
}> = ({ options, value, onChange, placeholder, emptyText = 'Aucun résultat' }) => {
  const selected = options.find((option) => option.value === value);

  return (
    <div className="space-y-3">
      {selected && (
        <div className="rounded-lg border border-input bg-muted/30 px-4 py-3 text-sm text-foreground">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sélection actuelle</p>
          <p className="truncate font-medium">{selected.label}</p>
          {selected.description && <p className="truncate text-sm text-muted-foreground">{selected.description}</p>}
        </div>
      )}
      <Command className="overflow-hidden rounded-lg border border-input bg-background shadow-sm">
        <CommandInput autoFocus placeholder={placeholder} className="h-12 text-base" />
        <CommandList className="max-h-72">
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup className="p-2">
            {options.map((opt) => (
              <CommandItem
                key={opt.value}
                value={opt.searchText || `${opt.label} ${opt.description || ''}`}
                onSelect={() => onChange(opt.value)}
                className="gap-3 rounded-md px-3 py-3"
              >
                <Check className={cn('mt-0.5 h-4 w-4 shrink-0', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{opt.label}</p>
                  {opt.description && <p className="truncate text-sm text-muted-foreground">{opt.description}</p>}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
};

export const RoadshowEntityLinks: React.FC<RoadshowEntityLinksProps> = ({ roadshowStopId }) => {
  const { getRoadshowConnections, linkContact, linkEvent, linkQuote, unlinkEntity } = useRoadshowEntityConnections();
  const { contacts: allContacts } = useContacts();
  const { events: allEvents } = useEvents();
  const { quotes: allQuotes } = useQuotes();
  const { opportunityEntities } = useRoadshowOpportunityEntities(roadshowStopId);

  const [connections, setConnections] = useState<{
    contacts: RoadshowEntityConnection[];
    events: RoadshowEntityConnection[];
    quotes: RoadshowEntityConnection[];
    contracts: RoadshowEntityConnection[];
  }>({ contacts: [], events: [], quotes: [], contracts: [] });

  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showQuoteDialog, setShowQuoteDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedQuote, setSelectedQuote] = useState('');
  const [contactRole, setContactRole] = useState('');

  const loadConnections = async () => {
    const data = await getRoadshowConnections(roadshowStopId);
    setConnections(data);
  };

  useEffect(() => {
    if (roadshowStopId) loadConnections();
  }, [roadshowStopId]);

  const handleLink = async (type: 'contact' | 'event' | 'quote') => {
    let success = false;
    if (type === 'contact' && selectedContact) {
      success = await linkContact(roadshowStopId, selectedContact, contactRole);
      if (success) { setShowContactDialog(false); setSelectedContact(''); setContactRole(''); }
    } else if (type === 'event' && selectedEvent) {
      success = await linkEvent(roadshowStopId, selectedEvent);
      if (success) { setShowEventDialog(false); setSelectedEvent(''); }
    } else if (type === 'quote' && selectedQuote) {
      success = await linkQuote(roadshowStopId, selectedQuote);
      if (success) { setShowQuoteDialog(false); setSelectedQuote(''); }
    }
    if (success) { toast.success('Élément lié avec succès'); loadConnections(); }
    else toast.error('Erreur lors de la liaison');
  };

  const handleUnlink = async (linkId: string, entityType: 'contact' | 'event' | 'quote' | 'contract') => {
    const success = await unlinkEntity(linkId, entityType);
    if (success) { toast.success('Élément délié avec succès'); loadConnections(); }
    else toast.error('Erreur lors de la suppression du lien');
  };

  const EntityBadge = ({ entity, onRemove }: { entity: RoadshowEntityConnection; onRemove: () => void }) => (
    <Badge variant="secondary" className="gap-2 pr-1">
      {entity.title}
      {entity.role && <span className="text-muted-foreground">({entity.role})</span>}
      <Button variant="ghost" size="sm" className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground" onClick={onRemove}>
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );

  const LinkSection = ({ icon: Icon, title, entities, dialogOpen, setDialogOpen, dialogTitle, children, entityType }: any) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2"><Icon className="h-4 w-4" /><h4 className="font-semibold">{title}</h4></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild><Button variant="outline" size="sm"><Plus className="h-3 w-3 mr-1" />Ajouter</Button></DialogTrigger>
          <DialogContent className="gap-0 overflow-hidden p-0 sm:!max-w-2xl sm:max-h-[85vh] sm:p-0">
            <div className="flex max-h-[85vh] flex-col bg-background">
              <DialogHeader className="shrink-0 border-b border-border px-8 py-6 pr-16 text-left">
                <DialogTitle className="text-2xl leading-tight">{dialogTitle}</DialogTitle>
                <DialogDescription className="mt-2 text-base leading-relaxed">
                  Sélectionnez une entité puis confirmez la liaison à cette étape.
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <div className="space-y-5">{children}</div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex flex-wrap gap-2">
        {entities.map((e: RoadshowEntityConnection) => (
          <EntityBadge key={e.id} entity={e} onRemove={() => handleUnlink(e.id, entityType)} />
        ))}
      </div>
    </div>
  );

  const oppContactIds = new Set(opportunityEntities?.contacts.map(c => c.id) || []);
  const oppEventIds = new Set(opportunityEntities?.events.map(e => e.id) || []);
  const oppQuoteIds = new Set(opportunityEntities?.quotes.map(q => q.id) || []);

  const contactOptions: SearchOption[] = allContacts
    .filter(c => c.id && !oppContactIds.has(c.id) && !connections.contacts.some(cc => cc.entityId === c.id))
    .map(c => ({
      value: c.id!,
      label: `${c.first_name} ${c.last_name}`.trim(),
      description: [c.email, c.position].filter(Boolean).join(' • '),
      searchText: [c.first_name, c.last_name, c.email, c.position].filter(Boolean).join(' '),
    }));

  const eventOptions: SearchOption[] = allEvents
    .filter(e => e.id && !oppEventIds.has(e.id) && !connections.events.some(ce => ce.entityId === e.id))
    .map(e => ({
      value: e.id!,
      label: e.title,
      description: [e.city, e.start_date ? new Date(e.start_date).toLocaleDateString('fr-FR') : null].filter(Boolean).join(' • '),
      searchText: [e.title, e.city, e.venue].filter(Boolean).join(' '),
    }));

  const quoteOptions: SearchOption[] = allQuotes
    .filter(q => q.id && !oppQuoteIds.has(q.id) && !connections.quotes.some(cq => cq.entityId === q.id))
    .map(q => ({
      value: q.id!,
      label: q.title || `Devis ${q.quote_number}`,
      description: q.quote_number ? `Réf. ${q.quote_number}` : undefined,
      searchText: [q.title, q.quote_number].filter(Boolean).join(' '),
    }));

  return (
    <div className="space-y-4">
      {opportunityEntities && <RoadshowOpportunityEntities opportunityEntities={opportunityEntities} />}

      <LinkSection icon={Users} title="Contacts" entities={connections.contacts} dialogOpen={showContactDialog} setDialogOpen={setShowContactDialog} dialogTitle="Lier un contact" entityType="contact">
        <SearchableCombobox options={contactOptions} value={selectedContact} onChange={setSelectedContact} placeholder="Rechercher un contact..." emptyText="Aucun contact trouvé" />
        <Select value={contactRole} onValueChange={setContactRole}>
          <SelectTrigger className="h-12 border-input bg-background text-base"><SelectValue placeholder="Rôle (optionnel)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="organizer">Organisateur</SelectItem>
            <SelectItem value="technical">Contact technique</SelectItem>
            <SelectItem value="local">Contact local</SelectItem>
          </SelectContent>
        </Select>
        <div className="border-t border-border pt-4">
          <Button onClick={() => handleLink('contact')} className="h-12 w-full text-base" disabled={!selectedContact}>Lier</Button>
        </div>
      </LinkSection>

      <LinkSection icon={Calendar} title="Événements" entities={connections.events} dialogOpen={showEventDialog} setDialogOpen={setShowEventDialog} dialogTitle="Lier un événement" entityType="event">
        <SearchableCombobox options={eventOptions} value={selectedEvent} onChange={setSelectedEvent} placeholder="Rechercher un événement..." emptyText="Aucun événement trouvé" />
        <div className="border-t border-border pt-4">
          <Button onClick={() => handleLink('event')} className="h-12 w-full text-base" disabled={!selectedEvent}>Lier</Button>
        </div>
      </LinkSection>

      <LinkSection icon={FileText} title="Devis" entities={connections.quotes} dialogOpen={showQuoteDialog} setDialogOpen={setShowQuoteDialog} dialogTitle="Lier un devis" entityType="quote">
        <SearchableCombobox options={quoteOptions} value={selectedQuote} onChange={setSelectedQuote} placeholder="Rechercher un devis..." emptyText="Aucun devis trouvé" />
        <div className="border-t border-border pt-4">
          <Button onClick={() => handleLink('quote')} className="h-12 w-full text-base" disabled={!selectedQuote}>Lier</Button>
        </div>
      </LinkSection>
    </div>
  );
};
