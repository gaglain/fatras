
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Eye } from 'lucide-react';

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface ArtistsProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedArtist: (artist: any) => void;
}

const sampleArtists = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière et une présence scénique électrisante.',
    upcomingShows: 8,
    totalShows: 150,
    rating: 4.9
  },
  {
    id: '2',
    name: 'Sarah Mitchell',
    genre: 'Folk/Acoustique',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c056ca66?w=400',
    bio: 'Artiste folk avec une voix envoûtante et des compositions originales qui touchent le cœur.',
    upcomingShows: 3,
    totalShows: 45,
    rating: 4.7
  },
  {
    id: '3',
    name: 'Thunder Road',
    genre: 'Rock Classique',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    bio: 'Trio de rock classique qui fait revivre les plus grands hits avec une énergie moderne.',
    upcomingShows: 12,
    totalShows: 89,
    rating: 4.8
  }
];

export const Artists: React.FC<ArtistsProps> = ({ setCurrentPage, setSelectedArtist }) => {
  const handleArtistClick = (artist: any) => {
    setSelectedArtist(artist);
    setCurrentPage('artist-detail');
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Nos Artistes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez les talents qui font vibrer nos scènes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sampleArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{artist.genre}</Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{artist.rating}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{artist.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{artist.upcomingShows} spectacles à venir</span>
                  <span>{artist.totalShows} spectacles total</span>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => handleArtistClick(artist)}
                    className="flex-1"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir Plus
                  </Button>
                  <Button variant="outline" size="sm">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
