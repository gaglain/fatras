import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, CheckSquare, Clock, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { UniversalEntitySearch } from '@/components/shared/UniversalEntitySearch';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface TaskEventManagerProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
  onUpdate?: () => void;
}

interface LinkedTask {
  id: string;
  title: string;
  status: string | null;
  due_date: string | null;
  priority: string | null;
}

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'todo': return 'À faire';
    case 'in_progress': return 'En cours';
    case 'done': return 'Terminé';
    default: return status || 'Non défini';
  }
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'todo': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'done': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityLabel = (priority: string | null) => {
  switch (priority) {
    case 'high': return 'Haute';
    case 'medium': return 'Moyenne';
    case 'low': return 'Basse';
    default: return priority || '';
  }
};

export const TaskEventManager: React.FC<TaskEventManagerProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLinkedTasks = async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id, title, status, due_date, priority')
        .eq('event_id', eventId);

      if (error) throw error;
      setLinkedTasks(data || []);
    } catch (error: any) {
      console.error('Error fetching linked tasks:', error);
      toast.error('Erreur lors du chargement des tâches liées');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLinkedTasks();
    }
  }, [isOpen, eventId]);

  const handleSelectTask = async (task: { id: string; title: string }) => {
    try {
      // Update the task to link it to this event
      const { error } = await supabase
        .from('tasks')
        .update({ event_id: eventId })
        .eq('id', task.id);

      if (error) throw error;

      toast.success('Tâche liée avec succès');
      fetchLinkedTasks();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error linking task:', error);
      toast.error('Erreur lors de la liaison de la tâche');
    }
  };

  const handleUnlinkTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ event_id: null })
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Tâche détachée avec succès');
      fetchLinkedTasks();
      onUpdate?.();
    } catch (error: any) {
      console.error('Error unlinking task:', error);
      toast.error('Erreur lors du détachement de la tâche');
    }
  };

  const excludeIds = linkedTasks.map(t => t.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Gérer les tâches - {eventTitle}
          </DialogTitle>
          <DialogDescription>
            Liez des tâches existantes à cet événement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and add tasks */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rechercher et ajouter une tâche</label>
            <UniversalEntitySearch
              entityTypes={['task']}
              excludeIds={excludeIds}
              onSelect={handleSelectTask}
              placeholder="Rechercher une tâche..."
            />
          </div>

          <Separator />

          {/* Linked tasks list */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Tâches liées ({linkedTasks.length})
            </label>
            
            <ScrollArea className="h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : linkedTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune tâche liée à cet événement</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {linkedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="font-medium truncate">{task.title}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getStatusColor(task.status)}>
                            {getStatusLabel(task.status)}
                          </Badge>
                          {task.priority && (
                            <Badge className={getPriorityColor(task.priority)}>
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {getPriorityLabel(task.priority)}
                            </Badge>
                          )}
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkTask(task.id)}
                        className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
