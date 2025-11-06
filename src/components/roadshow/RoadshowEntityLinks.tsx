import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Users, Calendar, FileText, File } from 'lucide-react';
import { useRoadshowEntityConnections, RoadshowEntityConnection } from '@/hooks/useRoadshowEntityConnections';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useQuotes } from '@/hooks/useQuotes';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface RoadshowEntityLinksProps {
  roadshowStopId: string;
}

interface OpportunityEntities {
  contacts: Array<{ id: string; name: string; role?: string }>;
  events: Array<{ id: string; title: string }>;
  quotes: Array<{ id: string; quote_number: string; total_amount?: number }>;
}

export const RoadshowEntityLinks: React.FC<RoadshowEntityLinksProps> = ({ roadshowStopId }) => {
  const { getRoadshowConnections, linkContact, linkEvent, linkQuote, unlinkEntity } = useRoadshowEntityConnections();
  const { contacts: allContacts } = useContacts();
  const { events: allEvents } = useEvents();
  const { quotes: allQuotes } = useQuotes();

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

const [opportunityEntities, setOpportunityEntities] = useState<OpportunityEntities | null>(null);
const [loadingOpportunity, setLoadingOpportunity] = useState(false);

const loadConnections = async () => {
  const data = await getRoadshowConnections(roadshowStopId);
  setConnections(data);
};

const loadOpportunityEntities = async () => {
  if (!roadshowStopId) return;
  setLoadingOpportunity(true);
  try {
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

    // Quotes: first via quote_opportunities, then fallback via events
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
    } catch (qErr) {
      console.warn('quote_opportunities fetch error:', qErr);
    }

    if (quotesData.length === 0) {
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
        console.warn('Quotes fetch via events failed:', qErr);
      }
    }

    setOpportunityEntities({
      contacts: contactsData.map((item: any) => ({
        id: item.contacts?.id || '',
        name: item.contacts
          ? `${item.contacts.first_name} ${item.contacts.last_name}${item.contacts.company ? ` (${item.contacts.company})` : ''}`
          : 'Contact inconnu',
        role: item.role,
      })),
      events: eventsData.map((item: any) => ({
        id: item.events?.id || '',
        title: item.events?.title || 'Événement inconnu',
      })),
      quotes: quotesData.map((quote: any) => ({
        id: quote.id || '',
        quote_number: quote.quote_number || 'N/A',
        total_amount: quote.total_amount,
      })),
    });
  } catch (e) {
    console.error('Erreur chargement entités opportunité:', e);
    setOpportunityEntities(null);
  } finally {
    setLoadingOpportunity(false);
  }
};

useEffect(() => {
  if (roadshowStopId) {
    loadConnections();
    loadOpportunityEntities();
  }
}, [roadshowStopId]);

  const handleLinkContact = async () => {
    if (!selectedContact) return;
    const success = await linkContact(roadshowStopId, selectedContact, contactRole);
    if (success) {
      toast.success('Contact lié avec succès');
      loadConnections();
      setShowContactDialog(false);
      setSelectedContact('');
      setContactRole('');
    } else {
      toast.error('Erreur lors de la liaison du contact');
    }
  };

  const handleLinkEvent = async () => {
    if (!selectedEvent) return;
    const success = await linkEvent(roadshowStopId, selectedEvent);
    if (success) {
      toast.success('Événement lié avec succès');
      loadConnections();
      setShowEventDialog(false);
      setSelectedEvent('');
    } else {
      toast.error('Erreur lors de la liaison de l\'événement');
    }
  };

  const handleLinkQuote = async () => {
    if (!selectedQuote) return;
    const success = await linkQuote(roadshowStopId, selectedQuote);
    if (success) {
      toast.success('Devis lié avec succès');
      loadConnections();
      setShowQuoteDialog(false);
      setSelectedQuote('');
    } else {
      toast.error('Erreur lors de la liaison du devis');
    }
  };

  const handleUnlink = async (linkId: string, entityType: 'contact' | 'event' | 'quote' | 'contract') => {
    const success = await unlinkEntity(linkId, entityType);
    if (success) {
      toast.success('Élément délié avec succès');
      loadConnections();
    } else {
      toast.error('Erreur lors de la suppression du lien');
    }
  };

  const EntityBadge = ({ entity, onRemove }: { entity: RoadshowEntityConnection; onRemove: () => void }) => (
    <Badge variant="secondary" className="gap-2 pr-1">
      {entity.title}
      {entity.role && <span className="text-muted-foreground">({entity.role})</span>}
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
        onClick={onRemove}
      >
        <X className="h-3 w-3" />
      </Button>
    </Badge>
  );

  return (
    <div className="space-y-4">
      {opportunityEntities && (
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
            {opportunityEntities.contacts.length === 0 && opportunityEntities.events.length === 0 && opportunityEntities.quotes.length === 0 && (
              <p className="text-sm text-muted-foreground">Aucune entité liée à l'opportunité.</p>
            )}
          </div>
          <Separator />
        </>
      )}
      {/* Contacts */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <h4 className="font-semibold">Contacts</h4>
          </div>
          <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lier un contact</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedContact} onValueChange={setSelectedContact}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un contact" />
                  </SelectTrigger>
                  <SelectContent>
                    {allContacts.map(contact => (
                      <SelectItem key={contact.id} value={contact.id!}>
                        {contact.first_name} {contact.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={contactRole} onValueChange={setContactRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Rôle (optionnel)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizer">Organisateur</SelectItem>
                    <SelectItem value="technical">Contact technique</SelectItem>
                    <SelectItem value="local">Contact local</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleLinkContact} className="w-full">Lier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {connections.contacts.map(contact => (
            <EntityBadge
              key={contact.id}
              entity={contact}
              onRemove={() => handleUnlink(contact.id, 'contact')}
            />
          ))}
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <h4 className="font-semibold">Événements</h4>
          </div>
          <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lier un événement</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un événement" />
                  </SelectTrigger>
                  <SelectContent>
                    {allEvents.map(event => (
                      <SelectItem key={event.id} value={event.id!}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLinkEvent} className="w-full">Lier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {connections.events.map(event => (
            <EntityBadge
              key={event.id}
              entity={event}
              onRemove={() => handleUnlink(event.id, 'event')}
            />
          ))}
        </div>
      </div>

      {/* Quotes */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <h4 className="font-semibold">Devis</h4>
          </div>
          <Dialog open={showQuoteDialog} onOpenChange={setShowQuoteDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-3 w-3 mr-1" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Lier un devis</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedQuote} onValueChange={setSelectedQuote}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un devis" />
                  </SelectTrigger>
                  <SelectContent>
                    {allQuotes.map(quote => (
                      <SelectItem key={quote.id} value={quote.id!}>
                        Devis {quote.quote_number} - {quote.total_amount}€
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleLinkQuote} className="w-full">Lier</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-wrap gap-2">
          {connections.quotes.map(quote => (
            <EntityBadge
              key={quote.id}
              entity={quote}
              onRemove={() => handleUnlink(quote.id, 'quote')}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
