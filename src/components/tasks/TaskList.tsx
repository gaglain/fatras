
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, User, Clock, AlertCircle, Trash2, Mail, Edit } from 'lucide-react';
import { useContacts } from '@/hooks/useContacts';
import { TaskEditor } from './TaskEditor';
import { TaskExecuteButton } from './TaskExecuteButton';
import { Task } from '@/hooks/useTasks';

interface TaskDisplayData {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  category: 'follow_up' | 'contract' | 'event_prep' | 'marketing' | 'admin';
  createdAt: string;
}

interface TaskListProps {
  tasks: TaskDisplayData[];
  rawTasks?: Task[];
  onUpdateTaskStatus: (taskId: string, status: TaskDisplayData['status']) => void;
  onDeleteTask?: (taskId: string) => void;
  onSendEmail?: (contactEmail: string, taskTitle: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, rawTasks, onUpdateTaskStatus, onDeleteTask, onSendEmail }) => {
  const { contacts } = useContacts();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return priority;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const getTaskContact = (assignedTo: string) => {
    return contacts.find(contact => contact.id === assignedTo);
  };

  if (tasks.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-gray-500">Aucune tâche trouvée</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <Card key={task.id} className={`hover:shadow-md transition-shadow ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'border-red-200 bg-red-50/30' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold">{task.title}</h3>
                  <Badge className={getPriorityColor(task.priority)}>
                    {getPriorityLabel(task.priority)}
                  </Badge>
                  {isOverdue(task.dueDate) && task.status !== 'completed' && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      En retard
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 mb-3">{task.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  {task.assignedToName && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Assigné à: {task.assignedToName}</span>
                    </div>
                  )}
                  {task.dueDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Select 
                    value={task.status} 
                    onValueChange={(value: TaskDisplayData['status']) => onUpdateTaskStatus(task.id, value)}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">À faire</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminée</SelectItem>
                      <SelectItem value="cancelled">Annulée</SelectItem>
                    </SelectContent>
                  </Select>
                  
                   {(() => {
                     const rawTask = rawTasks?.find(t => t.id === task.id);
                     const contact = getTaskContact(task.assignedTo);
                     
                     return rawTask ? (
                       <TaskExecuteButton
                         taskType={rawTask.task_type || 'Autre'}
                         contactEmail={contact?.email}
                         contactPhone={contact?.phone}
                         taskTitle={task.title}
                       />
                     ) : null;
                   })()}
                   
                   <Button
                     variant="outline"
                     size="sm"
                     onClick={() => {
                       const rawTask = rawTasks?.find(t => t.id === task.id);
                       if (rawTask) setEditingTask(rawTask);
                     }}
                     className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                   >
                     <Edit className="h-4 w-4 mr-1" />
                     Modifier
                   </Button>
                  
                  {onDeleteTask && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {editingTask && (
        <TaskEditor
          task={editingTask}
          isOpen={!!editingTask}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={() => setEditingTask(null)}
        />
      )}
    </div>
  );
};
