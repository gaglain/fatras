
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Play, Eye } from 'lucide-react';
import { useCentralizedData } from '@/contexts/CentralizedDataContext';

type PageType = 'home' | 'artists' | 'artist-detail' | 'contact' | 'tour' | 'shop';

interface ArtistsProps {
  setCurrentPage: (page: PageType) => void;
  setSelectedArtist: (artist: any) => void;
}

export const Artists: React.FC<ArtistsProps> = ({ setCurrentPage, setSelectedArtist }) => {
  const { artists } = useCentralizedData();

  console.log('🎭 Front Artists component - Using centralized artists:', artists.length);

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
            Découvrez les talents qui font vibrer nos scènes ({artists.length} artistes)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'} 
                  alt={artist.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{artist.genre}</Badge>
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="ml-1 text-sm text-gray-600">{artist.rating || 4.5}</span>
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{artist.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{artist.bio || 'Description de l\'artiste...'}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{artist.upcoming_shows} spectacles à venir</span>
                  <span>{artist.total_shows} spectacles total</span>
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

        {artists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun artiste disponible pour le moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};
