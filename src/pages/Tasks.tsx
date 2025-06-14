import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckSquare, Search, Plus, Calendar, User, Phone, Mail, Edit, X, Filter } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { TaskCreator } from '@/components/tasks/TaskCreator';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  createdBy: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  relatedToId?: string;
  relatedToType?: 'contact' | 'event' | 'contract';
  createdAt: string;
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
}

const sampleContacts: Contact[] = [
  {
    id: 'contact-1',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@example.com',
    phone: '06 12 34 56 78',
    company: 'Productions Musicales'
  },
  {
    id: 'contact-2',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@example.com',
    phone: '06 23 45 67 89',
    company: 'Festival d\'été'
  }
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Confirmer la réservation de salle',
    description: 'Appeler le responsable pour confirmer la réservation',
    assignedTo: 'user-1',
    createdBy: 'user-1',
    dueDate: '2024-06-10',
    priority: 'high',
    status: 'todo',
    relatedToId: 'contact-1',
    relatedToType: 'contact',
    createdAt: '2024-06-04T10:00:00Z'
  },
  {
    id: '2',
    title: 'Envoyer le contrat signé',
    description: 'Transmettre le contrat signé par email',
    assignedTo: 'user-2',
    createdBy: 'user-1',
    dueDate: '2024-06-08',
    priority: 'medium',
    status: 'in_progress',
    relatedToId: 'contact-2',
    relatedToType: 'contact',
    createdAt: '2024-06-02T14:30:00Z'
  }
];

export const Tasks: React.FC = () => {
  const { users, getUserById, currentUser, getUserPermissions } = useUser();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [contacts] = useState<Contact[]>(sampleContacts);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskEdit, setShowTaskEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    status: 'todo' as 'todo' | 'in_progress' | 'completed',
    relatedToId: '',
    relatedToType: 'contact' as 'contact' | 'event' | 'contract'
  });

  // Ne pas rendre le composant si currentUser n'est pas encore chargé
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  const permissions = getUserPermissions(currentUser);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUser = selectedUser === 'all' || task.assignedTo === selectedUser;
    
    const canView = permissions.canViewAllTasks || task.assignedTo === currentUser?.id || task.createdBy === currentUser?.id;
    
    return matchesSearch && matchesUser && canView;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'todo': return 'bg-gray-100 text-gray-800';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminée';
      case 'in_progress': return 'En cours';
      case 'todo': return 'À faire';
      default: return status;
    }
  };

  const getRelatedContact = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task?.relatedToType === 'contact' && task.relatedToId) {
      return contacts.find(c => c.id === task.relatedToId);
    }
    return null;
  };

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
  };

  const handleTaskEdit = (task: Task) => {
    setSelectedTask(task);
    setEditFormData({
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo,
      dueDate: task.dueDate,
      priority: task.priority,
      status: task.status,
      relatedToId: task.relatedToId || '',
      relatedToType: task.relatedToType || 'contact'
    });
    setShowTaskEdit(true);
  };

  const handleUpdateTask = () => {
    if (!selectedTask) return;

    setTasks(prev => prev.map(task => 
      task.id === selectedTask.id 
        ? { ...task, ...editFormData }
        : task
    ));

    setShowTaskEdit(false);
    setSelectedTask(null);
    toast.success('Tâche mise à jour');
  };

  const handleTaskCreated = (newTask: any) => {
    setTasks(prev => [...prev, newTask]);
  };

  const todoTasks = filteredTasks.filter(task => task.status === 'todo');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in_progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');

  const TaskCard = ({ task }: { task: Task }) => {
    const assignedUser = getUserById(task.assignedTo);
    const relatedContact = getRelatedContact(task.id);
    
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold">{task.title}</h3>
                <Badge className={getPriorityColor(task.priority)}>
                  {getPriorityLabel(task.priority)}
                </Badge>
                {task.status !== 'completed' && (
                  <Badge className={getStatusColor(task.status)}>
                    {getStatusLabel(task.status)}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-3">{task.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Assigné à: {assignedUser?.name || 'Utilisateur inconnu'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Échéance: {new Date(task.dueDate).toLocaleDateString('fr-FR')}</span>
                </div>
                {relatedContact && (
                  <div>
                    <span className="text-gray-500">Contact lié:</span>
                    <button
                      onClick={() => handleContactClick(relatedContact)}
                      className="ml-2 text-purple-600 hover:text-purple-800 font-medium"
                    >
                      {relatedContact.firstName} {relatedContact.lastName}
                    </button>
                  </div>
                )}
              </div>
            </div>
            {task.status !== 'completed' && (
              <Button size="sm" variant="outline" onClick={() => handleTaskEdit(task)}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tâches</h1>
          <p className="text-gray-600 mt-2">Gérez vos tâches et suivez leur progression</p>
        </div>
        <TaskCreator onTaskCreated={handleTaskCreated} />
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
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-48">
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
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">Toutes ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="todo">À faire ({todoTasks.length})</TabsTrigger>
          <TabsTrigger value="in_progress">En cours ({inProgressTasks.length})</TabsTrigger>
          <TabsTrigger value="completed">Terminées ({completedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="todo" className="space-y-4">
          {todoTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {inProgressTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedTasks.map((task) => (
            <div key={task.id} className="opacity-75">
              <TaskCard task={task} />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      {/* Contact Details Modal */}
      {selectedContact && (
        <Dialog open={!!selectedContact} onOpenChange={() => setSelectedContact(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Fiche Contact</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedContact.firstName} {selectedContact.lastName}
                </h3>
                {selectedContact.company && (
                  <p className="text-gray-600">{selectedContact.company}</p>
                )}
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`mailto:${selectedContact.email}`}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {selectedContact.email}
                  </a>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <a 
                    href={`tel:${selectedContact.phone}`}
                    className="text-purple-600 hover:text-purple-800"
                  >
                    {selectedContact.phone}
                  </a>
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1"
                  onClick={() => window.open(`mailto:${selectedContact.email}`)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer un email
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => window.open(`tel:${selectedContact.phone}`)}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Appeler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Task Edit Modal */}
      {showTaskEdit && selectedTask && (
        <Dialog open={showTaskEdit} onOpenChange={setShowTaskEdit}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la tâche</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                  <Select value={editFormData.assignedTo} onValueChange={(value) => setEditFormData({ ...editFormData, assignedTo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(user => user.isActive).map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                  <Select value={editFormData.status} onValueChange={(value: any) => setEditFormData({ ...editFormData, status: value })}>
                    <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <Select value={editFormData.priority} onValueChange={(value: any) => setEditFormData({ ...editFormData, priority: value })}>
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
                    value={editFormData.dueDate}
                    onChange={(e) => setEditFormData({ ...editFormData, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button variant="outline" onClick={() => setShowTaskEdit(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleUpdateTask} className="flex-1">
                  Mettre à jour
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
