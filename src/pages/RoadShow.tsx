
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Eye, 
  EyeOff,
  Search,
  Edit,
  Trash2,
  User
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { toast } from 'sonner';

interface RoadShowEvent {
  id: string;
  title: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  duration: string;
  description: string;
  status: 'planned' | 'confirmed' | 'completed' | 'cancelled';
  casting: string[];
  visibleTo: string[];
  createdBy: string;
  notes: string;
}

interface CastMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string;
  email: string;
}

const sampleCastMembers: CastMember[] = [
  {
    id: 'cast-1',
    firstName: 'Sophie',
    lastName: 'Martin',
    role: 'Chanteuse principale',
    phone: '06 12 34 56 78',
    email: 'sophie.martin@example.com'
  },
  {
    id: 'cast-2',
    firstName: 'Pierre',
    lastName: 'Dubois',
    role: 'Guitariste',
    phone: '06 23 45 67 89',
    email: 'pierre.dubois@example.com'
  },
  {
    id: 'cast-3',
    firstName: 'Marie',
    lastName: 'Leroy',
    role: 'Danseuse',
    phone: '06 34 56 78 90',
    email: 'marie.leroy@example.com'
  }
];

const sampleEvents: RoadShowEvent[] = [
  {
    id: '1',
    title: 'Concert Privé Villa Marguerite',
    venue: 'Villa Marguerite',
    address: '123 Avenue des Roses, 06400 Cannes',
    date: '2024-07-15',
    time: '20:00',
    duration: '2h30',
    description: 'Concert privé pour anniversaire de mariage',
    status: 'confirmed',
    casting: ['cast-1', 'cast-2'],
    visibleTo: ['user-1', 'user-2', 'cast-1', 'cast-2'],
    createdBy: 'user-1',
    notes: 'Prévoir matériel de sonorisation'
  },
  {
    id: '2',
    title: 'Festival Été Musical',
    venue: 'Scène Principale Festival',
    address: 'Parc des Expositions, Nice',
    date: '2024-07-22',
    time: '21:30',
    duration: '1h45',
    description: 'Prestation festival d\'été',
    status: 'planned',
    casting: ['cast-1', 'cast-3'],
    visibleTo: ['user-1', 'cast-1', 'cast-3'],
    createdBy: 'user-1',
    notes: ''
  }
];

export const RoadShow: React.FC = () => {
  const { users, currentUser, getUserById } = useUser();
  const [events, setEvents] = useState<RoadShowEvent[]>(sampleEvents);
  const [castMembers, setCastMembers] = useState<CastMember[]>(sampleCastMembers);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<RoadShowEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [castSearchTerm, setCastSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    duration: '',
    description: '',
    status: 'planned' as const,
    casting: [] as string[],
    visibleTo: [] as string[],
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      title: '',
      venue: '',
      address: '',
      date: '',
      time: '',
      duration: '',
      description: '',
      status: 'planned',
      casting: [],
      visibleTo: [],
      notes: ''
    });
  };

  const handleCreateEvent = () => {
    if (!formData.title || !formData.venue || !formData.date) {
      toast.error('Veuillez remplir les champs obligatoires');
      return;
    }

    const newEvent: RoadShowEvent = {
      id: Date.now().toString(),
      ...formData,
      createdBy: currentUser?.id || 'user-1'
    };

    setEvents([...events, newEvent]);
    setShowCreateForm(false);
    resetForm();
    toast.success('Événement ajouté à la feuille de route');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'planned': return 'Planifié';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return 'Inconnu';
    }
  };

  const canViewEvent = (event: RoadShowEvent) => {
    if (!currentUser) return false;
    return event.visibleTo.includes(currentUser.id) || event.createdBy === currentUser.id;
  };

  const filteredEvents = events.filter(event => 
    canViewEvent(event) &&
    (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     event.venue.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredCastMembers = castMembers.filter(member =>
    member.firstName.toLowerCase().includes(castSearchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(castSearchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(castSearchTerm.toLowerCase())
  );

  const toggleCastMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      casting: prev.casting.includes(memberId)
        ? prev.casting.filter(id => id !== memberId)
        : [...prev.casting, memberId]
    }));
  };

  const toggleVisibility = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      visibleTo: prev.visibleTo.includes(userId)
        ? prev.visibleTo.filter(id => id !== userId)
        : [...prev.visibleTo, userId]
    }));
  };

  const getCastMemberName = (memberId: string) => {
    const member = castMembers.find(m => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : 'Membre inconnu';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feuille de Route</h1>
          <p className="text-gray-600 mt-2">Planifiez et gérez vos événements et tournées</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un événement à la feuille de route</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'événement *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Concert, festival, événement privé..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lieu *</label>
                  <Input
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Nom du lieu ou de la salle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Adresse complète du lieu"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="ex: 2h30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'événement..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planifié</SelectItem>
                    <SelectItem value="confirmed">Confirmé</SelectItem>
                    <SelectItem value="completed">Terminé</SelectItem>
                    <SelectItem value="cancelled">Annulé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Casting Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Casting</label>
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Rechercher par prénom..."
                      value={castSearchTerm}
                      onChange={(e) => setCastSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                    {filteredCastMembers.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50">
                        <Checkbox
                          checked={formData.casting.includes(member.id)}
                          onCheckedChange={() => toggleCastMember(member.id)}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm">{member.firstName} {member.lastName}</div>
                          <div className="text-xs text-gray-500">{member.role}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Visibility Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visible par</label>
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {users.filter(user => user.isActive).map((user) => (
                    <div key={user.id} className="flex items-center space-x-2 p-1">
                      <Checkbox
                        checked={formData.visibleTo.includes(user.id)}
                        onCheckedChange={() => toggleVisibility(user.id)}
                      />
                      <span className="text-sm">{user.name}</span>
                    </div>
                  ))}
                  {castMembers.map((member) => (
                    <div key={`cast-${member.id}`} className="flex items-center space-x-2 p-1">
                      <Checkbox
                        checked={formData.visibleTo.includes(member.id)}
                        onCheckedChange={() => toggleVisibility(member.id)}
                      />
                      <span className="text-sm">{member.firstName} {member.lastName} (Casting)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Notes internes, matériel nécessaire..."
                  rows={2}
                />
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" onClick={() => setShowCreateForm(false)} className="flex-1">
                  Annuler
                </Button>
                <Button onClick={handleCreateEvent} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Ajouter à la feuille de route
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Rechercher des événements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Events Timeline */}
      <div className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
              <p className="text-gray-500 mb-4">Commencez par ajouter votre premier événement à la feuille de route</p>
            </CardContent>
          </Card>
        ) : (
          filteredEvents
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((event) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {getStatusLabel(event.status)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{event.venue}</span>
                        </div>
                        {event.address && (
                          <div className="flex items-center space-x-2">
                            <span className="w-4"></span>
                            <span>{event.address}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(event.date).toLocaleDateString('fr-FR')}</span>
                          </div>
                          {event.time && (
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                              {event.duration && <span>({event.duration})</span>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {event.visibleTo.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {event.visibleTo.length} personnes
                        </Badge>
                      )}
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-700 mb-4">{event.description}</p>
                  )}

                  {event.casting.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Users className="h-4 w-4 mr-2" />
                        Casting
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {event.casting.map((memberId) => (
                          <Badge key={memberId} variant="outline">
                            {getCastMemberName(memberId)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="font-medium text-yellow-800 mb-1">Notes</h4>
                      <p className="text-yellow-700 text-sm">{event.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>
    </div>
  );
};
