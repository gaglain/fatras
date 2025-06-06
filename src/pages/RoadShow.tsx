
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, MapPin, Calendar, Clock, Users, Search, Music, Eye, Edit, Trash2, Home, Truck, Phone } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface TourStop {
  id: string;
  city: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  checkInTime: string;
  departureTime: string;
  capacity: number;
  ticketsAvailable: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes: string;
  artists: string[];
  createdBy: string;
  accommodation: string;
  accommodationAddress: string;
  localContact: string;
  localContactPhone: string;
  transport: string;
  artistLineup: {userId: string, confirmed: boolean}[];
}

interface Artist {
  id: string;
  name: string;
  genre: string;
}

const sampleArtists: Artist[] = [
  { id: '1', name: 'The Midnight Express', genre: 'Rock' },
  { id: '2', name: 'Sarah Mitchell', genre: 'Folk' },
  { id: '3', name: 'Jazz Collective', genre: 'Jazz' },
  { id: '4', name: 'Electronic Dreams', genre: 'Electronic' }
];

const sampleTourStops: TourStop[] = [
  {
    id: '1',
    city: 'Paris',
    venue: 'L\'Olympia',
    address: '28 Boulevard des Capucines, 75009 Paris',
    date: '2024-07-15',
    time: '20:00',
    checkInTime: '14:00',
    departureTime: '23:30',
    capacity: 2000,
    ticketsAvailable: 500,
    status: 'confirmed',
    crew: ['John Doe', 'Jane Smith'],
    equipment: ['Sound System', 'Lighting'],
    notes: 'VIP backstage access required',
    artists: ['1', '2'],
    createdBy: 'user-1',
    accommodation: 'Hôtel Mercure',
    accommodationAddress: '20 Rue de la Paix, 75002 Paris',
    localContact: 'Jean Dupont',
    localContactPhone: '+33 6 12 34 56 78',
    transport: 'Tour bus',
    artistLineup: [{userId: 'user-2', confirmed: true}, {userId: 'user-3', confirmed: false}]
  },
  {
    id: '2',
    city: 'Lyon',
    venue: 'Le Transbordeur',
    address: '3 Boulevard Stalingrad, 69100 Villeurbanne',
    date: '2024-07-18',
    time: '21:00',
    checkInTime: '15:00',
    departureTime: '00:00',
    capacity: 1500,
    ticketsAvailable: 200,
    status: 'pending',
    crew: ['Mike Wilson'],
    equipment: ['Sound System'],
    notes: 'Waiting for final confirmation',
    artists: ['1'],
    createdBy: 'user-1',
    accommodation: 'Pas de logement',
    accommodationAddress: '',
    localContact: 'Marie Martin',
    localContactPhone: '+33 6 98 76 54 32',
    transport: 'Train',
    artistLineup: [{userId: 'user-2', confirmed: true}]
  }
];

