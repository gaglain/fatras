
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Mail, Phone, Calendar, User, Bell, Clock, Users, Grid2X2, ExternalLink, List, Filter, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

interface Task {
  id: string;
  title: string;
  type: 'email' | 'phone' | 'meeting' | 'other';
  priority: 'high' | 'medium' | 'low';
  owner: string;
  dueDate: string;
  status: 'todo' | 'in-progress' | 'done';
  contactId?: string;
  contactName?: string;
  eventId?: string;
  eventName?: string;
  artistId?: string;
  artistName?: string;
  description?: string;
}

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Send contract to Madison Square Garden',
    type: 'email',
    priority: 'high',
    owner: 'Alice Johnson',
    dueDate: '2024-06-15',
    status: 'todo',
    contactId: 'contact-1',
    contactName: 'John Smith - MSG',
    eventId: 'event-1',
    eventName: 'Summer Concert Series',
    artistId: 'artist-1',
    artistName: 'The Midnight Express',
    description: 'Send finalized contract for July concert'
  },
  {
    id: '2',
    title: 'Call venue about sound requirements',
    type: 'phone',
    priority: 'medium',
    owner: 'Bob Miller',
    dueDate: '2024-06-12',
    status: 'in-progress',
    contactId: 'contact-2',
    contactName: 'Sarah Williams',
    eventId: 'event-2',
    eventName: 'Acoustic Night',
    artistId: 'artist-2',
    artistName: 'Sarah Mitchell',
    description: 'Discuss audio setup for acoustic show'
  },
  {
    id: '3',
    title: 'Schedule meeting with artist management',
    type: 'meeting',
    priority: 'high',
    owner: 'Alice Johnson',
    dueDate: '2024-06-14',
    status: 'done',
    contactId: 'contact-3',
    contactName: 'Mike Producer',
    eventId: 'event-3',
    eventName: 'World Tour 2024',
    artistId: 'artist-3',
    artistName: 'Thunder Road',
    description: 'Discuss tour logistics and requirements'
  },
  {
    id: '4',
    title: 'Follow up on venue availability',
    type: 'email',
    priority: 'medium',
    owner: 'Carol Davis',
    dueDate: '2024-06-10',
    status: 'todo',
    contactId: 'contact-4',
    contactName: 'Venue Manager',
    eventId: 'event-4',
    eventName: 'Festival Booking',
    artistId: 'artist-4',
    artistName: 'Indie Band'
  }
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return Mail;
    case 'phone':
      return Phone;
    case 'meeting':
      return Calendar;
    default:
      return User;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const isOverdue = (dueDate: string) => {
  return new Date(dueDate) < new Date();
};

const isDueSoon = (dueDate: string) => {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 2 && diffDays >= 0;
};

