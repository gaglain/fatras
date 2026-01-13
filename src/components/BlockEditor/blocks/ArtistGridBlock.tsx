
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Star, Eye } from 'lucide-react';
import { ArtistGridBlockContent } from '../types';
import { useCentralizedData } from '@/contexts/CentralizedDataContext';

interface ArtistGridBlockProps {
  content: ArtistGridBlockContent;
  isEditing: boolean;
  onChange: (content: ArtistGridBlockContent) => void;
}

export const ArtistGridBlock: React.FC<ArtistGridBlockProps> = ({ content, isEditing, onChange }) => {
  const { artists } = useCentralizedData();
  const [isEditingGrid, setIsEditingGrid] = useState(false);

  if (isEditing && isEditingGrid) {
    return (
      <Card className="m-4">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Input
              value={content.title}
              onChange={(e) => onChange({ ...content, title: e.target.value })}
              placeholder="Titre de la section"
            />
            
            <Input
              value={content.subtitle}
              onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
              placeholder="Sous-titre"
            />
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={content.showRating}
                  onCheckedChange={(checked) => onChange({ ...content, showRating: checked })}
                />
                <label>Afficher les notes</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={content.showStats}
                  onCheckedChange={(checked) => onChange({ ...content, showStats: checked })}
                />
                <label>Afficher les statistiques</label>
              </div>
            </div>
            
            <Button onClick={() => setIsEditingGrid(false)}>
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className={`py-16 bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 ${isEditing ? 'cursor-pointer' : ''}`}>
      <div 
        className="max-w-7xl mx-auto px-4"
        onClick={() => isEditing && setIsEditingGrid(true)}
      >
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h2>
          <p className="text-lg text-gray-700">{content.subtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {artists.slice(0, 2).map((artist) => (
            <Card key={artist.id} className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden bg-white rounded-3xl">
              <div className="relative">
                <img 
                  src={artist.image || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'} 
                  alt={artist.name} 
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{artist.name}</h3>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm rounded-full">
                    {artist.genre}
                  </Badge>
                </div>
                {content.showRating && (
                  <div className="absolute top-6 right-6 flex items-center space-x-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-white font-medium text-sm">{artist.rating || 4.5}</span>
                  </div>
                )}
              </div>
              
              <CardContent className="p-6">
                <p className="text-gray-600 mb-6 leading-relaxed">{artist.bio || 'Description de l\'artiste...'}</p>
                
                {content.showStats && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="text-center">
                        <div className="font-bold text-pink-600 text-lg">{artist.upcoming_shows}</div>
                        <div className="text-xs">Prochains shows</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-pink-600 text-lg">{artist.total_shows}</div>
                        <div className="text-xs">Total shows</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-2xl">
                  <Eye className="mr-2 h-4 w-4" />
                  Voir le Profil Complet
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {artists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun spectacle disponible pour affichage.</p>
          </div>
        )}
      </div>
    </section>
  );
};
