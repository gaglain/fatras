import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks, Task } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { UniversalSearch } from '@/components/UniversalSearch';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { notifyMentionsIfNeeded } from '@/utils/mentionNotifier';

interface TaskEditorProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: (task: Task) => void;
}

export const TaskEditor: React.FC<TaskEditorProps> = ({ 
  task,
  isOpen,
  onClose,
  onTaskUpdated
}) => {
  const [loading, setLoading] = useState(false);
  const { users, currentUser } = useUser();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { artists } = useCentralizedData();
  const { updateTask } = useTasks();
  
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    assigned_to: task.assigned_to || '',
    contact_id: task.contact_id || 'none',
    event_id: task.event_id || 'none',
    artist_id: task.artist_id || 'none',
    due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
    priority: task.priority,
    status: task.status,
    task_type: task.task_type || 'Autre',
    tags: task.tags || []
  });

  // États pour les éléments sélectionnés via recherche
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [contactCleared, setContactCleared] = useState(false);
  const [eventCleared, setEventCleared] = useState(false);

  // Réinitialiser les états quand la tâche change
  useEffect(() => {
    setFormData({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to || '',
      contact_id: task.contact_id || 'none',
      event_id: task.event_id || 'none',
      artist_id: task.artist_id || 'none',
      due_date: task.due_date ? new Date(task.due_date).toISOString().slice(0, 16) : '',
      priority: task.priority,
      status: task.status,
      task_type: task.task_type || 'Autre',
      tags: task.tags || []
    });
    
    // Reset states when task changes
    setContactCleared(false);
    setEventCleared(false);
    setSelectedContact(null);
    setSelectedEvent(null);
  }, [task.id]); // Only reset when task ID changes

  // Mettre à jour selectedContact quand les contacts sont chargés ou la tâche change
  // IMPORTANT: la liste contacts peut être limitée (pagination Supabase), donc on fetch aussi par ID si besoin.
  useEffect(() => {
    let cancelled = false;

    const resolveContact = async () => {
      if (!task.contact_id || contactCleared) return;

      const foundContact = contacts.find(c => c.id === task.contact_id);
      if (foundContact) {
        setSelectedContact(foundContact);
        return;
      }

      // Fallback: récupérer le contact directement par ID
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .eq('id', task.contact_id)
        .maybeSingle();

      if (!cancelled && data && !error) {
        setSelectedContact(data);
      }
    };

    resolveContact();

    return () => {
      cancelled = true;
    };
  }, [task.id, task.contact_id, contacts, contactCleared]);

  // Mettre à jour selectedEvent quand les events sont chargés ou la tâche change
  useEffect(() => {
    if (task.event_id && events.length > 0 && !eventCleared) {
      const foundEvent = events.find(e => e.id === task.event_id);
      if (foundEvent) {
        setSelectedEvent(foundEvent);
      }
    }
  }, [task.id, task.event_id, events, eventCleared]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    setLoading(true);
    
    try {
      // Déterminer le contact_id final:
      // - Si contactCleared est true, utiliser null
      // - Si selectedContact existe, utiliser son ID
      // - Sinon, préserver l'ID original
      let finalContactId: string | null = null;
      if (contactCleared) {
        finalContactId = null;
      } else if (selectedContact) {
        finalContactId = selectedContact.id;
      } else if (task.contact_id) {
        finalContactId = task.contact_id;
      }

      // Même logique pour event_id
      let finalEventId: string | null = null;
      if (eventCleared) {
        finalEventId = null;
      } else if (selectedEvent) {
        finalEventId = selectedEvent.id;
      } else if (task.event_id) {
        finalEventId = task.event_id;
      }

      const updates = {
        title: formData.title,
        description: formData.description,
        assigned_to: formData.assigned_to && formData.assigned_to !== 'none' ? formData.assigned_to : null,
        contact_id: finalContactId,
        event_id: finalEventId,
        artist_id: formData.artist_id && formData.artist_id !== 'none' ? formData.artist_id : null,
        priority: formData.priority,
        status: formData.status,
        task_type: formData.task_type,
        due_date: formData.due_date || null,
        tags: formData.tags
      };

      await updateTask(task.id, updates);

      // Notify mentioned users in description
      if (formData.description) {
        const sender = users.find(u => u.id === currentUser?.id);
        notifyMentionsIfNeeded({
          text: formData.description,
          senderUserId: currentUser?.id || '',
          senderName: sender?.name || 'Utilisateur',
          contextType: 'task',
          contextName: formData.title,
          contextId: task.id,
        });
      }
      
      if (onTaskUpdated) {
        onTaskUpdated({ ...task, ...updates });
      }
      
      toast.success('Tâche mise à jour avec succès');
      onClose();
    } catch {
      toast.error('Erreur lors de la mise à jour de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const activeUsers = users.filter(user => user.isActive && user.id && user.name);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Modifier la tâche
          </DialogTitle>
          <DialogDescription>
            Modifiez les détails de cette tâche
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Entrez le titre de la tâche"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <MentionableTextarea
              value={formData.description}
              onChange={(val) => setFormData({ ...formData, description: val })}
              rows={3}
              placeholder="Description détaillée... Tapez @ pour mentionner"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigné à</Label>
              <Select 
                value={formData.assigned_to || 'none'} 
                onValueChange={(value) => setFormData({ ...formData, assigned_to: value === 'none' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Non assigné</SelectItem>
                  {activeUsers.filter(u => u.id).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Basse</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({ ...formData, status: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                  <SelectItem value="cancelled">Annulée</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Type de tâche</Label>
              <Select 
                value={formData.task_type} 
                onValueChange={(value) => setFormData({ ...formData, task_type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Autre">Autre</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Telephone">Téléphone</SelectItem>
                  <SelectItem value="RDV">Rendez-vous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactId">Contact lié</Label>
            <UniversalSearch
              filterTypes={['contact']}
              onSelect={(item) => {
                setSelectedContact(item.data);
                setContactCleared(false);
              }}
              placeholder="Rechercher un contact..."
              triggerText={selectedContact ? `${selectedContact.external_id || ''} ${selectedContact.first_name} ${selectedContact.last_name}`.trim() : (task.contact_id && !contactCleared ? "Contact lié (chargement...)" : "Rechercher un contact...")}
            />
            {selectedContact && (
              <div className="text-sm text-muted-foreground mt-1">
                Contact sélectionné: {selectedContact.external_id && `${selectedContact.external_id} - `}{selectedContact.first_name} {selectedContact.last_name}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedContact(null);
                    setContactCleared(true);
                  }}
                  className="ml-2 h-auto p-1"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventId">Événement lié</Label>
            <UniversalSearch
              filterTypes={['event']}
              onSelect={(item) => {
                setSelectedEvent(item.data);
                setEventCleared(false);
              }}
              placeholder="Rechercher un événement..."
              triggerText={selectedEvent ? `${selectedEvent.external_id || ''} ${selectedEvent.title}`.trim() : (task.event_id && !eventCleared ? "Événement lié (chargement...)" : "Rechercher un événement...")}
            />
            {selectedEvent && (
              <div className="text-sm text-muted-foreground mt-1">
                Événement sélectionné: {selectedEvent.external_id && `${selectedEvent.external_id} - `}{selectedEvent.title}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setSelectedEvent(null);
                    setEventCleared(true);
                  }}
                  className="ml-2 h-auto p-1"
                >
                  ✕
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistId">Spectacle lié</Label>
            <Select 
              value={formData.artist_id || 'none'} 
              onValueChange={(value) => setFormData({ ...formData, artist_id: value === 'none' ? 'none' : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un spectacle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun spectacle</SelectItem>
                {artists.filter(a => a.id).slice(0, 50).map((artist) => (
                  <SelectItem key={artist.id} value={artist.id}>
                    {artist.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Date et heure d'échéance</Label>
            <Input
              id="dueDate"
              type="datetime-local"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};