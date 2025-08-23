import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

      try {
        const { data, error } = await supabase
          .from('centralized_artists')
          .select('id, name')
          .eq('user_id', user.id)
          .in('id', artistIds);

        if (error) {
          console.error('Erreur lors du chargement des artistes:', error);
          setArtists([]);
        } else {
          setArtists(data || []);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des artistes:', error);
        setArtists([]);
      } finally {
        setLoading(false);
      }
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