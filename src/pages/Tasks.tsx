
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Search, Plus, Trash } from 'lucide-react';
import { toast } from 'sonner';
import { TaskCreator } from '@/components/tasks/TaskCreator';
import { TaskList } from '@/components/tasks/TaskList';
import { useUser } from '@/contexts/UserContext';
import { useTasks } from '@/hooks/useTasks';
import { EmailComposer } from '@/components/email/EmailComposer';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  createdBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  category: 'follow_up' | 'contract' | 'event_prep' | 'marketing' | 'admin';
  createdAt: string;
}

export const Tasks: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [emailComposer, setEmailComposer] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    preText: string;
  }>({
    isOpen: false,
    to: '',
    subject: '',
    preText: ''
  });
  const { users } = useUser();
  const { tasks, loading, updateTask, deleteTask } = useTasks();

  const handleTaskCreated = async () => {
    // Recharger les tâches après création
    window.location.reload();
    toast.success('Tâche créée avec succès');
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Statut de la tâche mis à jour');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la tâche');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      toast.success('Tâche supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression de la tâche');
    }
  };

  const handleSendTaskEmail = (contactEmail: string, taskTitle: string) => {
    setEmailComposer({
      isOpen: true,
      to: contactEmail,
      subject: `Concernant la tâche: ${taskTitle}`,
      preText: `Bonjour,\n\nJe vous contacte concernant la tâche "${taskTitle}".\n\n`
    });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || task.assigned_to === selectedUser;
    const matchesCategory = selectedCategory === 'all' || true; // Remove category filter for now
    return matchesSearch && matchesUser && matchesCategory;
  });

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Tâches</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Organisez et suivez toutes vos tâches</p>
        </div>
        <TaskCreator onTaskCreated={handleTaskCreated} />
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative w-full sm:flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les utilisateurs</SelectItem>
              {users.filter(user => user.isActive).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              <SelectItem value="follow_up">Suivi Client</SelectItem>
              <SelectItem value="contract">Contrat</SelectItem>
              <SelectItem value="event_prep">Préparation Événement</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="admin">Administration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Toutes ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="todo">À faire ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">En cours ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <TaskList 
            tasks={filteredTasks.map(task => ({
              ...task,
              assignedTo: task.assigned_to || '',
              assignedToName: users.find(u => u.id === task.assigned_to)?.name || 'Non assigné',
              dueDate: task.due_date || '',
              createdAt: task.created_at,
              createdBy: task.user_id,
              category: 'admin' as const,
              description: task.description || ''
            }))}
            rawTasks={filteredTasks}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSendEmail={handleSendTaskEmail}
          />
        </TabsContent>

        <TabsContent value="todo">
          <TaskList 
            tasks={todoTasks.map(task => ({
              ...task,
              assignedTo: task.assigned_to || '',
              assignedToName: users.find(u => u.id === task.assigned_to)?.name || 'Non assigné',
              dueDate: task.due_date || '',
              createdAt: task.created_at,
              createdBy: task.user_id,
              category: 'admin' as const,
              description: task.description || ''
            }))}
            rawTasks={todoTasks}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSendEmail={handleSendTaskEmail}
          />
        </TabsContent>

        <TabsContent value="in_progress">
          <TaskList 
            tasks={inProgressTasks.map(task => ({
              ...task,
              assignedTo: task.assigned_to || '',
              assignedToName: users.find(u => u.id === task.assigned_to)?.name || 'Non assigné',
              dueDate: task.due_date || '',
              createdAt: task.created_at,
              createdBy: task.user_id,
              category: 'admin' as const,
              description: task.description || ''
            }))}
            rawTasks={inProgressTasks}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSendEmail={handleSendTaskEmail}
          />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList 
            tasks={completedTasks.map(task => ({
              ...task,
              assignedTo: task.assigned_to || '',
              assignedToName: users.find(u => u.id === task.assigned_to)?.name || 'Non assigné',
              dueDate: task.due_date || '',
              createdAt: task.created_at,
              createdBy: task.user_id,
              category: 'admin' as const,
              description: task.description || ''
            }))}
            rawTasks={completedTasks}
            onUpdateTaskStatus={updateTaskStatus}
            onDeleteTask={handleDeleteTask}
            onSendEmail={handleSendTaskEmail}
          />
        </TabsContent>
      </Tabs>

      <EmailComposer
        isOpen={emailComposer.isOpen}
        onClose={() => setEmailComposer({ isOpen: false, to: '', subject: '', preText: '' })}
        toEmail={emailComposer.to}
        subject={emailComposer.subject}
        preText={emailComposer.preText}
      />
    </div>
  );
};
