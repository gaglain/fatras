
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Search, Plus, Trash, Upload, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { TaskCreator } from '@/components/tasks/TaskCreator';
import { TaskCSVImporter } from '@/components/tasks/TaskCSVImporter';
import { TaskList } from '@/components/tasks/TaskList';
import { CompactTaskView } from '@/components/tasks/CompactTaskView';
import { useUser } from '@/contexts/UserContext';
import { useTasks, Task as TaskType } from '@/hooks/useTasks';
import { EmailComposer } from '@/components/email/EmailComposer';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { NotificationTest } from '@/components/NotificationTest';

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
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('compact');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
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

  // Filtrer d'abord les tâches selon les critères
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || task.assigned_to === selectedUser;
    const matchesCategory = selectedCategory === 'all' || true;
    
    // Filtrage par date d'échéance
    const matchesDate = selectedDate === 'all' || (() => {
      if (!task.due_date) return selectedDate === 'no_date';
      
      const dueDate = new Date(task.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      
      switch (selectedDate) {
        case 'overdue':
          return dueDate < today;
        case 'today':
          return dueDate.toDateString() === today.toDateString();
        case 'tomorrow':
          return dueDate.toDateString() === tomorrow.toDateString();
        case 'this_week':
          return dueDate >= today && dueDate <= nextWeek;
        case 'no_date':
          return false;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesUser && matchesCategory && matchesDate;
  });

  // Séparer les tâches par statut APRÈS le filtrage
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
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">
            {todoTasks.length} à faire • {inProgressTasks.length} en cours • {completedTasks.length} terminées
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Compact
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            Liste
          </Button>
          <TaskCreator onTaskCreated={handleTaskCreated} />
        </div>
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
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filtrer par échéance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les échéances</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="tomorrow">Demain</SelectItem>
              <SelectItem value="this_week">Cette semaine</SelectItem>
              <SelectItem value="no_date">Sans date</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Date d'échéance</SelectItem>
              <SelectItem value="priority">Priorité</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
              <SelectItem value="createdAt">Date de création</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Croissant</SelectItem>
              <SelectItem value="desc">Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === 'compact' ? (
        <CompactTaskView
          tasks={filteredTasks}
          onUpdateStatus={updateTaskStatus}
          onTaskClick={(task) => setSelectedTask(task)}
        />
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">Toutes ({filteredTasks.length})</TabsTrigger>
            <TabsTrigger value="todo">À faire ({todoTasks.length})</TabsTrigger>
            <TabsTrigger value="in_progress">En cours ({inProgressTasks.length})</TabsTrigger>
            <TabsTrigger value="completed">Terminées ({completedTasks.length})</TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-1">
              <Upload className="h-3 w-3" />
              Import CSV
            </TabsTrigger>
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
            sortBy={sortBy}
            sortOrder={sortOrder}
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
            sortBy={sortBy}
            sortOrder={sortOrder}
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
            sortBy={sortBy}
            sortOrder={sortOrder}
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
            sortBy={sortBy}
            sortOrder={sortOrder}
          />
        </TabsContent>
        
          <TabsContent value="import">
            <TaskCSVImporter />
          </TabsContent>
        </Tabs>
      )}

      {selectedTask && (
        <TaskEditor
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onTaskUpdated={() => setSelectedTask(null)}
        />
      )}

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
