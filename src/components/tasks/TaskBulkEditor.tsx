import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Task } from '@/hooks/useTasks';
import { useUser } from '@/contexts/UserContext';

interface TaskBulkEditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTasks: Task[];
  onBulkUpdate: (taskIds: string[], updates: Partial<Task>) => Promise<void>;
}

export const TaskBulkEditor: React.FC<TaskBulkEditorProps> = ({
  isOpen,
  onClose,
  selectedTasks,
  onBulkUpdate
}) => {
  const { users } = useUser();
  const [loading, setLoading] = useState(false);
  const [updates, setUpdates] = useState<{
    status?: 'todo' | 'in_progress' | 'completed' | 'cancelled';
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
    due_date?: string;
  }>({});

  const handleSubmit = async () => {
    if (Object.keys(updates).length === 0) {
      toast.error('Sélectionnez au moins un champ à modifier');
      return;
    }

    setLoading(true);
    try {
      const taskIds = selectedTasks.map(t => t.id);
      await onBulkUpdate(taskIds, updates);
      toast.success(`${selectedTasks.length} tâche(s) mise(s) à jour`);
      onClose();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUpdates({});
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Modifier {selectedTasks.length} tâche{selectedTasks.length > 1 ? 's' : ''}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            Seuls les champs que vous modifiez seront appliqués aux tâches sélectionnées.
          </p>

          <div className="space-y-2">
            <Label>Statut</Label>
            <Select
              value={updates.status || ''}
              onValueChange={(value) => setUpdates(prev => ({ 
                ...prev, 
                status: value as any || undefined 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ne pas modifier" />
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
            <Label>Priorité</Label>
            <Select
              value={updates.priority || ''}
              onValueChange={(value) => setUpdates(prev => ({ 
                ...prev, 
                priority: value as any || undefined 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ne pas modifier" />
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
            <Label>Assigné à</Label>
            <Select
              value={updates.assigned_to || ''}
              onValueChange={(value) => setUpdates(prev => ({ 
                ...prev, 
                assigned_to: value || undefined 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Ne pas modifier" />
              </SelectTrigger>
              <SelectContent>
                {users.filter(u => u.isActive && u.id).map(user => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Date d'échéance</Label>
            <Input
              type="datetime-local"
              value={updates.due_date ? new Date(updates.due_date).toISOString().slice(0, 16) : ''}
              onChange={(e) => setUpdates(prev => ({ 
                ...prev, 
                due_date: e.target.value ? new Date(e.target.value).toISOString() : undefined 
              }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Mise à jour...' : 'Appliquer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
