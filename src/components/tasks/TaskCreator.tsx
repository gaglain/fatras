
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, User, Target, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
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
  const { addTask } = useTasks();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: currentUser?.id || '',
    contactId: 'none',
    eventId: 'none',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
    taskType: 'Autre' as 'Email' | 'Telephone' | 'RDV' | 'Autre',
    relatedToId: relatedToId || '',
    relatedToType: (relatedToType || 'contact') as 'contact' | 'event' | 'contract' | 'opportunity'
  });

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
        assigned_to: formData.assignedTo !== 'none' ? formData.assignedTo : undefined,
        contact_id: formData.contactId !== 'none' ? formData.contactId : undefined,
        event_id: formData.eventId !== 'none' ? formData.eventId : undefined,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        status: formData.status === 'done' ? 'completed' : formData.status as 'todo' | 'in_progress' | 'completed',
        task_type: formData.taskType,
        due_date: formData.dueDate || undefined,
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
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        taskType: 'Autre',
        relatedToId: '',
        relatedToType: 'contact'
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
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
      <DialogContent className="max-w-md">
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
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Description détaillée de la tâche"
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
            <Select 
              value={formData.contactId} 
              onValueChange={(value) => setFormData({ ...formData, contactId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun contact</SelectItem>
                {contacts.slice(0, 50).map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.first_name} {contact.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventId">Événement lié</Label>
            <Select 
              value={formData.eventId} 
              onValueChange={(value) => setFormData({ ...formData, eventId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un événement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun événement</SelectItem>
                {events.slice(0, 50).map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
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
