import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle } from 'lucide-react';
import { Task } from '@/hooks/useTasks';

interface CompactTaskViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onTaskClick: (task: Task) => void;
}

export const CompactTaskView: React.FC<CompactTaskViewProps> = ({
  tasks,
  onUpdateStatus,
  onTaskClick
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminée';
      default: return 'Annulée';
    }
  };

  return (
    <div className="space-y-1">
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucune tâche</p>
      ) : (
        tasks.map((task) => {
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
          
          return (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-4 py-2 px-3 hover:bg-accent/50 rounded-lg border transition-colors ${
                isOverdue ? 'bg-red-50/50 dark:bg-red-950/20' : ''
              }`}
            >
              {/* Left: Checkbox + Title */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
                    onUpdateStatus(task.id, newStatus);
                  }}
                  className="shrink-0"
                >
                  {task.status === 'completed' ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  )}
                </button>
                
                <span 
                  className={`text-sm font-medium truncate cursor-pointer ${
                    task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                  }`}
                  onClick={() => onTaskClick(task)}
                >
                  {task.title}
                </span>
              </div>

              {/* Right: Status, Type, Date, Priority, Actions */}
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant="outline" className="text-xs">
                  {getStatusBadge(task.status)}
                </Badge>
                
                {task.task_type && (
                  <span className="text-xs text-muted-foreground">{task.task_type}</span>
                )}
                
                {task.due_date && (
                  <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                    {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </span>
                )}
                
                <span className={`text-xl ${getPriorityColor(task.priority)}`}>•</span>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTaskClick(task)}
                  className="h-7 px-2"
                >
                  Modifier
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
