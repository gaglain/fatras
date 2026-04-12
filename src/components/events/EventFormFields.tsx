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
        <MentionableTextarea value={formData.description} onChange={setVal('description')} rows={3} placeholder="Tapez @ pour mentionner un utilisateur" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type d'événement</Label>
          <Select value={formData.event_type} onValueChange={setVal('event_type')}>
            <SelectTrigger><SelectValue placeholder="Sélectionner un type" /></SelectTrigger>
            <SelectContent>
              {eventTypes.map(t => (
                <SelectItem key={t.id} value={t.name}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                    {t.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Statut</Label>
          <Select value={formData.status} onValueChange={setVal('status')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
        <div><Label>Date de début</Label><Input type="datetime-local" value={formData.start_date} onChange={set('start_date')} /></div>
        <div><Label>Date de fin</Label><Input type="datetime-local" value={formData.end_date} onChange={set('end_date')} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Contact associé</Label>
          <UniversalSearch filterTypes={['contact']} selectedId={formData.contact_id} onSelect={(item: SearchItem) => onChange({ contact_id: item.id })} triggerText="Rechercher un contact" placeholder="Rechercher contact par nom, email, ID..." />
        </div>
        <div>
          <Label>Spectacle associé</Label>
          <UniversalSearch filterTypes={['artist']} selectedId={formData.artist_id} onSelect={(item: SearchItem) => onChange({ artist_id: item.id })} triggerText="Rechercher un spectacle" placeholder="Rechercher spectacle par nom, genre..." />
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
      <div><Label>Exigences techniques</Label><MentionableTextarea value={formData.requirements} onChange={setVal('requirements')} rows={3} placeholder="Tapez @ pour mentionner" /></div>
      <div><Label>Notes</Label><MentionableTextarea value={formData.notes} onChange={setVal('notes')} rows={3} placeholder="Tapez @ pour mentionner" /></div>
      <div><Label>Lien de réservation</Label><Input type="url" placeholder="https://..." value={formData.booking_url} onChange={set('booking_url')} /></div>
      <div>
        <Label>Propriétaire</Label>
        <Select value={formData.owner_id || 'none'} onValueChange={v => onChange({ owner_id: v === 'none' ? '' : v })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un propriétaire" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none"><div className="flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground" />Aucun propriétaire</div></SelectItem>
            {activeUsers.map(u => (
              <SelectItem key={u.user_id} value={u.user_id}>
                <div className="flex items-center gap-2"><User className="h-4 w-4" />{u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username || u.email}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Créer')}</Button>
      </div>
    </form>
  );
};
