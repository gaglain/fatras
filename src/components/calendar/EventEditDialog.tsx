import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface EventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onEventUpdated?: () => void;
}

interface AppUser {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

export const EventEditDialog: React.FC<EventEditDialogProps> = ({
  open,
  onOpenChange,
  eventId,
  onEventUpdated,
}) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [] as string[], // user IDs
  });

  useEffect(() => {
    if (open && eventId) {
      loadEvent();
      loadAppUsers();
    }
  }, [open, eventId]);

  const loadAppUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, email, first_name, last_name')
        .eq('is_active', true);

      if (error) throw error;
      setAppUsers(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
    }
  };

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          title: data.title || '',
          description: data.description || '',
          start_time: data.start_time ? new Date(data.start_time).toISOString().slice(0, 16) : '',
          end_time: data.end_time ? new Date(data.end_time).toISOString().slice(0, 16) : '',
          location: data.location || '',
          attendees: data.attendees || [],
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'événement:', error);
      toast.error('Erreur lors du chargement de l\'événement');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!formData.title || !formData.start_time) {
      toast.error('Le titre et la date de début sont requis');
      return;
    }

    setLoading(true);
    try {
      // Update in calendar_events
      const { error: calError } = await supabase
        .from('calendar_events')
        .update({
          title: formData.title,
          description: formData.description,
          start_time: new Date(formData.start_time).toISOString(),
          end_time: new Date(formData.end_time || formData.start_time).toISOString(),
          location: formData.location,
          attendees: formData.attendees,
        })
        .eq('id', eventId);

      if (calError) throw calError;

      // Update in centralized_events if exists
      const { error: centError } = await supabase
        .from('centralized_events')
        .update({
          title: formData.title,
          description: formData.description,
          start_date: new Date(formData.start_time).toISOString(),
          end_date: new Date(formData.end_time || formData.start_time).toISOString(),
          venue: formData.location,
        })
        .eq('id', eventId);

      // Envoyer notifications aux participants (seulement nouveaux)
      for (const userId of formData.attendees) {
        await supabase.from('notifications').insert({
          user_id: userId,
          type: 'event_update',
          title: 'Événement modifié',
          message: `L'événement "${formData.title}" a été modifié`,
          data: { event_id: eventId, event_title: formData.title },
        });
      }

      // Mise à jour Google Agenda via Nylas si intégration active
      const { data: integration } = await supabase
        .from('integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('service', 'google_calendar')
        .eq('is_active', true)
        .single();

      const settings = integration?.settings as any;
      if (settings?.grant_id) {
        try {
          await supabase.functions.invoke('nylas-calendar-sync', {
            body: {
              action: 'update_event',
              user_id: user.id,
              grant_id: settings.grant_id,
              event_id: eventId,
              event: {
                title: formData.title,
                description: formData.description,
                when: {
                  start_time: new Date(formData.start_time).toISOString(),
                  end_time: new Date(formData.end_time || formData.start_time).toISOString(),
                },
                location: formData.location,
                participants: formData.attendees.map(userId => {
                  const u = appUsers.find(au => au.user_id === userId);
                  return { email: u?.email || '' };
                }).filter(p => p.email),
              },
            },
          });
        } catch (nylasError) {
          console.error('Erreur Nylas update:', nylasError);
        }
      }

      toast.success('Événement modifié avec succès');
      onOpenChange(false);
      onEventUpdated?.();
      
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        attendees: [],
      });
    } catch (error: any) {
      console.error('Erreur lors de la modification:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleAttendee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(userId)
        ? prev.attendees.filter(id => id !== userId)
        : [...prev.attendees, userId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier l'événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Titre *</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nom de l'événement"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'événement"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-start_time">Début *</Label>
              <Input
                id="edit-start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-end_time">Fin</Label>
              <Input
                id="edit-end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-location">Lieu</Label>
            <Input
              id="edit-location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Adresse ou nom du lieu"
            />
          </div>

          <div>
            <Label>Participants (utilisateurs de l'app uniquement)</Label>
            <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
              {appUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun utilisateur disponible</p>
              ) : (
                appUsers.map((u) => (
                  <div key={u.user_id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`edit-attendee-${u.user_id}`}
                      checked={formData.attendees.includes(u.user_id)}
                      onChange={() => toggleAttendee(u.user_id)}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`edit-attendee-${u.user_id}`} className="text-sm cursor-pointer">
                      {u.first_name} {u.last_name} ({u.email})
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Modification...' : 'Modifier l\'événement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
