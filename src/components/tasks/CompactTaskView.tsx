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
        className={`flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded cursor-pointer transition-colors border-b last:border-b-0 ${
          isOverdue ? 'bg-red-50/50' : ''
        }`}
        onClick={() => onTaskClick(task)}
      >
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
          
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded ${
            task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {task.status === 'todo' ? 'À faire' :
             task.status === 'in_progress' ? 'En cours' :
             task.status === 'completed' ? 'Terminée' : 'Annulée'}
          </span>
          
          {task.task_type && (
            <span className="text-xs text-muted-foreground">{task.task_type}</span>
          )}
          
          {task.due_date && (
            <span className="text-xs text-muted-foreground">
              {new Date(task.due_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
            </span>
          )}
          
          {isOverdue && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          
          <span className={`text-xl ${getPriorityColor(task.priority)}`}>•</span>
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
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {todoTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune tâche</p>
          ) : (
            <div className="divide-y">
              {todoTasks.map(renderTaskRow)}
            </div>
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
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {inProgressTasks.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune tâche</p>
          ) : (
            <div className="divide-y">
              {inProgressTasks.map(renderTaskRow)}
            </div>
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
        <CardContent className="p-0 max-h-96 overflow-y-auto">
          {completedToday.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Aucune tâche</p>
          ) : (
            <div className="divide-y">
              {completedToday.map(renderTaskRow)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
