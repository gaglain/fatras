import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, Circle, Trash } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { TaskExecuteButton } from './TaskExecuteButton';

interface CompactTaskViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  selectedTaskIds?: string[];
  onToggleSelection?: (taskId: string) => void;
  onSelectAll?: () => void;
}

export const CompactTaskView: React.FC<CompactTaskViewProps> = ({
  tasks,
  onUpdateStatus,
  onTaskClick,
  onDeleteTask,
  selectedTaskIds = [],
  onToggleSelection,
  onSelectAll
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

  const allSelected = tasks.length > 0 && selectedTaskIds.length === tasks.length;

  return (
    <div className="space-y-1">
      {tasks.length > 0 && onToggleSelection && (
        <div className="flex items-center gap-3 py-2 px-3 border-b mb-2">
          <Checkbox
            checked={allSelected}
            onCheckedChange={() => onSelectAll?.()}
          />
          <span className="text-sm text-muted-foreground">
            {selectedTaskIds.length > 0 
              ? `${selectedTaskIds.length} sélectionnée(s)`
              : 'Tout sélectionner'
            }
          </span>
        </div>
      )}
      
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">Aucune tâche</p>
      ) : (
        tasks.map((task) => {
          const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
          const isSelected = selectedTaskIds.includes(task.id);
          
          return (
            <div
              key={task.id}
              className={`py-2 px-3 hover:bg-accent/50 rounded-lg border transition-colors ${
                isOverdue ? 'bg-red-50/50 dark:bg-red-950/20' : ''
              } ${isSelected ? 'bg-primary/10 border-primary/30' : ''}`}
            >
              {/* Mobile: Stack layout */}
              <div className="flex items-start gap-2">
                {/* Selection + Complete checkboxes */}
                <div className="flex items-center gap-2 pt-0.5">
                  {onToggleSelection && (
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => onToggleSelection(task.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="h-4 w-4"
                    />
                  )}
                  
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
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] sm:text-xs shrink-0">
                      {getStatusBadge(task.status)}
                    </Badge>
                    
                    <span 
                      className={`text-sm font-medium cursor-pointer break-words ${
                        task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                      }`}
                      onClick={() => onTaskClick(task)}
                    >
                      {task.title}
                    </span>
                  </div>
                  
                  {/* Bottom row: metadata + actions */}
                  <div className="flex items-center justify-between gap-2 mt-1.5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {task.task_type && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <TaskExecuteButton task={task} />
                        </div>
                      )}
                      
                      {task.due_date && (
                        <span className={`${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                          {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      )}
                      
                      <span className={`text-lg ${getPriorityColor(task.priority)}`}>•</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onTaskClick(task)}
                        className="h-6 px-2 text-xs"
                      >
                        <span className="hidden sm:inline">Modifier</span>
                        <span className="sm:hidden">Éditer</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
                            onDeleteTask?.(task.id);
                          }
                        }}
                        className="h-6 px-1.5 text-destructive hover:text-destructive"
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
