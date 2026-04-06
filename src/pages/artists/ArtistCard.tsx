import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Music, Calendar, MapPin, Star, Eye, BookOpen, Edit2, Trash2, Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CentralizedArtist as Artist } from '@/hooks/useCentralizedData';

interface ArtistCardProps {
  artist: Artist;
  upcomingCount: number;
  isSelected: boolean;
  onEdit: (artist: Artist) => void;
  onDelete: (artistId: string) => void;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({
  artist,
  upcomingCount,
  isSelected,
  onEdit,
  onDelete,
}) => {
  const navigate = useNavigate();

  return (
    <Card 
      className={`group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => navigate(`/artists/${artist.id}`)}
    >
      <CardContent className="p-0">
        <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5 overflow-hidden">
          {artist.image ? (
            <img 
              src={artist.image} 
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Music className="h-12 w-12 text-primary/30" />
            </div>
          )}
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={artist.status === 'active' ? 'default' : 'secondary'} className="text-xs">
              {artist.status === 'active' ? 'Actif' : 'Inactif'}
            </Badge>
            {(artist as any).is_touring && (
              <Badge className="bg-green-500 text-white text-xs">
                <Plane className="h-3 w-3 mr-1" />
                Tournée
              </Badge>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="font-semibold text-white text-lg">{artist.name}</h3>
            <p className="text-white/80 text-sm">{artist.genre}</p>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">
                {upcomingCount} spectacle{upcomingCount !== 1 ? 's' : ''} à venir
              </span>
            </div>
            {artist.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium">{artist.rating}</span>
              </div>
            )}
          </div>
          
          {artist.current_tour && (
            <p className="text-sm text-primary font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              {artist.current_tour}
            </p>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/artists/${artist.id}`);
              }}
            >
              <Eye className="h-3 w-3 mr-1" />
              Voir
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/show-bible');
              }}
            >
              <BookOpen className="h-3 w-3 mr-1" />
              Ressources
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(artist);
              }}
              className="px-2"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(artist.id);
              }}
              className="px-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
