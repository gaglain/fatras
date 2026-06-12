import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User } from 'lucide-react';
import { UniversalSearch, SearchItem } from '@/components/UniversalSearch';

interface EventType { id: string; name: string; color: string; }
interface ActiveUser { user_id: string; first_name?: string; last_name?: string; username?: string; email?: string; }

interface Props {
  formData: Record<string, string>;
  onChange: (patch: Partial<Record<string, string>>) => void;
  eventTypes: EventType[];
  activeUsers: ActiveUser[];
  loading: boolean;
  isEdit: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export const EventFormFields: React.FC<Props> = ({ formData, onChange, eventTypes, activeUsers, loading, isEdit, onSubmit, onCancel }) => {
  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => onChange({ [key]: e.target.value });
  const setVal = (key: string) => (val: string) => onChange({ [key]: val });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label>Titre *</Label>
        <Input value={formData.title} onChange={set('title')} required />
      </div>
      <div>
        <Label>Description</Label>
        <Input value={formData.description} onChange={set('description')} placeholder="Description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Type d'événement (debug)</Label><Input value={formData.event_type} onChange={set('event_type')} /></div>
        <div><Label>Statut (debug)</Label><Input value={formData.status} onChange={set('status')} /></div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div><Label>Date de début</Label><Input type="datetime-local" value={formData.start_date} onChange={set('start_date')} /></div>
        <div><Label>Date de fin</Label><Input type="datetime-local" value={formData.end_date} onChange={set('end_date')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact associé (ID)</Label>
          <Input value={formData.contact_id} onChange={set('contact_id')} placeholder="contact id" />
        </div>
        <div>
          <Label>Spectacle associé (ID)</Label>
          <Input value={formData.artist_id} onChange={set('artist_id')} placeholder="artist id" />
        </div>
      </div>

      <div><Label>Lieu</Label><Input value={formData.venue} onChange={set('venue')} /></div>
      <div><Label>Adresse</Label><Input value={formData.address} onChange={set('address')} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Ville</Label><Input value={formData.city} onChange={set('city')} /></div>
        <div><Label>Code postal</Label><Input value={formData.postal_code} onChange={set('postal_code')} /></div>
        <div><Label>Pays</Label><Input value={formData.country} onChange={set('country')} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Budget min (€)</Label><Input type="number" value={formData.budget_min} onChange={set('budget_min')} /></div>
        <div><Label>Budget max (€)</Label><Input type="number" value={formData.budget_max} onChange={set('budget_max')} /></div>
        <div><Label>Nb participants</Label><Input type="number" value={formData.attendees_count} onChange={set('attendees_count')} /></div>
      </div>
      <div><Label>Exigences techniques</Label><Input value={formData.requirements} onChange={set('requirements')} /></div>
      <div><Label>Notes</Label><Input value={formData.notes} onChange={set('notes')} /></div>

      <div><Label>Lien de réservation</Label><Input type="url" placeholder="https://..." value={formData.booking_url} onChange={set('booking_url')} /></div>
      <div><Label>Propriétaire (debug)</Label><Input value={formData.owner_id} onChange={set('owner_id')} /></div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}</Button>
      </div>
    </form>
  );
};
