import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckSquare, Search, Plus, Calendar, User, Filter, Users, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedToName?: string;
  assignedToEmail?: string;
  createdBy: string;
  createdByName?: string;
  contactId?: string;
  contactName?: string;
  eventId?: string;
  eventTitle?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  category: 'follow_up' | 'contract' | 'event_prep' | 'marketing' | 'admin';
  estimatedHours?: number;
  completedAt?: string;
  createdAt: string;
}

interface User {
  id: string;
  username: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
}

interface Event {
  id: string;
  title: string;
  start_date: string;
}

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    contactId: '',
    eventId: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    category: 'admin' as 'follow_up' | 'contract' | 'event_prep' | 'marketing' | 'admin',
    estimatedHours: 1
  });

  useEffect(() => {
    loadUsers();
    loadContacts();
    loadEvents();
    loadTasks();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, role, first_name, last_name, email');
      
      if (error) throw error;
      
      const formattedUsers = data?.map(user => ({
        id: user.user_id,
        username: user.username,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      })) || [];
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    }
  };

  const loadContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .select('id, first_name, last_name')
        .eq('status', 'active')
        .limit(50);
      
      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_date')
        .gte('start_date', new Date().toISOString())
        .limit(50);
      
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadTasks = () => {
    // Charger depuis localStorage pour l'instant
    const savedTasks = localStorage.getItem('bookingTasks');
    if (savedTasks) {
      try {
        const parsed = JSON.parse(savedTasks);
        setTasks(parsed);
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  };

  const saveTasks = (updatedTasks: Task[]) => {
    localStorage.setItem('bookingTasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.contactName && task.contactName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesUser = selectedUser === 'all' || task.assignedTo === selectedUser;
    const matchesCategory = selectedCategory === 'all' || task.category === selectedCategory;
    return matchesSearch && matchesUser && matchesCategory;
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

    const contact = contacts.find(c => c.id === newTask.contactId);
    const contactName = contact ? `${contact.first_name} ${contact.last_name}` : undefined;

    const event = events.find(e => e.id === newTask.eventId);
    const eventTitle = event ? event.title : undefined;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title,
      description: newTask.description,
      assignedTo: newTask.assignedTo,
      assignedToName,
      assignedToEmail: assignedUser?.email,
      createdBy: 'current-user',
      createdByName: 'Vous',
      contactId: newTask.contactId || undefined,
      contactName,
      eventId: newTask.eventId || undefined,
      eventTitle,
      dueDate: newTask.dueDate,
      priority: newTask.priority,
      status: 'todo',
      category: newTask.category,
      estimatedHours: newTask.estimatedHours,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = [...tasks, task];
    saveTasks(updatedTasks);
    
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      contactId: '',
      eventId: '',
      dueDate: '',
      priority: 'medium',
      category: 'admin',
      estimatedHours: 1
    });
    setShowAddForm(false);
    toast.success('Tâche créée et assignée');
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

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'follow_up': return 'bg-blue-100 text-blue-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'event_prep': return 'bg-green-100 text-green-800';
      case 'marketing': return 'bg-pink-100 text-pink-800';
      case 'admin': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'follow_up': return 'Suivi Client';
      case 'contract': return 'Contrat';
      case 'event_prep': return 'Préparation Événement';
      case 'marketing': return 'Marketing';
      case 'admin': return 'Administration';
      default: return category;
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && dueDate;
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <Badge className={getPriorityColor(task.priority)}>
                {getPriorityLabel(task.priority)}
              </Badge>
              <Badge className={getCategoryColor(task.category)}>
                {getCategoryLabel(task.category)}
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
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Assigné à: {task.assignedToName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
              </div>
              {task.contactName && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Contact: {task.contactName}</span>
                </div>
              )}
              {task.eventTitle && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Événement: {task.eventTitle}</span>
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Estimation: {task.estimatedHours}h</span>
                </div>
              )}
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
          <h1 className="text-3xl font-bold text-foreground">Gestion des Tâches</h1>
          <p className="text-muted-foreground mt-2">Organisez et suivez toutes vos tâches de booking</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle Tâche
        </Button>
      </div>

      <div className="flex items-center space-x-4 flex-wrap gap-2">
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
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Titre de la tâche"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie *</label>
                  <Select value={newTask.category} onValueChange={(value: any) => setNewTask({ ...newTask, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Suivi Client</SelectItem>
                      <SelectItem value="contract">Contrat</SelectItem>
                      <SelectItem value="event_prep">Préparation Événement</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="admin">Administration</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <Input
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Description de la tâche"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact lié</label>
                  <Select value={newTask.contactId} onValueChange={(value) => setNewTask({ ...newTask, contactId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun contact</SelectItem>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.first_name} {contact.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Événement lié</label>
                  <Select value={newTask.eventId} onValueChange={(value) => setNewTask({ ...newTask, eventId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un événement" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Aucun événement</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimation (heures)</label>
                  <Input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({ ...newTask, estimatedHours: parseFloat(e.target.value) || 1 })}
                  />
                </div>
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
