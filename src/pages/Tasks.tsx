import React, { useState, useEffect } from 'react';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Upload, LayoutGrid, List, Edit, X, Columns3 } from 'lucide-react';
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
import { TaskFilters } from './tasks/TaskFilters';

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
  const [emailComposer, setEmailComposer] = useState({ isOpen: false, to: '', subject: '', preText: '' });
  const { users } = useUser();
  const { tasks, loading, updateTask, deleteTask } = useTasks();

  const toggleTaskSelection = (taskId: string) => {
    setSelectedTaskIds(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
  };

  const handleBulkUpdate = async (taskIds: string[], updates: Partial<TaskType>) => {
    for (const taskId of taskIds) await updateTask(taskId, updates);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    const ok = await confirm({ title: 'Supprimer les tâches', description: `Voulez-vous vraiment supprimer ${selectedTaskIds.length} tâche(s) ?`, confirmText: 'Supprimer', variant: 'destructive' });
    if (!ok) return;
    for (const taskId of selectedTaskIds) await deleteTask(taskId);
    setSelectedTaskIds([]);
    toast.success(`${selectedTaskIds.length} tâche(s) supprimée(s)`);
  };

  useEffect(() => {
    const taskId = new URLSearchParams(window.location.search).get('taskId');
    if (taskId && tasks.length > 0) {
      const task = tasks.find(t => t.id === taskId);
      if (task) { setSelectedTask(task); window.history.replaceState({}, '', '/tasks'); }
    }
  }, [tasks]);

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed' | 'cancelled') => {
    try { await updateTask(taskId, { status: newStatus }); toast.success('Statut mis à jour'); } catch { toast.error('Erreur lors de la mise à jour'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    try { await deleteTask(taskId); toast.success('Tâche supprimée'); } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleSendTaskEmail = (contactEmail: string, taskTitle: string) => {
    setEmailComposer({ isOpen: true, to: contactEmail, subject: `Concernant la tâche: ${taskTitle}`, preText: `Bonjour,\n\nJe vous contacte concernant la tâche "${taskTitle}".\n\n` });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) || (task.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || task.assigned_to === selectedUser;
    const matchesCategory = selectedCategory === 'all' || true;
    const matchesDate = selectedDate === 'all' || (() => {
      if (!task.due_date) return selectedDate === 'no_date';
      const dueDate = new Date(task.due_date);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);
      switch (selectedDate) {
        case 'overdue': return dueDate < today;
        case 'today': return dueDate.toDateString() === today.toDateString();
        case 'tomorrow': return dueDate.toDateString() === tomorrow.toDateString();
        case 'this_week': return dueDate >= today && dueDate <= nextWeek;
        case 'no_date': return false;
        default: return true;
      }
    })();
    return matchesSearch && matchesUser && matchesCategory && matchesDate;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'dueDate': cmp = (a.due_date ? new Date(a.due_date).getTime() : Infinity) - (b.due_date ? new Date(b.due_date).getTime() : Infinity); break;
      case 'priority': { const o = { urgent: 0, high: 1, medium: 2, low: 3 }; cmp = o[a.priority] - o[b.priority]; break; }
      case 'status': { const o = { todo: 0, in_progress: 1, completed: 2, cancelled: 3 }; cmp = o[a.status] - o[b.status]; break; }
      case 'createdAt': cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
    }
    return sortOrder === 'asc' ? cmp : -cmp;
  });

  const todoTasks = sortedTasks.filter(t => t.status === 'todo');
  const inProgressTasks = sortedTasks.filter(t => t.status === 'in_progress');
  const completedTasks = sortedTasks.filter(t => t.status === 'completed');

  const mapTaskForList = (task: TaskType) => ({
    ...task, assignedTo: task.assigned_to || '',
    assignedToName: users.find(u => u.id === task.assigned_to)?.name || 'Non assigné',
    dueDate: task.due_date || '', createdAt: task.created_at, createdBy: task.user_id,
    category: 'admin' as const, description: task.description || ''
  });

  if (loading) return <div className="flex justify-center items-center h-64">Chargement...</div>;

  const selectAllTasks = () => setSelectedTaskIds(selectedTaskIds.length === sortedTasks.length ? [] : sortedTasks.map(t => t.id));

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
              <Button variant="outline" size="sm" onClick={() => setSelectedTaskIds([])} className="text-xs"><X className="h-3 w-3 mr-1 sm:mr-2" /><span className="hidden sm:inline">Annuler</span> ({selectedTaskIds.length})</Button>
              <Button variant="default" size="sm" onClick={() => setBulkEditorOpen(true)} className="text-xs"><Edit className="h-3 w-3 sm:mr-2" /><span className="hidden sm:inline">Modifier</span></Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="text-xs"><Trash className="h-3 w-3 sm:mr-2" /><span className="hidden sm:inline">Supprimer</span></Button>
            </>
          )}
          {(['compact', 'kanban', 'list'] as const).map(mode => (
            <Button key={mode} variant={viewMode === mode ? 'default' : 'outline'} size="sm" onClick={() => setViewMode(mode)} className="text-xs">
              {mode === 'compact' ? <LayoutGrid className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" /> : mode === 'kanban' ? <Columns3 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" /> : <List className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />}
              <span className="hidden sm:inline">{mode === 'compact' ? 'Compact' : mode === 'kanban' ? 'Kanban' : 'Liste'}</span>
            </Button>
          ))}
          <TaskCreator onTaskCreated={() => toast.success('Tâche créée avec succès')} />
        </div>
      </div>

      <TaskFilters
        searchTerm={searchTerm} onSearchChange={setSearchTerm}
        selectedUser={selectedUser} onUserChange={setSelectedUser}
        selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory}
        selectedDate={selectedDate} onDateChange={setSelectedDate}
        sortBy={sortBy} onSortByChange={setSortBy}
        sortOrder={sortOrder} onSortOrderChange={setSortOrder}
        showFilters={showFilters} onToggleFilters={() => setShowFilters(!showFilters)}
        users={users}
      />

      {viewMode === 'kanban' ? (
        <TaskKanbanView tasks={sortedTasks} onUpdateStatus={updateTaskStatus} onTaskClick={setSelectedTask} onDeleteTask={handleDeleteTask} selectedTaskIds={selectedTaskIds} onToggleSelection={toggleTaskSelection} />
      ) : viewMode === 'compact' ? (
        <CompactTaskView tasks={sortedTasks} onUpdateStatus={updateTaskStatus} onTaskClick={setSelectedTask} onDeleteTask={handleDeleteTask} selectedTaskIds={selectedTaskIds} onToggleSelection={toggleTaskSelection} onSelectAll={selectAllTasks} />
      ) : (
        <Tabs defaultValue="all" className="space-y-6">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex min-w-max sm:grid sm:w-full sm:grid-cols-5 sm:min-w-0">
              <TabsTrigger value="all" className="text-xs sm:text-sm px-3 whitespace-nowrap"><span className="hidden sm:inline">Toutes</span><span className="sm:hidden">Tout</span> ({filteredTasks.length})</TabsTrigger>
              <TabsTrigger value="todo" className="text-xs sm:text-sm px-3 whitespace-nowrap"><span className="hidden sm:inline">À faire</span><span className="sm:hidden">Todo</span> ({todoTasks.length})</TabsTrigger>
              <TabsTrigger value="in_progress" className="text-xs sm:text-sm px-3 whitespace-nowrap"><span className="hidden sm:inline">En cours</span><span className="sm:hidden">Cours</span> ({inProgressTasks.length})</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs sm:text-sm px-3 whitespace-nowrap"><span className="hidden sm:inline">Terminées</span><span className="sm:hidden">Fait</span> ({completedTasks.length})</TabsTrigger>
              <TabsTrigger value="import" className="flex items-center gap-1 text-xs sm:text-sm px-3 whitespace-nowrap"><Upload className="h-3 w-3" /><span className="hidden sm:inline">Import CSV</span><span className="sm:hidden">CSV</span></TabsTrigger>
            </TabsList>
          </div>
          {[{ value: 'all', data: filteredTasks }, { value: 'todo', data: todoTasks }, { value: 'in_progress', data: inProgressTasks }, { value: 'completed', data: completedTasks }].map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <TaskList tasks={tab.data.map(mapTaskForList)} rawTasks={tab.data} onUpdateTaskStatus={updateTaskStatus} onDeleteTask={handleDeleteTask} onSendEmail={handleSendTaskEmail} sortBy={sortBy} sortOrder={sortOrder} />
            </TabsContent>
          ))}
          <TabsContent value="import"><TaskCSVImporter /></TabsContent>
        </Tabs>
      )}

      {selectedTask && <TaskEditor task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} onTaskUpdated={() => setSelectedTask(null)} />}
      <EmailComposer isOpen={emailComposer.isOpen} onClose={() => setEmailComposer({ isOpen: false, to: '', subject: '', preText: '' })} toEmail={emailComposer.to} subject={emailComposer.subject} preText={emailComposer.preText} />
      <TaskBulkEditor isOpen={bulkEditorOpen} onClose={() => setBulkEditorOpen(false)} selectedTasks={tasks.filter(t => selectedTaskIds.includes(t.id))} onBulkUpdate={handleBulkUpdate} />
    </div>
  );
};
