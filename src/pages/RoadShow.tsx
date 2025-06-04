
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, MapPin, Calendar, Users, Clock, Eye, EyeOff } from 'lucide-react';

interface RoadShowItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'casting_only';
  assignedTo: string[];
  notes: string;
  createdAt: string;
}

interface RoadShowFormData {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
  visibility: 'public' | 'private' | 'casting_only';
  assignedTo: string[];
  notes: string;
}

const defaultRoadShowItems: RoadShowItem[] = [
  {
    id: '1',
    title: 'Concert Festival Rock',
    description: 'Performance principale au festival rock annuel',
    location: 'Paris, Stade de France',
    date: '2024-07-15',
    time: '20:00',
    status: 'planned',
    visibility: 'casting_only',
    assignedTo: ['jean.dupont@email.com', 'marie.martin@email.com'],
    notes: 'Prévoir équipement son spécialisé',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Concert Acoustique',
    description: 'Session acoustique intime',
    location: 'Lyon, L\'Olympia',
    date: '2024-06-20',
    time: '19:30',
    status: 'in_progress',
    visibility: 'casting_only',
    assignedTo: ['sophie.bernard@email.com'],
    notes: 'Configuration acoustique uniquement',
    createdAt: '2024-01-10'
  }
];

const castingMembers = [
  'jean.dupont@email.com',
  'marie.martin@email.com',
  'sophie.bernard@email.com',
  'lucas.petit@email.com',
  'emma.garcia@email.com'
];

export const RoadShow: React.FC = () => {
  const [roadShowItems, setRoadShowItems] = useState<RoadShowItem[]>(defaultRoadShowItems);
  const [selectedItem, setSelectedItem] = useState<RoadShowItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const [formData, setFormData] = useState<RoadShowFormData>({
    title: '',
    description: '',
    location: '',
    date: '',
    time: '',
    status: 'planned',
    visibility: 'casting_only',
    assignedTo: [],
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      time: '',
      status: 'planned',
      visibility: 'casting_only',
      assignedTo: [],
      notes: ''
    });
  };

  const handleCreateItem = () => {
    const newItem: RoadShowItem = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    setRoadShowItems([...roadShowItems, newItem]);
    setShowCreateDialog(false);
    resetForm();
  };

  const handleEditItem = (item: RoadShowItem) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      location: item.location,
      date: item.date,
      time: item.time,
      status: item.status,
      visibility: item.visibility,
      assignedTo: item.assignedTo,
      notes: item.notes
    });
    setShowEditDialog(true);
  };

  const handleUpdateItem = () => {
    if (!selectedItem) return;
    
    const updatedItems = roadShowItems.map(item => 
      item.id === selectedItem.id 
        ? { ...item, ...formData }
        : item
    );
    
    setRoadShowItems(updatedItems);
    setShowEditDialog(false);
    setSelectedItem(null);
    resetForm();
  };

  const handleDeleteItem = (itemId: string) => {
    setRoadShowItems(roadShowItems.filter(item => item.id !== itemId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Planifié';
      case 'in_progress': return 'En cours';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public': return <Eye className="h-4 w-4 text-green-600" />;
      case 'private': return <EyeOff className="h-4 w-4 text-red-600" />;
      case 'casting_only': return <Users className="h-4 w-4 text-blue-600" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'public': return 'Public';
      case 'private': return 'Privé';
      case 'casting_only': return 'Casting uniquement';
      default: return visibility;
    }
  };

  const handleAssignedToChange = (member: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, assignedTo: [...formData.assignedTo, member] });
    } else {
      setFormData({ ...formData, assignedTo: formData.assignedTo.filter(m => m !== member) });
    }
  };

  const upcomingEvents = roadShowItems.filter(item => item.status === 'planned').length;
  const inProgressEvents = roadShowItems.filter(item => item.status === 'in_progress').length;
  const completedEvents = roadShowItems.filter(item => item.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feuille de route</h1>
          <p className="text-gray-600 mt-2">Planifiez et gérez votre feuille de route artistique</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Créer un nouvel événement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Titre de l'événement"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Lieu de l'événement"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Planifié</SelectItem>
                      <SelectItem value="in_progress">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Visibilité</label>
                  <Select value={formData.visibility} onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casting_only">Casting uniquement</SelectItem>
                      <SelectItem value="private">Privé</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Membres du casting assignés</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                  {castingMembers.map((member) => (
                    <label key={member} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.assignedTo.includes(member)}
                        onChange={(e) => handleAssignedToChange(member, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm">{member}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes additionnelles..."
                  rows={2}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateItem}>
                  Créer l'événement
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Événements</p>
                <p className="text-2xl font-bold text-gray-900">{roadShowItems.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">À venir</p>
                <p className="text-2xl font-bold text-gray-900">{upcomingEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En cours</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Terminés</p>
                <p className="text-2xl font-bold text-gray-900">{completedEvents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Road Show Items List */}
      <Card>
        <CardHeader>
          <CardTitle>Feuille de route</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadShowItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col items-center">
                    <MapPin className="h-6 w-6 text-gray-400 mb-1" />
                    {getVisibilityIcon(item.visibility)}
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{item.location}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{item.date} à {item.time}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{getVisibilityLabel(item.visibility)}</span>
                    </div>
                    {item.assignedTo.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500">Assigné à: {item.assignedTo.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(item.status)}>
                    {getStatusLabel(item.status)}
                  </Badge>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => handleEditItem(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Titre de l'événement"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description de l'événement..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Lieu de l'événement"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                <Input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planifié</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visibilité</label>
                <Select value={formData.visibility} onValueChange={(value: any) => setFormData({ ...formData, visibility: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casting_only">Casting uniquement</SelectItem>
                    <SelectItem value="private">Privé</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Membres du casting assignés</label>
              <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                {castingMembers.map((member) => (
                  <label key={member} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.assignedTo.includes(member)}
                      onChange={(e) => handleAssignedToChange(member, e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">{member}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateItem}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
