
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Music, MapPin, Calendar } from 'lucide-react';

const sampleArtists = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    location: 'Paris, France',
    image: '/placeholder.svg',
    upcomingShows: 3,
    description: 'Groupe de rock alternatif formé en 2018, connu pour leurs performances énergiques.'
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Jazz',
    location: 'Lyon, France',
    image: '/placeholder.svg',
    upcomingShows: 1,
    description: 'Chanteuse de jazz avec une voix unique et un style intemporel.'
  },
  {
    id: '3',
    name: 'Thunder Road',
    genre: 'Metal',
    location: 'Marseille, France',
    image: '/placeholder.svg',
    upcomingShows: 5,
    description: 'Groupe de metal hardcore avec plus de 10 ans d\'expérience sur scène.'
  }
];

export const FrontArtists: React.FC = () => {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Artistes</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les talents exceptionnels de notre roster d'artistes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleArtists.map((artist) => (
            <Card key={artist.id} className="hover:shadow-lg transition-shadow overflow-hidden">
              <div className="aspect-w-16 aspect-h-9">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{artist.name}</CardTitle>
                  <Badge variant="secondary">{artist.genre}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{artist.description}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {artist.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {artist.upcomingShows} concerts à venir
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Music className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-600">
                    Écouter les extraits
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
