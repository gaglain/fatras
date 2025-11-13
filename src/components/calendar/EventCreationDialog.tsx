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
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AppUser {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

interface EmailAccount {
  id: string;
  email: string;
  provider: string;
  access_token: string;
}

export const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  open,
  onOpenChange,
  onEventCreated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appUsers, setAppUsers] = useState<AppUser[]>([]);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: [] as string[], // user IDs
    sync_to_google: false,
    target_calendar_id: '', // calendar_id pour Nylas
  });

  useEffect(() => {
    if (open) {
      loadAppUsers();
      loadEmailAccounts();
    }
  }, [open]);

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

  const loadEmailAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('email_accounts')
        .select('id, email, provider, access_token')
        .eq('is_active', true)
        .in('provider', ['gmail', 'google']);

      if (error) throw error;
      setEmailAccounts(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des comptes email:', error);
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
      const attendeesArray = formData.attendees;

      // Synchroniser avec Google Calendar si demandé
      if (formData.sync_to_google && formData.target_calendar_id) {
        const targetAccount = emailAccounts.find(acc => acc.email === formData.target_calendar_id);
        
        if (targetAccount?.access_token) {
          try {
            const { data, error } = await supabase.functions.invoke('nylas-calendar-sync', {
              body: {
                action: 'create_event',
                user_id: user.id,
                grant_id: targetAccount.access_token,
                event: {
                  title: formData.title,
                  description: formData.description,
                  when: {
                    start_time: new Date(formData.start_time).toISOString(),
                    end_time: new Date(formData.end_time || formData.start_time).toISOString(),
                  },
                  location: formData.location,
                  participants: attendeesArray.map(userId => {
                    const u = appUsers.find(au => au.user_id === userId);
                    return { email: u?.email || '' };
                  }).filter(p => p.email),
                },
              },
            });

            if (error) {
              console.error('Nylas calendar error:', error);
              toast.error('Erreur lors de la synchronisation avec Google Agenda');
            } else {
              toast.success('Événement créé dans Google Agenda');
            }
          } catch (nylasError) {
            console.error('Nylas error:', nylasError);
            toast.error('Erreur lors de la synchronisation avec Google Agenda');
          }
        }
      }

      // Create event in local database
      const { error: eventError } = await supabase.from('calendar_events').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time || formData.start_time,
        location: formData.location,
        calendar_id: formData.target_calendar_id || 'local',
        provider: formData.sync_to_google ? 'nylas' : 'local',
        external_id: `local-${Date.now()}`,
        attendees: attendeesArray,
      });

      if (eventError) throw eventError;

      // Create event in centralized events table
      const { error: centralError } = await supabase.from('centralized_events').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        start_date: formData.start_time,
        end_date: formData.end_time || formData.start_time,
        venue: formData.location,
        status: 'confirmed',
      });

      if (centralError) console.error('Error creating centralized event:', centralError);

      // Send notifications to attendees (user IDs)
      if (attendeesArray.length > 0) {
        for (const userId of attendeesArray) {
          await supabase.from('notifications').insert({
            user_id: userId,
            type: 'event_invitation',
            title: 'Nouvelle invitation',
            message: `Vous êtes invité à l'événement: ${formData.title}`,
            data: { event_title: formData.title, start_time: formData.start_time, location: formData.location },
          });
        }
      }

      toast.success('Événement créé avec succès');
      onOpenChange(false);
      onEventCreated?.();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        location: '',
        attendees: [],
        sync_to_google: false,
        target_calendar_id: '',
      });
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Créer un nouvel événement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Nom de l'événement"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description de l'événement"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_time">Début *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="end_time">Fin</Label>
              <Input
                id="end_time"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Lieu</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Adresse ou nom du lieu"
            />
          </div>

          {emailAccounts.length > 0 && (
            <div className="space-y-3 border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sync_to_google"
                  checked={formData.sync_to_google}
                  onChange={(e) => setFormData({ ...formData, sync_to_google: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="sync_to_google" className="cursor-pointer">
                  Synchroniser avec Google Agenda
                </Label>
              </div>
              
              {formData.sync_to_google && (
                <div>
                  <Label htmlFor="target_calendar">Calendrier Google cible</Label>
                  <select
                    id="target_calendar"
                    value={formData.target_calendar_id}
                    onChange={(e) => setFormData({ ...formData, target_calendar_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Sélectionner un calendrier</option>
                    {emailAccounts.map((account) => (
                      <option key={account.id} value={account.email}>
                        {account.email}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

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
                      id={`attendee-${u.user_id}`}
                      checked={formData.attendees.includes(u.user_id)}
                      onChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          attendees: prev.attendees.includes(u.user_id)
                            ? prev.attendees.filter(id => id !== u.user_id)
                            : [...prev.attendees, u.user_id],
                        }));
                      }}
                      className="h-4 w-4"
                    />
                    <label htmlFor={`attendee-${u.user_id}`} className="text-sm cursor-pointer">
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
              {loading ? 'Création...' : 'Créer l\'événement'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};