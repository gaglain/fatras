
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, Plus, User } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface TaskCreatorProps {
  onTaskCreated?: (task: any) => void;
  relatedToId?: string;
  relatedToType?: 'contact' | 'event' | 'contract';
}

// Sample contacts data - in a real app, this would come from a database
const sampleContacts = [
  { id: 'contact-1', firstName: 'Jean', lastName: 'Dupont', company: 'Productions Musicales' },
  { id: 'contact-2', firstName: 'Marie', lastName: 'Martin', company: 'Festival d\'été' },
  { id: 'contact-3', firstName: 'Paul', lastName: 'Leroy', company: 'Studio Sound' },
  { id: 'contact-4', firstName: 'Sophie', lastName: 'Bernard', company: 'Event Manager' }
];

export const TaskCreator: React.FC<TaskCreatorProps> = ({ 
  onTaskCreated, 
  relatedToId, 
  relatedToType 
}) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { users, currentUser } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: currentUser?.id || '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    relatedToId: relatedToId || '',
    relatedToType: relatedToType || 'contact'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setLoading(true);
    try {
      const newTask = {
        id: `task-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || ''
      };

      onTaskCreated?.(newTask);
      toast.success('Tâche créée avec succès');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        assignedTo: currentUser?.id || '',
        dueDate: '',
        priority: 'medium',
        status: 'todo',
        relatedToId: '',
        relatedToType: 'contact'
      });
    } catch (error) {
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const getContactName = (contactId: string) => {
    const contact = sampleContacts.find(c => c.id === contactId);
    return contact ? `${contact.firstName} ${contact.lastName}` : '';
  };

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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relatedContact">Contact lié</Label>
            <Select 
              value={formData.relatedToId} 
              onValueChange={(value) => setFormData({ ...formData, relatedToId: value, relatedToType: 'contact' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un contact (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Aucun contact</SelectItem>
                {sampleContacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{contact.firstName} {contact.lastName}</span>
                      {contact.company && <span className="text-xs text-muted-foreground">({contact.company})</span>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigné à</Label>
              <Select value={formData.assignedTo} onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(user => user.isActive).map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priorité</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
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

          <div className="space-y-2">
            <Label htmlFor="dueDate">Date d'échéance</Label>
            <Input
              id="dueDate"
              type="date"
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
