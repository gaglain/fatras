
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckSquare, Search, Plus, Calendar, User, Filter, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, role, first_name, last_name');
      
      if (error) throw error;
      
      const formattedUsers = data?.map(user => ({
        id: user.user_id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name
      })) || [];
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUser = selectedUser === 'all' || task.assignedTo === selectedUser;
    return matchesSearch && matchesUser;
  });

  const handleAddTask = () => {
    if (!newTask.title || !newTask.description || !newTask.assignedTo) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const assignedUser = users.find(u => u.id === newTask.assignedTo);
    const assignedToName = assignedUser 
      ? `${assignedUser.first_name || ''} ${assignedUser.last_name || ''}`.trim() || assignedUser.username
      : 'Utilisateur inconnu';

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedToName,
      createdBy: 'user-1',
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'todo',
      createdAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium'
    });
    setShowAddForm(false);
    toast.success('Tâche créée');
  };

  const updateTaskStatus = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast.success('Statut de la tâche mis à jour');
  };

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'manager': return 'Manager';
      case 'artist': return 'Artiste';
      default: return 'Utilisateur';
    }
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
            </div>
            <p className="text-gray-600 mb-3">{task.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Assigné à: {task.assignedToName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <Select value={task.status} onValueChange={(value: Task['status']) => updateTaskStatus(task.id, value)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">À faire</SelectItem>
                  <SelectItem value="in_progress">En cours</SelectItem>
                  <SelectItem value="completed">Terminée</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tâches</h1>
          <p className="text-muted-foreground mt-2">Gérez vos tâches et suivez leur progression</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Tâche
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des tâches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedUser} onValueChange={setSelectedUser}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les utilisateurs</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.first_name && user.last_name 
                  ? `${user.first_name} ${user.last_name}` 
                  : user.username} ({getRoleLabel(user.role)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Toutes ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="todo">À faire ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">En cours ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <CheckSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche trouvée</h3>
                <p className="text-gray-500">Créez votre première tâche pour commencer</p>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          {todoTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.map((task) => <TaskCard key={task.id} task={task} />)}
        </TabsContent>
      </Tabs>

      {showAddForm && (
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Titre de la tâche"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description de la tâche"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigner à *</label>
                <Select value={newTask.assignedTo} onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>
                            {user.first_name && user.last_name 
                              ? `${user.first_name} ${user.last_name}` 
                              : user.username}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {getRoleLabel(user.role)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <Select value={newTask.priority} onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Basse</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date d'échéance</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowAddForm(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleAddTask} className="flex-1">
                  Créer la tâche
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
