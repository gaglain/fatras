import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { X, Plus, Users, Calendar, FileText, ChevronsUpDown, Check } from 'lucide-react';
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

interface SearchOption { value: string; label: string; }

const SearchableCombobox: React.FC<{
  options: SearchOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  emptyText?: string;
}> = ({ options, value, onChange, placeholder, emptyText = 'Aucun résultat' }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          <span className="truncate text-left">{selected ? selected.label : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[100] bg-popover" align="start">
        <Command>
          <CommandInput placeholder="Rechercher..." />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map(opt => (
                <CommandItem key={opt.value} value={opt.label} onSelect={() => { onChange(opt.value); setOpen(false); }}>
                  <Check className={cn('mr-2 h-4 w-4', value === opt.value ? 'opacity-100' : 'opacity-0')} />
                  <span className="truncate">{opt.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
          <DialogContent><DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader><div className="space-y-4">{children}</div></DialogContent>
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
      label: `${c.first_name} ${c.last_name}${c.email ? ` — ${c.email}` : ''}${c.position ? ` (${c.position})` : ''}`,
    }));

  const eventOptions: SearchOption[] = allEvents
    .filter(e => e.id && !oppEventIds.has(e.id) && !connections.events.some(ce => ce.entityId === e.id))
    .map(e => ({
      value: e.id!,
      label: `${e.title}${e.city ? ` — ${e.city}` : ''}${e.start_date ? ` (${new Date(e.start_date).toLocaleDateString('fr-FR')})` : ''}`,
    }));

  const quoteOptions: SearchOption[] = allQuotes
    .filter(q => q.id && !oppQuoteIds.has(q.id) && !connections.quotes.some(cq => cq.entityId === q.id))
    .map(q => ({
      value: q.id!,
      label: q.title || `Devis ${q.quote_number}`,
    }));

  return (
    <div className="space-y-4">
      {opportunityEntities && <RoadshowOpportunityEntities opportunityEntities={opportunityEntities} />}

      <LinkSection icon={Users} title="Contacts" entities={connections.contacts} dialogOpen={showContactDialog} setDialogOpen={setShowContactDialog} dialogTitle="Lier un contact" entityType="contact">
        <SearchableCombobox options={contactOptions} value={selectedContact} onChange={setSelectedContact} placeholder="Rechercher un contact..." emptyText="Aucun contact trouvé" />
        <Select value={contactRole} onValueChange={setContactRole}>
          <SelectTrigger><SelectValue placeholder="Rôle (optionnel)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="organizer">Organisateur</SelectItem>
            <SelectItem value="technical">Contact technique</SelectItem>
            <SelectItem value="local">Contact local</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => handleLink('contact')} className="w-full" disabled={!selectedContact}>Lier</Button>
      </LinkSection>

      <LinkSection icon={Calendar} title="Événements" entities={connections.events} dialogOpen={showEventDialog} setDialogOpen={setShowEventDialog} dialogTitle="Lier un événement" entityType="event">
        <SearchableCombobox options={eventOptions} value={selectedEvent} onChange={setSelectedEvent} placeholder="Rechercher un événement..." emptyText="Aucun événement trouvé" />
        <Button onClick={() => handleLink('event')} className="w-full" disabled={!selectedEvent}>Lier</Button>
      </LinkSection>

      <LinkSection icon={FileText} title="Devis" entities={connections.quotes} dialogOpen={showQuoteDialog} setDialogOpen={setShowQuoteDialog} dialogTitle="Lier un devis" entityType="quote">
        <SearchableCombobox options={quoteOptions} value={selectedQuote} onChange={setSelectedQuote} placeholder="Rechercher un devis..." emptyText="Aucun devis trouvé" />
        <Button onClick={() => handleLink('quote')} className="w-full" disabled={!selectedQuote}>Lier</Button>
      </LinkSection>
    </div>
  );
};