export const RoadShow: React.FC = () => {
  const { users, getUserById, currentUser } = useUser();
  const [tourStops, setTourStops] = useState<TourStop[]>(sampleTourStops);
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArtist, setFilterArtist] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [crewSearchTerm, setCrewSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('general');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    city: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    checkInTime: '',
    departureTime: '',
    capacity: '',
    ticketsAvailable: '',
    status: 'pending' as 'confirmed' | 'pending' | 'cancelled',
    crew: [] as string[],
    equipment: [] as string[],
    notes: '',
    artists: [] as string[],
    accommodation: '',
    accommodationAddress: '',
    localContact: '',
    localContactPhone: '',
    transport: '',
    artistLineup: [] as {userId: string, confirmed: boolean}[]
  });

  const resetForm = () => {
    setFormData({
      city: '',
      venue: '',
      address: '',
      date: '',
      time: '',
      checkInTime: '',
      departureTime: '',
      capacity: '',
      ticketsAvailable: '',
      status: 'pending',
      crew: [],
      equipment: [],
      notes: '',
      artists: [],
      accommodation: '',
      accommodationAddress: '',
      localContact: '',
      localContactPhone: '',
      transport: '',
      artistLineup: []
    });
    setSelectedTab('general');
  };

  const handleCreateStop = () => {
    const newStop: TourStop = {
      id: Date.now().toString(),
      ...formData,
      capacity: parseInt(formData.capacity),
      ticketsAvailable: parseInt(formData.ticketsAvailable),
      createdBy: currentUser?.id || 'unknown'
    };
    
    setTourStops([...tourStops, newStop]);
    setShowCreateDialog(false);
    resetForm();
    toast.success("Étape de tournée créée avec succès");
  };

  const handleEditStop = (stop: TourStop) => {
    setSelectedStop(stop);
    setFormData({
      city: stop.city,
      venue: stop.venue,
      address: stop.address || '',
      date: stop.date,
      time: stop.time,
      checkInTime: stop.checkInTime || '',
      departureTime: stop.departureTime || '',
      capacity: stop.capacity.toString(),
      ticketsAvailable: stop.ticketsAvailable.toString(),
      status: stop.status,
      crew: stop.crew,
      equipment: stop.equipment,
      notes: stop.notes,
      artists: stop.artists,
      accommodation: stop.accommodation || '',
      accommodationAddress: stop.accommodationAddress || '',
      localContact: stop.localContact || '',
      localContactPhone: stop.localContactPhone || '',
      transport: stop.transport || '',
      artistLineup: stop.artistLineup || []
    });
    setShowEditDialog(true);
  };

  const handleUpdateStop = () => {
    if (!selectedStop) return;
    
    const updatedStops = tourStops.map(stop => 
      stop.id === selectedStop.id 
        ? { 
            ...stop, 
            ...formData,
            capacity: parseInt(formData.capacity),
            ticketsAvailable: parseInt(formData.ticketsAvailable)
          }
        : stop
    );
    
    setTourStops(updatedStops);
    setShowEditDialog(false);
    setSelectedStop(null);
    resetForm();
    toast.success("Étape de tournée mise à jour avec succès");
  };

  const handleDeleteStop = (stopId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      setTourStops(tourStops.filter(stop => stop.id !== stopId));
      toast.success("Étape de tournée supprimée");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const filteredStops = tourStops.filter(stop => {
    const matchesSearch = stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.venue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesArtist = filterArtist === 'all' || stop.artists.includes(filterArtist);
    const matchesUser = filterUser === 'all' || stop.createdBy === filterUser;
    
    return matchesSearch && matchesArtist && matchesUser;
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  const toggleArtistLineup = (userId: string) => {
    const existingArtist = formData.artistLineup.find(a => a.userId === userId);
    
    if (existingArtist) {
      // Remove if exists
      setFormData({
        ...formData,
        artistLineup: formData.artistLineup.filter(a => a.userId !== userId)
      });
    } else {
      // Add if doesn't exist
      setFormData({
        ...formData,
        artistLineup: [...formData.artistLineup, { userId, confirmed: false }]
      });
    }
  };

  const toggleArtistConfirmation = (userId: string) => {
    setFormData({
      ...formData,
      artistLineup: formData.artistLineup.map(artist => 
        artist.userId === userId 
          ? { ...artist, confirmed: !artist.confirmed } 
          : artist
      )
    });
  };

  const renderDialogContent = () => (
    <>
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="logistics">Logistique</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="lineup">Casting</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Paris"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lieu</label>
              <Input
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="L'Olympia"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse du lieu</label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="28 Boulevard des Capucines, 75009 Paris"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure du concert</label>
              <Input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Capacité</label>
              <Input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="2000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Billets disponibles</label>
              <Input
                type="number"
                value={formData.ticketsAvailable}
                onChange={(e) => setFormData({ ...formData, ticketsAvailable: e.target.value })}
                placeholder="500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="confirmed">Confirmé</SelectItem>
                <SelectItem value="cancelled">Annulé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Notes spéciales..."
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure de Check-in</label>
              <Input
                type="time"
                value={formData.checkInTime}
                onChange={(e) => setFormData({ ...formData, checkInTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Heure de départ prévue</label>
              <Input
                type="time"
                value={formData.departureTime}
                onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Transport</label>
            <Select 
              value={formData.transport} 
              onValueChange={(value) => setFormData({ ...formData, transport: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un mode de transport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tour bus">Tour bus</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Train">Train</SelectItem>
                <SelectItem value="Avion">Avion</SelectItem>
                <SelectItem value="Individuel">Individuel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Logement</label>
            <Input
              value={formData.accommodation}
              onChange={(e) => setFormData({ ...formData, accommodation: e.target.value })}
              placeholder="Nom de l'hôtel, Airbnb, etc."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adresse du logement</label>
            <Input
              value={formData.accommodationAddress}
              onChange={(e) => setFormData({ ...formData, accommodationAddress: e.target.value })}
              placeholder="Adresse complète du logement"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Équipement</label>
            <Textarea
              value={formData.equipment.join(', ')}
              onChange={(e) => setFormData({ ...formData, equipment: e.target.value.split(',').map(item => item.trim()) })}
              placeholder="Équipement nécessaire..."
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Contact sur place</label>
            <Input
              value={formData.localContact}
              onChange={(e) => setFormData({ ...formData, localContact: e.target.value })}
              placeholder="Nom du contact local"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone du contact</label>
            <Input
              value={formData.localContactPhone}
              onChange={(e) => setFormData({ ...formData, localContactPhone: e.target.value })}
              placeholder="+33 6 12 34 56 78"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Équipe technique</label>
            <Input
              value={crewSearchTerm}
              onChange={(e) => setCrewSearchTerm(e.target.value)}
              placeholder="Rechercher des membres d'équipe..."
              className="mb-2"
            />
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {users
                .filter(user => user.name.toLowerCase().includes(crewSearchTerm.toLowerCase()))
                .map((user) => (
                  <div key={user.id} className="flex items-center p-2 hover:bg-gray-100">
                    <Checkbox
                      checked={formData.crew.includes(user.id)}
                      onCheckedChange={() => {
                        if (formData.crew.includes(user.id)) {
                          setFormData({
                            ...formData,
                            crew: formData.crew.filter(id => id !== user.id)
                          });
                        } else {
                          setFormData({
                            ...formData,
                            crew: [...formData.crew, user.id]
                          });
                        }
                      }}
                    />
                    <span className="ml-2">{user.name}</span>
                  </div>
                ))
              }
            </div>
          </div>
        </TabsContent>

        <TabsContent value="lineup" className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher des artistes</label>
            <Input
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              placeholder="Rechercher des artistes..."
              className="mb-2"
            />
            <div className="max-h-64 overflow-y-auto border rounded p-2">
              {filteredUsers.map((user) => {
                const isSelected = formData.artistLineup.some(a => a.userId === user.id);
                const isConfirmed = formData.artistLineup.find(a => a.userId === user.id)?.confirmed || false;
                
                return (
                  <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-100">
                    <div className="flex items-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleArtistLineup(user.id)}
                      />
                      <span className="ml-2">{user.name}</span>
                    </div>
                    
                    {isSelected && (
                      <div className="flex items-center">
                        <span className="mr-2 text-sm">Confirmé</span>
                        <Switch
                          checked={isConfirmed}
                          onCheckedChange={() => toggleArtistConfirmation(user.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feuille de Route</h1>
          <p className="text-gray-600 mt-2">Gérez votre tournée et planifiez vos dates</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Étape
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle étape de tournée</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderDialogContent()}

              <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleCreateStop}>
                  Créer l'étape
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par ville ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterArtist} onValueChange={setFilterArtist}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par artiste" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les artistes</SelectItem>
            {sampleArtists.map((artist) => (
              <SelectItem key={artist.id} value={artist.id}>
                {artist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterUser} onValueChange={setFilterUser}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par créateur" />
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

      {/* Liste des étapes */}
      <div className="grid gap-6">
        {filteredStops.map((stop) => {
          const creator = getUserById(stop.createdBy);
          const stopArtists = stop.artists.map(artistId => 
            sampleArtists.find(artist => artist.id === artistId)
          ).filter(Boolean);
          
          return (
            <Card key={stop.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      <h3 className="text-xl font-semibold">{stop.city} - {stop.venue}</h3>
                      <Badge className={getStatusColor(stop.status)}>
                        {getStatusLabel(stop.status)}
                      </Badge>
                    </div>
                    
                    {stop.address && (
                      <p className="text-sm text-gray-500 ml-8 mb-4">{stop.address}</p>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(stop.date).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>Concert: {stop.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{stop.ticketsAvailable}/{stop.capacity} places</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Music className="h-4 w-4 text-gray-500" />
                        <span>{stopArtists.map(artist => artist?.name).join(', ') || 'Aucun artiste'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {stop.checkInTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Check-in: {stop.checkInTime}</span>
                        </div>
                      )}
                      {stop.departureTime && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Départ prévu: {stop.departureTime}</span>
                        </div>
                      )}
                      {stop.transport && (
                        <div className="flex items-center space-x-2">
                          <Truck className="h-4 w-4 text-gray-500" />
                          <span>Transport: {stop.transport}</span>
                        </div>
                      )}
                      {stop.accommodation && (
                        <div className="flex items-center space-x-2">
                          <Home className="h-4 w-4 text-gray-500" />
                          <span>Logement: {stop.accommodation}</span>
                          {stop.accommodationAddress && <span className="text-xs text-gray-500">({stop.accommodationAddress})</span>}
                        </div>
                      )}
                      {stop.localContact && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>Contact: {stop.localContact} {stop.localContactPhone && <span>- {stop.localContactPhone}</span>}</span>
                        </div>
                      )}
                    </div>
                    
                    {stop.artistLineup && stop.artistLineup.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Équipe artistique:</h4>
                        <div className="flex flex-wrap gap-2">
                          {stop.artistLineup.map(artist => {
                            const user = getUserById(artist.userId);
                            if (!user) return null;
                            
                            return (
                              <Badge key={artist.userId} variant={artist.confirmed ? "default" : "outline"}>
                                {user.name} {artist.confirmed ? '✓' : '?'}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {stop.notes && (
                      <p className="text-gray-600 mt-3 italic">"{stop.notes}"</p>
                    )}
                    
                    <div className="text-sm text-gray-500 mt-3">
                      Créé par: {creator?.name || 'Utilisateur inconnu'}
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleEditStop(stop)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDeleteStop(stop.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog de modification */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'étape de tournée</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {renderDialogContent()}

            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdateStop}>
                Sauvegarder
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