export const Tasks: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [showAddForm, setShowAddForm] = useState(false);
  const [view, setView] = useState<'kanban' | 'list' | 'grid' | 'calendar'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterOwner, setFilterOwner] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  const moveTask = (taskId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast({
      title: "Tâche mise à jour",
      description: "Le statut de la tâche a été mis à jour avec succès.",
    });
  };

  // Filter tasks based on search and filter criteria
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.eventName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.artistName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || task.type === filterType;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesOwner = filterOwner === 'all' || task.owner === filterOwner;
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

    return matchesSearch && matchesType && matchesPriority && matchesOwner && matchesStatus;
  });

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const doneTasks = filteredTasks.filter(task => task.status === 'done');

  const overdueTasks = tasks.filter(task => isOverdue(task.dueDate) && task.status !== 'done');
  const dueSoonTasks = tasks.filter(task => isDueSoon(task.dueDate) && task.status !== 'done');

  const uniqueOwners = [...new Set(tasks.map(task => task.owner))];

  // Show notifications for overdue and due soon tasks
  React.useEffect(() => {
    if (overdueTasks.length > 0) {
      toast({
        title: "Tâches en retard",
        description: `Vous avez ${overdueTasks.length} tâches en retard qui nécessitent votre attention.`,
        variant: "destructive"
      });
    }
    if (dueSoonTasks.length > 0) {
      toast({
        title: "Tâches à échéance proche",
        description: `Vous avez ${dueSoonTasks.length} tâches à terminer dans les 2 prochains jours.`,
      });
    }
  }, []);

  const TaskCard = ({ task }: { task: Task }) => {
    const TypeIcon = getTypeIcon(task.type);
    const isTaskOverdue = isOverdue(task.dueDate);
    const isTaskDueSoon = isDueSoon(task.dueDate);

    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${
        isTaskOverdue ? 'border-red-300 bg-red-50' : 
        isTaskDueSoon ? 'border-yellow-300 bg-yellow-50' : ''
      } ${view === 'grid' ? 'h-full' : 'mb-3'}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h3 className="font-medium text-sm">{task.title}</h3>
              {(isTaskOverdue || isTaskDueSoon) && (
                <Bell className={`h-4 w-4 ${isTaskOverdue ? 'text-red-500' : 'text-yellow-500'}`} />
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <TypeIcon className="h-3 w-3 text-purple-600" />
              <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                {task.priority}
              </Badge>
              {view === 'grid' && (
                <Badge variant="outline" className="text-xs">
                  {task.status.replace('-', ' ')}
                </Badge>
              )}
            </div>

            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span className={isTaskOverdue ? 'text-red-600 font-medium' : ''}>
                  Échéance: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
              
              {task.contactName && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <Link 
                    to="/contacts" 
                    className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <span>Contact: {task.contactName}</span>
                    <ExternalLink className="h-2 w-2" />
                  </Link>
                </div>
              )}
              
              {task.eventName && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <Link 
                    to="/events" 
                    className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <span>Événement: {task.eventName}</span>
                    <ExternalLink className="h-2 w-2" />
                  </Link>
                </div>
              )}

              {task.artistName && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3" />
                  <Link 
                    to="/artists" 
                    className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                  >
                    <span>Artiste: {task.artistName}</span>
                    <ExternalLink className="h-2 w-2" />
                  </Link>
                </div>
              )}
              
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>Propriétaire: {task.owner}</span>
              </div>
            </div>

            <div className="flex space-x-1 pt-2">
              {task.status !== 'todo' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'todo')}
                >
                  À faire
                </Button>
              )}
              {task.status !== 'in-progress' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'in-progress')}
                >
                  En cours
                </Button>
              )}
              {task.status !== 'done' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-6 px-2"
                  onClick={() => moveTask(task.id, 'done')}
                >
                  Terminé
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Tâches</h1>
          <p className="text-gray-600 mt-2">Suivi des emails, appels, réunions et autres tâches importantes</p>
        </div>
        <div className="flex space-x-3">
          <Select value={view} onValueChange={(value: 'kanban' | 'list' | 'grid' | 'calendar') => setView(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kanban">Kanban</SelectItem>
              <SelectItem value="list">Liste</SelectItem>
              <SelectItem value="grid">Grille</SelectItem>
              <SelectItem value="calendar">Calendrier</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Tâche
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher des tâches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Téléphone</SelectItem>
                <SelectItem value="meeting">Réunion</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterOwner} onValueChange={setFilterOwner}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Propriétaire" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                {uniqueOwners.map(owner => (
                  <SelectItem key={owner} value={owner}>{owner}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="todo">À faire</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="done">Terminé</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterPriority('all');
                setFilterOwner('all');
                setFilterStatus('all');
              }}
            >
              <Filter className="h-4 w-4 mr-2" />
              Effacer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications Summary */}
      {(overdueTasks.length > 0 || dueSoonTasks.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {overdueTasks.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="font-medium text-red-900">Tâches en retard</div>
                    <div className="text-sm text-red-700">{overdueTasks.length} tâches nécessitent une attention immédiate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {dueSoonTasks.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <div className="font-medium text-yellow-900">Échéance proche</div>
                    <div className="text-sm text-yellow-700">{dueSoonTasks.length} tâches à terminer dans 2 jours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{todoTasks.length}</div>
            <div className="text-sm text-gray-600">À faire</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">{inProgressTasks.length}</div>
            <div className="text-sm text-gray-600">En cours</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{doneTasks.length}</div>
            <div className="text-sm text-gray-600">Terminées</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-gray-600">{filteredTasks.length}</div>
            <div className="text-sm text-gray-600">Total filtré</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Vue Calendrier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                <div key={day} className="text-center font-medium text-gray-500 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="text-center text-gray-500 py-8">
              Vue calendrier en développement - Affichage des tâches par date
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {view === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <List className="h-5 w-5 mr-2" />
              Vue Liste
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Badge className={getPriorityColor(task.priority)} variant="outline">
                      {task.priority}
                    </Badge>
                    <div>
                      <h4 className="font-medium">{task.title}</h4>
                      <p className="text-sm text-gray-500">{task.owner} • Échéance: {new Date(task.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={task.status === 'done' ? 'default' : 'secondary'}>
                    {task.status.replace('-', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid View */}
      {view === 'grid' && (
        <div className="space-y-6">
          <div className="flex items-center space-x-2">
            <Grid2X2 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Toutes les tâches</h3>
            <Badge variant="outline">{filteredTasks.length}</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map(task => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Kanban Board */}
      {view === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">À faire</h3>
              <Badge variant="outline">{todoTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-gray-50 rounded-lg p-4">
              {todoTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">En cours</h3>
              <Badge variant="outline">{inProgressTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-yellow-50 rounded-lg p-4">
              {inProgressTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Terminé</h3>
              <Badge variant="outline">{doneTasks.length}</Badge>
            </div>
            <div className="min-h-96 bg-green-50 rounded-lg p-4">
              {doneTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Task Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Ajouter une nouvelle tâche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Titre de la tâche" />
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type de tâche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Appel téléphonique</SelectItem>
                  <SelectItem value="meeting">Réunion</SelectItem>
                  <SelectItem value="other">Autre</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner la priorité" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
              
              <Input placeholder="Propriétaire" />
              <Input placeholder="Nom du contact" />
              <Input placeholder="Nom de l'événement" />
              <Input type="date" placeholder="Date d'échéance" />
              <textarea 
                placeholder="Description (optionnel)"
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Sauvegarder la tâche
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
