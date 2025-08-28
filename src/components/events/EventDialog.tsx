
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';
import { Contact } from '@/types/contact.types';

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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
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
    budget_min: undefined as number | undefined,
    budget_max: undefined as number | undefined,
    attendees_count: undefined as number | undefined,
    requirements: '',
    notes: '',
    contact_id: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && user) {
      fetchContacts();
      fetchEventTypes();
      fetchArtists();
    }
  }, [open, user]);

  useEffect(() => {
    if (event) {
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
        budget_min: event.budget_min,
        budget_max: event.budget_max,
        attendees_count: event.attendees_count,
        requirements: event.requirements || '',
        notes: event.notes || '',
        contact_id: event.contact_id || ''
      });
    } else {
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
        budget_min: undefined,
        budget_max: undefined,
        attendees_count: undefined,
        requirements: '',
        notes: '',
        contact_id: ''
      });
    }
  }, [event, open]);

  const fetchContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, status, role')
        .eq('user_id', user?.id)
        .order('first_name');

      if (error) throw error;
      setContacts(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des contacts:', error);
    }
  };

  const fetchEventTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('event_types')
        .select('id, name, color')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setEventTypes(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des types d\'événements:', error);
    }
  };

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name, genre, status')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('name');

      if (error) throw error;
      setArtists(data || []);
    } catch (error: any) {
      console.error('Erreur lors du chargement des spectacles:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const eventData = {
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        event_type: formData.event_type || null,
        venue: formData.venue,
        address: formData.address,
        city: formData.city,
        postal_code: formData.postal_code,
        country: formData.country,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        status: formData.status,
        budget_min: formData.budget_min || null,
        budget_max: formData.budget_max || null,
        attendees_count: formData.attendees_count || null,
        requirements: formData.requirements,
        notes: formData.notes,
        contact_id: formData.contact_id && formData.contact_id !== 'none' ? formData.contact_id : null
      };

      console.log('Event data being saved:', eventData);

      if (event?.id) {
        const { data, error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id)
          .select();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Updated event data:', data);
        toast.success('Événement mis à jour avec succès');
      } else {
        const { data, error } = await supabase
          .from('events')
          .insert([eventData])
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Inserted event data:', data);
        toast.success('Événement créé avec succès');
      }

      onSave();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Erreur:', error);
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
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="event_type">Type d'événement</Label>
              <Select value={formData.event_type || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}>
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
                value={formData.start_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="end_date">Date de fin</Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contact_id">Contact associé</Label>
              <Select value={formData.contact_id || 'none'} onValueChange={(value) => setFormData(prev => ({ ...prev, contact_id: value === 'none' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun contact</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id!}>
                      {contact.first_name} {contact.last_name} - {contact.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Lieu</Label>
            <Input
              id="venue"
              value={formData.venue || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input
              id="address"
              value={formData.address || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Code postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input
                id="country"
                value={formData.country || 'France'}
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
                value={formData.budget_min || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_min: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="budget_max">Budget max (€)</Label>
              <Input
                id="budget_max"
                type="number"
                value={formData.budget_max || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, budget_max: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="attendees_count">Nb participants</Label>
              <Input
                id="attendees_count"
                type="number"
                value={formData.attendees_count || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, attendees_count: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="requirements">Exigences techniques</Label>
            <Textarea
              id="requirements"
              value={formData.requirements || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
