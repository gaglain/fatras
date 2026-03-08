
import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Search, Plus, Trash, Upload, LayoutGrid, List, Edit, X, Filter, ChevronDown, ChevronUp, Columns3 } from 'lucide-react';
import { toast } from 'sonner';
import { TaskCreator } from '@/components/tasks/TaskCreator';
import { TaskCSVImporter } from '@/components/tasks/TaskCSVImporter';
import { TaskList } from '@/components/tasks/TaskList';
import { CompactTaskView } from '@/components/tasks/CompactTaskView';
import { TaskKanbanView } from '@/components/tasks/TaskKanbanView';
import { useUser } from '@/contexts/UserContext';
import { useTasks, Task as TaskType } from '@/hooks/useTasks';
import { EmailComposer } from '@/components/email/EmailComposer';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { TaskBulkEditor } from '@/components/tasks/TaskBulkEditor';
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
  const confirm = useConfirm();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'status' | 'createdAt'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'list' | 'compact' | 'kanban'>('compact');
  const [selectedTask, setSelectedTask] = useState<TaskType | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [bulkEditorOpen, setBulkEditorOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
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

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(taskId) 
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId]
    );
  };

  const selectAllTasks = () => {
    if (selectedTaskIds.length === sortedTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(sortedTasks.map(t => t.id));
    }
  };

  const handleBulkUpdate = async (taskIds: string[], updates: Partial<TaskType>) => {
    for (const taskId of taskIds) {
      await updateTask(taskId, updates);
    }
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer les tâches',
      description: `Voulez-vous vraiment supprimer ${selectedTaskIds.length} tâche(s) ? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      variant: 'destructive',
    });
    if (!ok) return;
    for (const taskId of selectedTaskIds) {
      await deleteTask(taskId);
    }
    setSelectedTaskIds([]);
    toast.success(`${selectedTaskIds.length} tâche(s) supprimée(s)`);
  };

  // Ouvrir automatiquement une tâche si taskId est dans l'URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('taskId');
    
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setSelectedTask(task);
        // Nettoyer l'URL sans recharger la page
        window.history.replaceState({}, '', '/tasks');
      }
    }
  }, [tasks]);

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

  // Appliquer le tri aux tâches filtrées
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let compareValue = 0;
    
    switch (sortBy) {
      case 'dueDate':
        const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
        const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
        compareValue = dateA - dateB;
        break;
      case 'priority':
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        compareValue = priorityOrder[a.priority] - priorityOrder[b.priority];
        break;
      case 'status':
        const statusOrder = { todo: 0, in_progress: 1, completed: 2, cancelled: 3 };
        compareValue = statusOrder[a.status] - statusOrder[b.status];
        break;
      case 'createdAt':
        const createdA = new Date(a.created_at).getTime();
        const createdB = new Date(b.created_at).getTime();
        compareValue = createdA - createdB;
        break;
    }
    
    return sortOrder === 'asc' ? compareValue : -compareValue;
  });

  // Séparer les tâches par statut APRÈS le filtrage et tri
  const todoTasks = sortedTasks.filter(task => task.status === 'todo');
  const inProgressTasks = sortedTasks.filter(task => task.status === 'in_progress');
  const completedTasks = sortedTasks.filter(task => task.status === 'completed');

  if (loading) {
    return <div className="flex justify-center items-center h-64">Chargement...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Gestion des Tâches</h1>
          <p className="text-muted-foreground mt-1 text-xs sm:text-sm lg:text-base">
            {todoTasks.length} à faire • {inProgressTasks.length} en cours • {completedTasks.length} terminées
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {selectedTaskIds.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedTaskIds([])}
                className="text-xs"
              >
                <X className="h-3 w-3 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Annuler</span> ({selectedTaskIds.length})
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setBulkEditorOpen(true)}
                className="text-xs"
              >
                <Edit className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                className="text-xs"
              >
                <Trash className="h-3 w-3 sm:mr-2" />
                <span className="hidden sm:inline">Supprimer</span>
              </Button>
            </>
          )}
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="text-xs"
          >
            <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Compact</span>
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
            className="text-xs"
          >
            <Columns3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Kanban</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="text-xs"
          >
            <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Liste</span>
          </Button>
          <TaskCreator onTaskCreated={handleTaskCreated} />
        </div>
      </div>

      {/* Search + Filter toggle for mobile */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 text-sm"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="sm:hidden flex items-center gap-1"
        >
          <Filter className="h-4 w-4" />
          {showFilters ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {/* Filters - collapsible on mobile */}
      <div className={`${showFilters ? 'block' : 'hidden'} sm:block`}>
        <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-44">
              <SelectValue placeholder="Utilisateur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              {users.filter(user => user.isActive).map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-44">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="follow_up">Suivi Client</SelectItem>
              <SelectItem value="contract">Contrat</SelectItem>
              <SelectItem value="event_prep">Préparation</SelectItem>
              <SelectItem value="marketing">Marketing</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedDate} onValueChange={setSelectedDate}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-40">
              <SelectValue placeholder="Échéance" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="overdue">En retard</SelectItem>
              <SelectItem value="today">Aujourd'hui</SelectItem>
              <SelectItem value="tomorrow">Demain</SelectItem>
              <SelectItem value="this_week">Semaine</SelectItem>
              <SelectItem value="no_date">Sans date</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-40">
              <SelectValue placeholder="Trier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dueDate">Échéance</SelectItem>
              <SelectItem value="priority">Priorité</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
              <SelectItem value="createdAt">Création</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortOrder} onValueChange={(value: any) => setSortOrder(value)}>
            <SelectTrigger className="text-xs sm:text-sm sm:w-28 col-span-2 sm:col-span-1">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">↑ Croissant</SelectItem>
              <SelectItem value="desc">↓ Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <TaskKanbanView
          tasks={sortedTasks}
          onUpdateStatus={updateTaskStatus}
          onTaskClick={(task) => setSelectedTask(task)}
          onDeleteTask={handleDeleteTask}
          selectedTaskIds={selectedTaskIds}
          onToggleSelection={toggleTaskSelection}
        />
      ) : viewMode === 'compact' ? (
        <CompactTaskView
          tasks={sortedTasks}
          onUpdateStatus={updateTaskStatus}
          onTaskClick={(task) => setSelectedTask(task)}
          onDeleteTask={handleDeleteTask}
          selectedTaskIds={selectedTaskIds}
          onToggleSelection={toggleTaskSelection}
          onSelectAll={selectAllTasks}
        />
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex min-w-max sm:grid sm:w-full sm:grid-cols-5 sm:min-w-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-3 whitespace-nowrap">
                <span className="hidden sm:inline">Toutes</span>
                <span className="sm:hidden">Tout</span> ({filteredTasks.length})
              </TabsTrigger>
              <TabsTrigger value="todo" className="text-xs sm:text-sm px-3 whitespace-nowrap">
                <span className="hidden sm:inline">À faire</span>
                <span className="sm:hidden">Todo</span> ({todoTasks.length})
              </TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs sm:text-sm px-3 whitespace-nowrap">
                <span className="hidden sm:inline">En cours</span>
                <span className="sm:hidden">Cours</span> ({inProgressTasks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm px-3 whitespace-nowrap">
                <span className="hidden sm:inline">Terminées</span>
                <span className="sm:hidden">Fait</span> ({completedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap">
                <Upload className="h-3 w-3" />
                <span className="hidden sm:inline">Import CSV</span>
                <span className="sm:hidden">CSV</span>
              </TabsTrigger>
            </TabsList>
          </div>

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

      <TaskBulkEditor
        isOpen={bulkEditorOpen}
        onClose={() => setBulkEditorOpen(false)}
        selectedTasks={tasks.filter(t => selectedTaskIds.includes(t.id))}
        onBulkUpdate={handleBulkUpdate}
      />
    </div>
  );
};
