
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, User, Target, Calendar } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface TaskCreatorProps {
  onTaskCreated?: (task: any) => void;
  relatedToId?: string;
  relatedToType?: 'contact' | 'event' | 'contract' | 'opportunity';
}

// Sample data - in a real app, this would come from databases
const sampleContacts = [
  { id: 'contact-1', firstName: 'Jean', lastName: 'Dupont', company: 'Productions Musicales' },
  { id: 'contact-2', firstName: 'Marie', lastName: 'Martin', company: 'Festival d\'été' },
  { id: 'contact-3', firstName: 'Paul', lastName: 'Leroy', company: 'Studio Sound' },
  { id: 'contact-4', firstName: 'Sophie', lastName: 'Bernard', company: 'Event Manager' }
];

const sampleOpportunities = [
  { id: 'opp-1', title: 'Festival d\'Été 2024', artist: 'The Midnight Express', estimatedAmount: '50000€' },
  { id: 'opp-2', title: 'Soirée Acoustique', artist: 'Sarah Mitchell', estimatedAmount: '8500€' },
  { id: 'opp-3', title: 'Rock Legends Tour', artist: 'Thunder Road', estimatedAmount: '75000€' }
];

const sampleEvents = [
  { id: 'event-1', title: 'Concert Central Park', venue: 'Central Park', date: '2024-07-15' },
  { id: 'event-2', title: 'Soirée Jazz Club', venue: 'Blue Note', date: '2024-06-20' }
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
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'done',
    relatedToId: relatedToId || '',
    relatedToType: (relatedToType || 'contact') as 'contact' | 'event' | 'contract' | 'opportunity'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    setLoading(true);
    try {
      const newTask = {
        id: `task-${Date.now()}`,
        ...formData,
        createdAt: new Date().toISOString(),
        createdBy: currentUser?.id || ''
      };

      console.log('Creating new task:', newTask);
      onTaskCreated?.(newTask);
      toast.success('Tâche créée avec succès');
      
      // Reset form
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
      setOpen(false);
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const getRelatedItems = () => {
    switch (formData.relatedToType) {
      case 'contact':
        return sampleContacts.map(item => ({
          id: item.id,
          name: `${item.firstName} ${item.lastName}`,
          subtitle: item.company,
          icon: User
        }));
      case 'opportunity':
        return sampleOpportunities.map(item => ({
          id: item.id,
          name: item.title,
          subtitle: `${item.artist} - ${item.estimatedAmount}`,
          icon: Target
        }));
      case 'event':
        return sampleEvents.map(item => ({
          id: item.id,
          name: item.title,
          subtitle: `${item.venue} - ${item.date}`,
          icon: Calendar
        }));
      default:
        return [];
    }
  };

  const relatedItems = getRelatedItems();

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

          <div className="space-y-2">
            <Label htmlFor="relatedType">Type de relation</Label>
            <Select 
              value={formData.relatedToType} 
              onValueChange={(value) => setFormData({ 
                ...formData, 
                relatedToType: value as 'contact' | 'event' | 'contract' | 'opportunity', 
                relatedToId: '' 
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contact">Contact</SelectItem>
                <SelectItem value="opportunity">Opportunité</SelectItem>
                <SelectItem value="event">Événement</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="relatedItem">Élément lié</Label>
            <Select 
              value={formData.relatedToId} 
              onValueChange={(value) => setFormData({ ...formData, relatedToId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un élément (optionnel)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no-item">Aucun élément</SelectItem>
                {relatedItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <SelectItem key={item.id} value={item.id}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" />
                        <div>
                          <span>{item.name}</span>
                          {item.subtitle && <span className="text-xs text-muted-foreground ml-1">({item.subtitle})</span>}
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
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
              <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
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
