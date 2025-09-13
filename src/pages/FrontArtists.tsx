
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const FrontArtists: React.FC = () => {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArtists();
  }, []);

  const loadArtists = async () => {
    setLoading(true);
    try {
      // Charger depuis localStorage d'abord
      const savedArtists = localStorage.getItem('backoffice_artists');
      if (savedArtists) {
        const parsedArtists = JSON.parse(savedArtists);
        setArtists(parsedArtists || []);
      } else {
        // Données d'exemple si rien dans localStorage
        setArtists([
          { 
            id: '1', 
            name: 'Spectacle Jazz Fusion', 
            genre: 'Jazz', 
            bio: 'Un spectacle unique mêlant jazz moderne et fusion électronique.',
            photo_url: '/placeholder.svg'
          },
          { 
            id: '2', 
            name: 'Concert Classique', 
            genre: 'Classique', 
            bio: 'Soirée de musique classique avec orchestre symphonique.',
            photo_url: '/placeholder.svg'
          },
          { 
            id: '3', 
            name: 'Show Rock Énergie', 
            genre: 'Rock', 
            bio: 'Concert rock avec une énergie débordante et des guitares électriques.',
            photo_url: '/placeholder.svg'
          }
        ]);
      }
    } catch (error) {
      console.error('❌ Error loading artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Nos Spectacles
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Découvrez notre sélection d'artistes exceptionnels et leurs spectacles uniques.
          </p>
        </div>
        
        {artists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {artists.map((artist) => (
              <Card key={artist.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  {artist.photo_url && (
                    <div className="mb-4">
                      <img 
                        src={artist.photo_url} 
                        alt={artist.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <div className="text-center">
                    <h3 className="text-xl font-semibold mb-2">{artist.name}</h3>
                    {artist.genre && (
                      <Badge variant="outline" className="mb-3">{artist.genre}</Badge>
                    )}
                    {artist.bio && (
                      <p className="text-muted-foreground text-sm mb-4">{artist.bio}</p>
                    )}
                    {artist.website && (
                      <a 
                        href={artist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Découvrir
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-16">
            <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground/50" />
            <h3 className="text-xl font-medium mb-2">Aucun spectacle disponible</h3>
            <p>Nos spectacles seront bientôt disponibles. Revenez nous voir !</p>
          </div>
        )}
      </div>
    </div>
  );
};
