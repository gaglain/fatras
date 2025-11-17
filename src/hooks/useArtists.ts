import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';

export interface Artist {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  show_name?: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  nationality?: string;
  function_title?: string;
  created_at: string;
  updated_at: string;
}

export const useArtists = () => {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) return;

    const fetchArtists = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .in('role', ['artiste', 'admin', 'super_admin', 'manager']);

      if (data && !error) {
        const artistsData: Artist[] = data.map(profile => ({
          id: profile.id,
          user_id: profile.user_id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          show_name: profile.show_name || '',
          role: profile.role,
          phone: profile.phone || '',
          address: profile.address || '',
          city: profile.city || '',
          nationality: profile.nationality || '',
          function_title: profile.function_title || '',
          created_at: profile.created_at,
          updated_at: profile.updated_at
        }));
        setArtists(artistsData);
      }
      setLoading(false);
    };

    fetchArtists();
  }, [user]);

  const addArtist = async (artistData: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: artistData.user_id,
        username: artistData.email?.split('@')[0] || 'artist',
        first_name: artistData.first_name,
        last_name: artistData.last_name,
        email: artistData.email,
        show_name: artistData.show_name,
        role: artistData.role,
        phone: artistData.phone,
        address: artistData.address,
        city: artistData.city,
        nationality: artistData.nationality,
        function_title: artistData.function_title
      })
      .select()
      .single();

    if (data && !error) {
      const newArtist: Artist = {
        id: data.id,
        user_id: data.user_id,
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        show_name: data.show_name || '',
        role: data.role,
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        nationality: data.nationality || '',
        function_title: data.function_title || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setArtists(prev => [...prev, newArtist]);
      return newArtist;
    }
    return null;
  };

  const updateArtist = async (id: string, updates: Partial<Artist>) => {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        show_name: updates.show_name,
        role: updates.role,
        phone: updates.phone,
        address: updates.address,
        city: updates.city,
        nationality: updates.nationality,
        function_title: updates.function_title
      })
      .eq('id', id)
      .select()
      .single();

    if (data && !error) {
      setArtists(prev => prev.map(artist => 
        artist.id === id ? { ...artist, ...updates } : artist
      ));
    }
  };

  return {
    artists,
    loading,
    addArtist,
    updateArtist
  };
};