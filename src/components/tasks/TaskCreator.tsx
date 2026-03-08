
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, User, Target, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useCentralizedData } from '@/hooks/useCentralizedData';
import { UniversalSearch } from '@/components/UniversalSearch';
import { toast } from 'sonner';

interface TaskCreatorProps {
  onTaskCreated?: (task: any) => void;
  relatedToId?: string;
  relatedToType?: 'contact' | 'event' | 'contract' | 'opportunity';
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ 
  onTaskCreated, 
  relatedToId, 
  relatedToType 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { users, currentUser } = useUser();
  const { contacts } = useContacts();
  const { events } = useEvents();
  const { artists: spectacles } = useCentralizedData();
  const { addTask } = useTasks();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: currentUser?.id || '',
    contactId: 'none',
    eventId: 'none',
    artistId: 'none',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
    taskType: 'Autre' as 'Email' | 'Telephone' | 'RDV' | 'Autre',
    relatedToId: relatedToId || '',
    relatedToType: (relatedToType || 'contact') as 'contact' | 'event' | 'contract' | 'opportunity'
  });

  // États pour les éléments sélectionnés via recherche
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    if (!formData.assignedTo) {
      toast.error('Veuillez assigner la tâche à un utilisateur');
      return;
    }

    setLoading(true);
    
    try {
      const taskData = {
        user_id: currentUser?.id || '',
        assigned_to: formData.assignedTo && formData.assignedTo !== 'none' ? formData.assignedTo : null,
        contact_id: selectedContact ? selectedContact.id : null,
        event_id: selectedEvent ? selectedEvent.id : null,
        artist_id: formData.artistId && formData.artistId !== 'none' ? formData.artistId : null,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status === 'done' ? 'completed' : formData.status as 'todo' | 'in_progress' | 'completed',
        task_type: formData.taskType,
        due_date: formData.dueDate || null,
        tags: []
      };

      const newTask = await addTask(taskData);
      
      if (onTaskCreated) {
        onTaskCreated(newTask);
      }
      
      toast.success('Tâche créée avec succès');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        assignedTo: currentUser?.id || '',
        contactId: 'none',
        eventId: 'none',
        artistId: 'none',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        taskType: 'Autre',
        relatedToId: '',
        relatedToType: 'contact'
      });
      
      setSelectedContact(null);
      setSelectedEvent(null);
      setOpen(false);
    } catch {
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les utilisateurs actifs avec des IDs valides
  const activeUsers = users.filter(user => user.isActive && user.id && user.name);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <CheckSquare className="h-4 w-4" />
          Créer Tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        <DialogHeader>
          <DialogTitle>Créer une nouvelle tâche</DialogTitle>
          <DialogDescription>
            Créez une tâche et assignez-la à un membre de l'équipe
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
              <Label htmlFor="assignedTo">Assigné à *</Label>
              <Select 
                value={formData.assignedTo} 
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {activeUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="taskType">Type de tâche</Label>
              <Select 
                value={formData.taskType} 
                onValueChange={(value) => setFormData({ ...formData, taskType: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">📧 Email</SelectItem>
                  <SelectItem value="Telephone">📞 Téléphone</SelectItem>
                  <SelectItem value="RDV">📅 Rendez-vous</SelectItem>
                  <SelectItem value="Autre">📋 Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
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

          <div className="space-y-2">
            <Label htmlFor="contactId">Contact lié</Label>
            <UniversalSearch
              filterTypes={['contact']}
              onSelect={(item) => setSelectedContact(item.data)}
              placeholder="Rechercher un contact..."
              triggerText={selectedContact ? `${selectedContact.external_id || ''} ${selectedContact.first_name} ${selectedContact.last_name}`.trim() : "Rechercher un contact..."}
            />
            {selectedContact && (
              <div className="text-sm text-muted-foreground mt-1">
                Contact sélectionné: {selectedContact.external_id && `${selectedContact.external_id} - `}{selectedContact.first_name} {selectedContact.last_name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventId">Événement lié</Label>
            <UniversalSearch
              filterTypes={['event']}
              onSelect={(item) => setSelectedEvent(item.data)}
              placeholder="Rechercher un événement..."
              triggerText={selectedEvent ? `${selectedEvent.external_id || ''} ${selectedEvent.title}`.trim() : "Rechercher un événement..."}
            />
            {selectedEvent && (
              <div className="text-sm text-muted-foreground mt-1">
                Événement sélectionné: {selectedEvent.external_id && `${selectedEvent.external_id} - `}{selectedEvent.title}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="artistId">Spectacle lié</Label>
            <Select 
              value={formData.artistId} 
              onValueChange={(value) => setFormData({ ...formData, artistId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un spectacle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun spectacle</SelectItem>
                {spectacles.slice(0, 50).map((spectacle) => (
                  <SelectItem key={spectacle.id} value={spectacle.id}>
                    {spectacle.name} - {spectacle.genre}
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
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer la tâche'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
