
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Music, Calendar, MapPin, Clock, Bed, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Artist {
  id: string;
  name: string;
  genre: string;
  status: 'active' | 'inactive';
  upcomingShows: number;
  currentTour?: string;
}

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

const sampleArtists: Artist[] = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    status: 'active',
    upcomingShows: 8,
    currentTour: 'Tournée Rock Été 2024'
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustique',
    status: 'active',
    upcomingShows: 3
  },
  {
    id: '3',
    name: 'Thunder Road',
    genre: 'Rock Classique',
    status: 'active',
    upcomingShows: 12,
    currentTour: 'Tournée Legends Never Die'
  }
];

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
  const [artists, setArtists] = useState<Artist[]>(sampleArtists);
  const [tourSchedule, setTourSchedule] = useState<TourSchedule[]>(sampleTourSchedule);
  const [selectedArtist, setSelectedArtist] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const selectedArtistSchedule = tourSchedule.filter(
    schedule => schedule.artistId === selectedArtist
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Artistes</h1>
          <p className="text-gray-600 mt-2">Gérer les artistes, tournées, plannings et logistique</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => navigate('/show-bible')}>
            <BookOpen className="h-4 w-4 mr-2" />
            Bible de Spectacle
          </Button>
          <Button onClick={() => setShowAddForm(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter Artiste
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Artists List */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Artistes</h2>
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
                    <Badge variant={artist.status === 'active' ? 'default' : 'secondary'}>
                      {artist.status === 'active' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>{artist.upcomingShows} spectacles à venir</p>
                    {artist.currentTour && (
                      <p className="text-purple-600 font-medium">{artist.currentTour}</p>
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
        </div>

        {/* Tour Schedule */}
        <div className="lg:col-span-2">
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

      {/* Add Artist Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Ajouter Nouvel Artiste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input placeholder="Nom de l'artiste" />
              <Input placeholder="Genre" />
              <Input placeholder="Tournée actuelle (optionnel)" />
              <div className="flex space-x-3 pt-4">
                <Button onClick={() => setShowAddForm(false)} variant="outline" className="flex-1">
                  Annuler
                </Button>
                <Button onClick={() => setShowAddForm(false)} className="flex-1 bg-purple-600 hover:bg-purple-700">
                  Sauvegarder Artiste
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
