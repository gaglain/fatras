import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewToggle } from '@/components/ui/view-toggle';
import { Plus, Music, Calendar, MapPin, Clock, Bed, BookOpen, Trash2, Upload, Image, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCentralizedData, CentralizedArtist as Artist } from '@/hooks/useCentralizedData';
import { toast } from 'sonner';

interface TourSchedule {
  id: string;
  artistId: string;
  venue: string;
  date: string;
  showTime: string;
  rehearsalTime: string;
  hotel?: string;
  notes?: string;
}

const sampleTourSchedule: TourSchedule[] = [
  {
    id: '1',
    artistId: '1',
    venue: 'Madison Square Garden',
    date: '2024-07-15',
    showTime: '20:00',
    rehearsalTime: '16:00',
    hotel: 'The Plaza Hotel',
    notes: 'Rencontre VIP après le spectacle'
  },
  {
    id: '2',
    artistId: '1',
    venue: 'Boston Garden',
    date: '2024-07-18',
    showTime: '19:30',
    rehearsalTime: '15:30',
    hotel: 'Four Seasons Boston'
  }
];

export const Artists: React.FC = () => {
  const navigate = useNavigate();
  const { artists, addArtist, updateArtist, deleteArtist } = useCentralizedData();
  const [tourSchedule, setTourSchedule] = useState<TourSchedule[]>(sampleTourSchedule);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    name: '',
    genre: '',
    currentTour: '',
    bio: '',
    image: ''
  });

  console.log('🎭 Artists page - Current artists:', artists.length);

  const filteredArtists = artists.filter(artist =>
    artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedArtistSchedule = tourSchedule.filter(
    schedule => schedule.artistId === selectedArtist
  );

  const handleDeleteArtist = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId);
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'artiste "${artist?.name}" ? Cette action est irréversible.`)) {
      deleteArtist(artistId);
      setTourSchedule(prev => prev.filter(schedule => schedule.artistId !== artistId));
      if (selectedArtist === artistId) {
        setSelectedArtist(null);
      }
      toast.success('Artiste supprimé avec succès');
    }
  };

  const handleEditArtist = (artist: Artist) => {
    console.log('✏️ Editing artist:', artist);
    setEditingArtist(artist);
    setFormData({
      name: artist.name,
      genre: artist.genre,
      currentTour: artist.current_tour || '',
      bio: artist.bio || '',
      image: artist.image || ''
    });
    setShowAddForm(true);
  };

  const handleSaveArtist = () => {
    if (!formData.name || !formData.genre) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const artistData = {
      name: formData.name,
      genre: formData.genre,
      status: 'active' as const,
      upcoming_shows: editingArtist?.upcoming_shows || 0,
      total_shows: editingArtist?.total_shows || 0,
      current_tour: formData.currentTour || undefined,
      bio: formData.bio || undefined,
      image: formData.image || undefined
    };

    if (editingArtist) {
      updateArtist(editingArtist.id, artistData);
      toast.success('Artiste modifié avec succès');
    } else {
      addArtist(artistData);
      toast.success('Artiste créé avec succès');
    }

    setShowAddForm(false);
    setEditingArtist(null);
    setFormData({
      name: '',
      genre: '',
      currentTour: '',
      bio: '',
      image: ''
    });
  };

  return (
    <div className="space-y-6 p-4 lg:p-0">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion des Spectacles</h1>
          <p className="text-muted-foreground mt-1 text-sm lg:text-base">Gérer les spectacles, tournées, plannings et logistique ({artists.length} spectacles)</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => navigate('/show-bible')} className="w-full sm:w-auto">
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Bible de Spectacle</span>
            <span className="sm:hidden">Bible</span>
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Ajouter Spectacle</span>
            <span className="sm:hidden">Ajouter</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Artists List */}
        <div className="lg:col-span-1">
          <h2 className="text-lg lg:text-xl font-semibold mb-4">Spectacles</h2>
          <div className="space-y-3">
            {artists.map((artist) => (
              <Card 
                key={artist.id} 
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedArtist === artist.id ? 'ring-2 ring-purple-500' : ''
                }`}
                onClick={() => setSelectedArtist(artist.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <Music className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{artist.name}</h3>
                      <p className="text-sm text-gray-500">{artist.genre}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge variant={artist.status === 'active' ? 'default' : 'secondary'}>
                        {artist.status === 'active' ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditArtist(artist);
                        }}
                        className="p-1 h-6 w-6 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <Music className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArtist(artist.id);
                        }}
                        className="p-1 h-6 w-6 text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{artist.upcoming_shows} spectacles à venir</p>
                    {artist.current_tour && (
                      <p className="text-purple-600 font-medium">{artist.current_tour}</p>
                    )}
                  </div>
                  
                  <div className="mt-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/show-bible');
                      }}
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Voir Bible
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tour Schedule */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {selectedArtist ? 
                `Planning de Tournée - ${artists.find(a => a.id === selectedArtist)?.name}` : 
                'Sélectionner un artiste pour voir le planning de tournée'
              }
            </h2>
            
            {selectedArtist ? (
              <div className="space-y-4">
                {selectedArtistSchedule.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">{schedule.venue}</h3>
                          
                          <div className="space-y-2">
                            <div className="flex items-center text-gray-600">
                              <Calendar className="h-4 w-4 mr-2" />
                              <span>{new Date(schedule.date).toLocaleDateString('fr-FR')}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Spectacle: {schedule.showTime}</span>
                            </div>
                            
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>Répétition: {schedule.rehearsalTime}</span>
                            </div>
                            
                            {schedule.hotel && (
                              <div className="flex items-center text-gray-600">
                                <Bed className="h-4 w-4 mr-2" />
                                <span>{schedule.hotel}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          {schedule.notes && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                              <p className="text-gray-600 text-sm">{schedule.notes}</p>
                            </div>
                          )}
                          
                          <div className="mt-4 space-y-2">
                            <Button variant="outline" size="sm" className="w-full">
                              <Calendar className="h-3 w-3 mr-1" />
                              Ajouter au Google Calendar
                            </Button>
                            <Button variant="outline" size="sm" className="w-full">
                              Modifier Planning
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {selectedArtistSchedule.length === 0 && (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <p className="text-gray-500">Aucune date de tournée programmée pour cet artiste.</p>
                      <Button className="mt-4" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Ajouter Date de Tournée
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Sélectionnez un artiste dans la liste pour voir son planning de tournée et gérer la logistique.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Artist Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingArtist ? 'Modifier le Spectacle' : 'Ajouter Nouveau Spectacle'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  placeholder="Nom du spectacle *" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input 
                  placeholder="Genre/Type *" 
                  value={formData.genre}
                  onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                />
              </div>
              
              <Input 
                placeholder="Tournée/Série actuelle (optionnel)" 
                value={formData.currentTour}
                onChange={(e) => setFormData(prev => ({ ...prev, currentTour: e.target.value }))}
              />
              
              <Input 
                placeholder="URL de l'image (optionnel)" 
                value={formData.image}
                onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
              />
              
              <div>
                <label className="block text-sm font-medium mb-2">Description du spectacle</label>
                <textarea 
                  className="w-full p-3 border rounded-md min-h-24"
                  placeholder="Description du spectacle, synopsis, informations techniques..."
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingArtist(null);
                    setFormData({
                      name: '',
                      genre: '',
                      currentTour: '',
                      bio: '',
                      image: ''
                    });
                  }} 
                  variant="outline" 
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button 
                  onClick={handleSaveArtist}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  {editingArtist ? 'Modifier' : 'Sauvegarder'} Spectacle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
