import React, { useState } from 'react';
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

interface EventCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export const EventCreationDialog: React.FC<EventCreationDialogProps> = ({
  open,
  onOpenChange,
  onEventCreated,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    location: '',
    attendees: '',
  });

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
      // Create event in local database
      const { error: eventError } = await supabase.from('calendar_events').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        start_time: formData.start_time,
        end_time: formData.end_time || formData.start_time,
        location: formData.location,
        calendar_id: 'local',
        provider: 'local',
        external_id: `local-${Date.now()}`,
        attendees: formData.attendees.split(',').map(a => a.trim()).filter(Boolean),
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
        attendees: '',
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

          <div>
            <Label htmlFor="attendees">Participants (emails séparés par des virgules)</Label>
            <Input
              id="attendees"
              value={formData.attendees}
              onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
            />
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