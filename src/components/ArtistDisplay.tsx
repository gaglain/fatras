import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

interface Artist {
  id: string;
  name: string;
}

interface ArtistDisplayProps {
  artistIds: string[];
  className?: string;
}

export const ArtistDisplay: React.FC<ArtistDisplayProps> = ({ artistIds, className = "" }) => {
  const { user } = useAuth();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtists = async () => {
      if (!user || !artistIds || artistIds.length === 0) {
        setArtists([]);
        setLoading(false);
        return;
      }

      // Séparer les UUIDs valides des anciens IDs
      const validUuids = artistIds.filter(id => {
        // Vérifier si c'est un UUID valide (36 caractères avec des tirets)
        return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });

      const oldIds = artistIds.filter(id => {
        return !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      });

      const allArtists: Artist[] = [];

      // Récupérer les artistes avec des UUIDs valides
      if (validUuids.length > 0) {
        try {
          const { data, error } = await supabase
            .from('centralized_artists')
            .select('id, name')
            .eq('user_id', user.id)
            .in('id', validUuids);

          if (error) {
            console.error('Erreur lors du chargement des artistes:', error);
          } else {
            allArtists.push(...(data || []));
          }
        } catch (error) {
          console.error('Erreur lors du chargement des artistes:', error);
        }
      }

      // Pour les anciens IDs, utiliser les noms d'exemple correspondants
      const artistNameMap: Record<string, string> = {
        'artist-1': 'The Midnight Express',
        'artist-2': 'Sarah Mitchell', 
        'artist-3': 'Thunder Road',
        'artist-4': 'Acoustic Dreams'
      };

      oldIds.forEach(oldId => {
        allArtists.push({
          id: oldId,
          name: artistNameMap[oldId] || oldId.replace('artist-', 'Artiste ')
        });
      });

      setArtists(allArtists);
      setLoading(false);
    };

    fetchArtists();
  }, [user, artistIds]);

  if (loading) {
    return <span className={`text-xs text-muted-foreground ${className}`}>Chargement...</span>;
  }

  if (artists.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {artists.map((artist) => (
        <span 
          key={artist.id} 
          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
        >
          {artist.name}
        </span>
      ))}
    </div>
  );
};