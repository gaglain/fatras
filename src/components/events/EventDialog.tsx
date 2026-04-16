import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveUsers } from '@/hooks/useActiveUsers';
import { toast } from 'sonner';
import { Event } from '@/types/event.types';
import { Contact } from '@/types/contact.types';
import { EventDraftManager, useEventDraft } from './EventDraftManager';
import { EventFormFields } from './EventFormFields';
import { logger } from '@/lib/logger';
import { notifyMentionsIfNeeded } from '@/utils/mentionNotifier';
import { invokeEdgeFunction } from '@/lib/edgeFunctionClient';

const syncEventToNylas = (eventId: string, trigger: string) => {
  invokeEdgeFunction({
    functionName: 'sync-event-to-nylas',
    body: { event_id: eventId, trigger, grant_id_override: '1689aa22-c0cc-48b2-ac09-6f221aff790f' },
    nonBlocking: true,
  });
};

interface EventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event?: Event | null;
  onSave: () => void;
}

const defaultFormData = {
  title: '', description: '', event_type: '', venue: '', address: '', city: '',
  postal_code: '', country: 'France', start_date: '', end_date: '', status: 'pending',
  budget_min: '', budget_max: '', attendees_count: '', requirements: '', notes: '',
  contact_id: '', artist_id: '', booking_url: '', owner_id: ''
};

export const EventDialog: React.FC<EventDialogProps> = ({ open, onOpenChange, event, onSave }) => {
  const { user } = useAuth();
  const { users: activeUsers } = useActiveUsers();
  const [eventTypes, setEventTypes] = useState<{ id: string; name: string; color: string }[]>([]);
  const [formData, setFormData] = useState(defaultFormData);
  const [loading, setLoading] = useState(false);
  const { clearDraft } = useEventDraft(event?.id);

  useEffect(() => {
    if (open && user) {
      supabase.from('event_types').select('id, name, color').order('name').then(({ data }) => setEventTypes(data || []));
    }
  }, [open, user]);

  useEffect(() => {
    if (open) {
      if (event) {
        setFormData({
          title: event.title || '', description: event.description || '', event_type: event.event_type || '',
          venue: event.venue || '', address: event.address || '', city: event.city || '',
          postal_code: event.postal_code || '', country: event.country || 'France',
          start_date: event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : '',
          end_date: event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : '',
          status: event.status || 'pending',
          budget_min: event.budget_min ? event.budget_min.toString() : '',
          budget_max: event.budget_max ? event.budget_max.toString() : '',
          attendees_count: event.attendees_count ? event.attendees_count.toString() : '',
          requirements: event.requirements || '', notes: event.notes || '',
          contact_id: event.contact_id || '', artist_id: (event as any).artist_id || '',
          booking_url: (event as any).booking_url || '', owner_id: (event as any).owner_id || ''
        });
      } else {
        setFormData({ ...defaultFormData });
      }
    }
  }, [event, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { toast.error('Vous devez être connecté'); return; }
    setLoading(true);
    try {
      const eventData = {
        user_id: user.id, title: formData.title, description: formData.description || '',
        event_type: formData.event_type || null, venue: formData.venue || '', address: formData.address || '',
        city: formData.city || '', postal_code: formData.postal_code || '', country: formData.country || 'France',
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : null,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        status: formData.status || 'pending',
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : null,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : null,
        attendees_count: formData.attendees_count ? parseInt(formData.attendees_count) : null,
        requirements: formData.requirements || '', notes: formData.notes || '',
        contact_id: formData.contact_id && formData.contact_id !== 'none' ? formData.contact_id : null,
        artist_id: formData.artist_id && formData.artist_id !== 'none' ? formData.artist_id : null,
        booking_url: formData.booking_url || null,
        owner_id: formData.owner_id && formData.owner_id !== 'none' ? formData.owner_id : null
      };

      if (event?.id) {
        const { error } = await supabase.from('events').update(eventData).eq('id', event.id).select();
        if (error) throw error;
        toast.success('Événement mis à jour');
      } else {
        const { error } = await supabase.from('events').insert([eventData]).select();
        if (error) throw error;
        toast.success('Événement créé');
      }

      [formData.description, formData.requirements, formData.notes].filter(Boolean).forEach(text => {
        if (text) notifyMentionsIfNeeded({ text, senderUserId: user.id, senderName: user.email || 'Utilisateur', contextType: 'event', contextName: formData.title, contextId: event?.id });
      });

      clearDraft();
      onSave();
    } catch (error) {
      logger.error('Erreur:', error);
      toast.error("Erreur lors de la sauvegarde");
    } finally { setLoading(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{event ? "Modifier l'événement" : 'Nouvel événement'}</DialogTitle></DialogHeader>
        <EventDraftManager formData={formData} onFormDataChange={setFormData} eventId={event?.id} />
        <EventFormFields formData={formData} onChange={patch => setFormData(p => ({ ...p, ...patch }))}
          eventTypes={eventTypes} activeUsers={activeUsers} loading={loading}
          isEdit={!!event} onSubmit={handleSubmit} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};
