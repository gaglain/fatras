
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckSquare, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { TaskCreator } from '@/components/tasks/TaskCreator';
import { TaskList } from '@/components/tasks/TaskList';
import { useUser } from '@/contexts/UserContext';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  createdBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  category: 'follow_up' | 'contract' | 'event_prep' | 'marketing' | 'admin';
  createdAt: string;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { users } = useUser();

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = () => {
    const savedTasks = localStorage.getItem('bookingTasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        // Enrichir les tâches avec les noms des utilisateurs
        const enrichedTasks = parsed.map((task: Task) => {
          const assignedUser = users.find(u => u.id === task.assignedTo);
          return {
            ...task,
            assignedToName: assignedUser ? assignedUser.name : 'Utilisateur inconnu'
          };
        });
        setTasks(enrichedTasks);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('bookingTasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleTaskCreated = (newTask: Task) => {
    const assignedUser = users.find(u => u.id === newTask.assignedTo);
    const enrichedTask = {
      ...newTask,
      assignedToName: assignedUser ? assignedUser.name : 'Utilisateur inconnu'
    };
    
    const updatedTasks = [...tasks, enrichedTask];
    saveTasks(updatedTasks);
    toast.success('Tâche créée avec succès');
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: newStatus,
          completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined
        };
      }
      return task;
    });
    saveTasks(updatedTasks);
    toast.success('Statut de la tâche mis à jour');
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || task.assignedTo === selectedUser;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesUser && matchesCategory;
  });

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

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
          <TaskList tasks={filteredTasks} onUpdateTaskStatus={updateTaskStatus} />
        </TabsContent>

        <TabsContent value="todo">
          <TaskList tasks={todoTasks} onUpdateTaskStatus={updateTaskStatus} />
        </TabsContent>

        <TabsContent value="in_progress">
          <TaskList tasks={inProgressTasks} onUpdateTaskStatus={updateTaskStatus} />
        </TabsContent>

        <TabsContent value="completed">
          <TaskList tasks={completedTasks} onUpdateTaskStatus={updateTaskStatus} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
