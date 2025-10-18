import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
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
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedToday = tasks.filter(t => {
    if (t.status !== 'completed' || !t.completed_at) return false;
    const completedDate = new Date(t.completed_at);
    const today = new Date();
    return completedDate.toDateString() === today.toDateString();
  });

  const overdueTasks = todoTasks.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const renderTaskRow = (task: Task) => {
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
    
    return (
      <div
        key={task.id}
        className={`inline-flex items-center justify-between py-1.5 px-2.5 hover:bg-muted/50 rounded cursor-pointer transition-colors ${
          isOverdue ? 'bg-red-50/50' : ''
        }`}
        onClick={() => onTaskClick(task)}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              const newStatus = task.status === 'completed' ? 'todo' : 'completed';
              onUpdateStatus(task.id, newStatus);
            }}
            className="shrink-0"
          >
            {task.status === 'completed' ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Circle className="h-5 w-5 text-muted-foreground hover:text-primary" />
            )}
          </button>
          
          <div className="min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            {task.due_date && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {isOverdue && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xl ${getPriorityColor(task.priority)}`}>•</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>À faire</span>
            <Badge variant="secondary" className="ml-2">{todoTasks.length}</Badge>
          </CardTitle>
          {overdueTasks.length > 0 && (
            <p className="text-xs text-red-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              {overdueTasks.length} en retard
            </p>
          )}
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
          {todoTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center w-full">Aucune tâche</p>
          ) : (
            todoTasks.map(renderTaskRow)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>En cours</span>
            <Badge variant="secondary" className="ml-2">{inProgressTasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
          {inProgressTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center w-full">Aucune tâche</p>
          ) : (
            inProgressTasks.map(renderTaskRow)
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center justify-between">
            <span>Terminées aujourd'hui</span>
            <Badge variant="secondary" className="ml-2">{completedToday.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 max-h-96 overflow-y-auto">
          {completedToday.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center w-full">Aucune tâche</p>
          ) : (
            completedToday.map(renderTaskRow)
          )}
        </CardContent>
      </Card>
    </div>
  );
};
