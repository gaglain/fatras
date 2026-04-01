import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays } from 'lucide-react';
import { UniversalSearch } from '@/components/UniversalSearch';

export const defaultOpportunityForm = {
  title: '',
  description: '',
  venue: '',
  location: '',
  date: '',
  budget: 0,
  probability_percentage: 50,
  status: 'open' as 'open' | 'applied' | 'won' | 'lost',
  deadline: '',
  requirements: '',
  contact: '',
  artist_id: '',
  contact_id: '',
  event_id: '',
  task_id: '',
  owner_id: ''
};

export type OpportunityFormData = typeof defaultOpportunityForm;

interface OpportunityFormDialogProps {
  open: boolean;
  onClose: () => void;
  formData: OpportunityFormData;
  setFormData: React.Dispatch<React.SetStateAction<OpportunityFormData>>;
  isEditing: boolean;
  onSave: () => void;
  contacts: any[];
  events: any[];
  artists: any[];
  tasks: any[];
  users: any[];
}

export const OpportunityFormDialog: React.FC<OpportunityFormDialogProps> = ({
  open, onClose, formData, setFormData, isEditing, onSave, contacts, events, artists, tasks, users,
}) => {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier l'opportunité" : 'Créer une nouvelle opportunité'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">Titre *</label>
            <Input value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Titre de l'opportunité" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Venue *</label>
            <Input value={formData.venue} onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))} placeholder="Nom du lieu" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Localisation</label>
            <Input value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))} placeholder="Ville, pays" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <Input type="date" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Budget (€)</label>
            <Input type="number" value={formData.budget} onChange={(e) => setFormData(prev => ({ ...prev, budget: Number(e.target.value) }))} placeholder="0" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Probabilité (%)</label>
            <Select value={String(formData.probability_percentage)} onValueChange={(value) => setFormData(prev => ({ ...prev, probability_percentage: parseInt(value) }))}>
              <SelectTrigger><SelectValue placeholder="Choisir une probabilité" /></SelectTrigger>
              <SelectContent>
                {[10,20,30,40,50,60,70,80,90,100].map((p) => (
                  <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Statut</label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Ouverte</SelectItem>
                <SelectItem value="applied">Candidaturé</SelectItem>
                <SelectItem value="won">Remportée</SelectItem>
                <SelectItem value="lost">Perdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Propriétaire</label>
            <Select value={formData.owner_id || '_none'} onValueChange={(value) => setFormData(prev => ({ ...prev, owner_id: value === '_none' ? '' : value }))}>
              <SelectTrigger><SelectValue placeholder="Sélectionner un propriétaire" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">Aucun</SelectItem>
                {users.map((u: any) => (
                  <SelectItem key={u.user_id} value={u.user_id}>
                    {u.first_name || u.last_name ? `${u.first_name || ''} ${u.last_name || ''}`.trim() : u.username || u.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Description de l'opportunité" rows={3} />
          </div>
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium mb-1">Exigences</label>
            <Textarea value={formData.requirements} onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))} placeholder="Exigences techniques, artistiques..." rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date limite</label>
            <Input type="date" value={formData.deadline} onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contact</label>
            <Input value={formData.contact} onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))} placeholder="Email ou téléphone" />
          </div>

          <div className="col-span-1 md:col-span-2 border-t pt-4">
            <h3 className="text-sm font-semibold mb-3 flex items-center"><CalendarDays className="h-4 w-4 mr-2" />Liens avec d'autres éléments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Contact associé</label>
                <UniversalSearch filterTypes={['contact']} triggerText={(() => { const c = contacts.find((ct: any) => ct.id === formData.contact_id); return c ? `${c.first_name} ${c.last_name}` : 'Rechercher un contact...'; })()} onSelect={(item) => setFormData(prev => ({ ...prev, contact_id: item.id }))} placeholder="Rechercher un contact..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Événement associé</label>
                <UniversalSearch filterTypes={['event']} triggerText={(() => { const ev = events.find((e: any) => e.id === formData.event_id); return ev ? ev.title : 'Rechercher un événement...'; })()} onSelect={(item) => setFormData(prev => ({ ...prev, event_id: item.id }))} placeholder="Rechercher un événement..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Spectacle associé</label>
                <UniversalSearch filterTypes={['artist']} triggerText={(() => { const a = artists.find((ar: any) => ar.id === formData.artist_id); return a ? a.name : 'Rechercher un spectacle...'; })()} onSelect={(item) => setFormData(prev => ({ ...prev, artist_id: item.id }))} placeholder="Rechercher un spectacle..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tâche associée</label>
                <UniversalSearch filterTypes={['task']} triggerText={(() => { const t = (Array.isArray(tasks) ? tasks : []).find((tk: any) => tk.id === formData.task_id); return t ? t.title : 'Rechercher une tâche...'; })()} onSelect={(item) => setFormData(prev => ({ ...prev, task_id: item.id }))} placeholder="Rechercher une tâche..." />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} className="flex-1 w-full sm:w-auto">Annuler</Button>
          <Button onClick={onSave} className="flex-1 w-full sm:w-auto">{isEditing ? 'Modifier' : 'Créer'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
