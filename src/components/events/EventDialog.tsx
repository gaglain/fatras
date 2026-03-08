import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';
import { Contact } from '@/types/contact.types';
import { EventDraftManager, useEventDraft } from './EventDraftManager';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';
import { logger } from '@/lib/logger';

interface EventType {
  id: string;
  name: string;
  color: string;
}

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSave: () => void;
}

export const EventDialog: React.FC<EventDialogProps> = ({
  open,
  onOpenChange,
  event,
  onSave
}) => {
  const { user } = useAuth();
  const { users: activeUsers } = useActiveUsers();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: '',
    venue: '',
    address: '',
    city: '',
    postal_code: '',
    country: 'France',
    start_date: '',
    end_date: '',
    status: 'pending',
    budget_min: '',
    budget_max: '',
    attendees_count: '',
    requirements: '',
    notes: '',
    contact_id: '',
    artist_id: '',
    booking_url: '',
    owner_id: ''
  });
  const [loading, setLoading] = useState(false);
  const { clearDraft } = useEventDraft(event?.id);

  useEffect(() => {
    if (open && user) {
      fetchContacts();
      fetchEventTypes();
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      if (event) {
        // Mode modification - charger les données de l'événement
        setFormData({
          title: event.title || '',
          description: event.description || '',
          event_type: event.event_type || '',
          venue: event.venue || '',
          address: event.address || '',
          city: event.city || '',
          postal_code: event.postal_code || '',
          country: event.country || 'France',
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          status: event.status || 'pending',
          budget_min: event.budget_min ? event.budget_min.toString() : '',
          budget_max: event.budget_max ? event.budget_max.toString() : '',
          attendees_count: event.attendees_count ? event.attendees_count.toString() : '',
          requirements: event.requirements || '',
          notes: event.notes || '',
          contact_id: event.contact_id || '',
          artist_id: (event as any).artist_id || '',
          booking_url: (event as any).booking_url || '',
          owner_id: (event as any).owner_id || ''
        });
      } else {
        // Mode création - réinitialiser le formulaire
        setFormData({
          title: '',
          description: '',
          event_type: '',
          venue: '',
          address: '',
          city: '',
          postal_code: '',
          country: 'France',
          start_date: '',
          end_date: '',
          status: 'pending',
          budget_min: '',
          budget_max: '',
          attendees_count: '',
          requirements: '',
          notes: '',
          contact_id: '',
          artist_id: '',
          booking_url: '',
          owner_id: ''
        });
      }
    }
  }, [event, open]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, status, role')
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des contacts:', error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('id, name, color')
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement des types d\'événements:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      logger.error('❌ No user found, cannot create event');
      toast.error('Vous devez être connecté pour créer un événement');
      return;
    }

    logger.debug('🎯 Starting event creation with user:', user.id);
    logger.debug('📝 Form data:', formData);

    setLoading(true);
    try {
      const eventData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description || '',
        event_type: formData.event_type || null,
        venue: formData.venue || '',
        address: formData.address || '',
        city: formData.city || '',
        postal_code: formData.postal_code || '',
        country: formData.country || 'France',
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        status: formData.status || 'pending',
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        attendees_count: formData.attendees_count ? parseInt(formData.attendees_count) : null,
        requirements: formData.requirements || '',
        notes: formData.notes || '',
        contact_id: formData.contact_id && formData.contact_id !== 'none' && formData.contact_id !== '' ? formData.contact_id : null,
        artist_id: formData.artist_id && formData.artist_id !== 'none' && formData.artist_id !== '' ? formData.artist_id : null,
        booking_url: formData.booking_url || null,
        owner_id: formData.owner_id && formData.owner_id !== 'none' && formData.owner_id !== '' ? formData.owner_id : null
      };

      logger.debug('Saving event with data:', eventData);

      if (event?.id) {
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select();
        
        if (error) {
          logger.error('Update error:', error);
          throw error;
        }
        logger.debug('Event updated successfully:', data);
        toast.success('Événement mis à jour avec succès');
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        
        if (error) {
          logger.error('Insert error:', error);
          throw error;
        }
        logger.debug('Event created successfully:', data);
        toast.success('Événement créé avec succès');
      }

      // Nettoyer le brouillon après succès
      clearDraft();
      
      onSave();
    } catch (error: unknown) {
      logger.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {event ? 'Modifier l\'événement' : 'Nouvel événement'}
          </DialogTitle>
        </DialogHeader>

        <EventDraftManager
          formData={formData}
          onFormDataChange={setFormData}
          eventId={event?.id}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <MentionableTextarea
              value={formData.description}
              onChange={(val) => setFormData(prev => ({ ...prev, description: val }))}
              rows={3}
              placeholder="Tapez @ pour mentionner un utilisateur"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Type d'événement</Label>
              <Select value={formData.event_type} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.name}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="option">Option</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="completed">Terminé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Date de début</Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={formData.start_date}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_id">Contact associé</Label>
              <UniversalSearch
                filterTypes={['contact']}
                selectedId={formData.contact_id}
                onSelect={(item: SearchItem) => setFormData(prev => ({ ...prev, contact_id: item.id }))}
                triggerText="Rechercher un contact"
                placeholder="Rechercher contact par nom, email, ID..."
              />
            </div>
            <div>
              <Label htmlFor="artist_id">Spectacle associé</Label>
              <UniversalSearch
                filterTypes={['artist']}
                selectedId={formData.artist_id}
                onSelect={(item: SearchItem) => setFormData(prev => ({ ...prev, artist_id: item.id }))}
                triggerText="Rechercher un spectacle"
                placeholder="Rechercher spectacle par nom, genre..."
              />
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="budget_min">Budget min (€)</Label>
              <Input
                id="budget_min"
                type="number"
                value={formData.budget_min}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="budget_max">Budget max (€)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="attendees_count">Nb participants</Label>
              <Input
                id="attendees_count"
                type="number"
                value={formData.attendees_count}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees_count: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Exigences techniques</Label>
            <Textarea
              id="requirements"
              value={formData.requirements}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="booking_url">Lien de réservation</Label>
            <Input
              id="booking_url"
              type="url"
              placeholder="https://..."
              value={formData.booking_url}
              onChange={(e) => setFormData(prev => ({ ...prev, booking_url: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="owner_id">Propriétaire</Label>
            <Select 
              value={formData.owner_id || 'none'} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, owner_id: value === 'none' ? '' : value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un propriétaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    Aucun propriétaire
                  </div>
                </SelectItem>
                {activeUsers.map(u => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {u.first_name || u.last_name 
                        ? `${u.first_name || ''} ${u.last_name || ''}`.trim() 
                        : u.username || u.email}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : (event ? 'Modifier' : 'Créer')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};