import React, { useState, useRef, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { GripVertical, Calendar, AlertCircle, Trash, Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { TaskExecuteButton } from './TaskExecuteButton';
import { cn } from '@/lib/utils';

interface TaskKanbanViewProps {
  tasks: Task[];
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onTaskClick: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  selectedTaskIds?: string[];
  onToggleSelection?: (taskId: string) => void;
}

interface KanbanColumn {
  id: Task['status'];
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'À faire', color: 'text-blue-700', bgColor: 'bg-blue-50 dark:bg-blue-950/30', borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 'in_progress', title: 'En cours', color: 'text-amber-700', bgColor: 'bg-amber-50 dark:bg-amber-950/30', borderColor: 'border-amber-200 dark:border-amber-800' },
  { id: 'completed', title: 'Terminées', color: 'text-green-700', bgColor: 'bg-green-50 dark:bg-green-950/30', borderColor: 'border-green-200 dark:border-green-800' },
];

const getPriorityIndicator = (priority: string) => {
  switch (priority) {
    case 'urgent': return { color: 'bg-red-500', label: 'Urgente' };
    case 'high': return { color: 'bg-orange-500', label: 'Haute' };
    case 'medium': return { color: 'bg-yellow-500', label: 'Moyenne' };
    default: return { color: 'bg-green-500', label: 'Basse' };
  }
};

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  onUpdateStatus,
  onTaskClick,
  onDeleteTask,
  selectedTaskIds = [],
  onToggleSelection,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  const handleDragStart = useCallback((e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) + 1;
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    dragCounter.current[columnId] = (dragCounter.current[columnId] || 0) - 1;
    if (dragCounter.current[columnId] <= 0) {
      dragCounter.current[columnId] = 0;
      if (dragOverColumn === columnId) {
        setDragOverColumn(null);
      }
    }
  }, [dragOverColumn]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId && columnId) {
      const task = tasks.find(t => t.id === taskId);
      if (task && task.status !== columnId) {
        onUpdateStatus(taskId, columnId as Task['status']);
      }
    }
    setDraggedTaskId(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  }, [tasks, onUpdateStatus]);

  const getColumnTasks = (status: Task['status']) =>
    tasks.filter(t => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
      {columns.map((column) => {
        const columnTasks = getColumnTasks(column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className={cn(
              'rounded-xl border-2 border-dashed p-3 transition-all duration-200',
              column.bgColor,
              isOver ? `${column.borderColor} scale-[1.02] shadow-lg` : 'border-transparent'
            )}
            onDragEnter={(e) => handleDragEnter(e, column.id)}
            onDragLeave={(e) => handleDragLeave(e, column.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className={cn('font-semibold text-sm', column.color)}>
                  {column.title}
                </h3>
                <Badge variant="secondary" className="text-xs h-5 px-1.5">
                  {columnTasks.length}
                </Badge>
              </div>
            </div>

            {/* Task cards */}
            <div className="space-y-2 min-h-[100px]">
              {columnTasks.length === 0 && (
                <div className={cn(
                  'text-center py-8 text-xs text-muted-foreground rounded-lg border border-dashed',
                  isOver ? 'border-primary bg-primary/5' : 'border-muted'
                )}>
                  {isOver ? 'Déposer ici' : 'Aucune tâche'}
                </div>
              )}

              {columnTasks.map((task) => {
                const priority = getPriorityIndicator(task.priority);
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                const isDragging = draggedTaskId === task.id;

                return (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      'p-3 cursor-grab active:cursor-grabbing transition-all duration-150',
                      'hover:shadow-md border bg-card',
                      isDragging && 'opacity-50 scale-95',
                      isOverdue && 'border-destructive/40'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      {onToggleSelection && (
                        <Checkbox
                          checked={selectedTaskIds.includes(task.id)}
                          onCheckedChange={() => onToggleSelection(task.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 shrink-0 mt-0.5"
                        />
                      )}
                      <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0 opacity-40" />
                      
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Title + priority */}
                        <div className="flex items-start justify-between gap-1">
                          <span
                            className={cn(
                              'text-sm font-medium cursor-pointer hover:text-primary truncate',
                              task.status === 'completed' && 'line-through text-muted-foreground'
                            )}
                            onClick={() => onTaskClick(task)}
                          >
                            {task.title}
                          </span>
                          <div className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', priority.color)} title={priority.label} />
                        </div>

                        {/* Meta info */}
                        <div className="flex items-center gap-2 flex-wrap">
                          {task.due_date && (
                            <span className={cn(
                              'inline-flex items-center gap-1 text-[11px]',
                              isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                            )}>
                              {isOverdue && <AlertCircle className="h-3 w-3" />}
                              <Calendar className="h-3 w-3" />
                              {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                          {task.task_type && task.task_type !== 'Autre' && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1">
                              {task.task_type}
                            </Badge>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {task.task_type && (
                            <div onClick={(e) => e.stopPropagation()}>
                              <TaskExecuteButton task={task} />
                            </div>
                          )}
                          {onDeleteTask && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive ml-auto"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm('Supprimer cette tâche ?')) {
                                  onDeleteTask(task.id);
                                }
                              }}
                            >
                              <Trash className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
