import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/UnifiedAuthContext';
import { logger } from '@/lib/logger';

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
  function_title?: string;
  created_at: string;
  updated_at: string;
}

const mapDbToArtist = (profile: any): Artist => ({
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
  function_title: profile.function_title || '',
  created_at: profile.created_at,
  updated_at: profile.updated_at
});

const fetchArtists = async (): Promise<Artist[]> => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('role', ['artiste', 'admin', 'super_admin', 'manager']);

  if (error) {
    logger.error('Error fetching artists:', error);
    throw error;
  }

  return (data || []).map(mapDbToArtist);
};

export const useArtists = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthContext();

  const { 
    data: artists = [], 
    isLoading: loading,
    refetch 
  } = useQuery({
    queryKey: ['artists'],
    queryFn: fetchArtists,
    enabled: !!user,
    staleTime: 60000,
  });

  const addArtistMutation = useMutation({
    mutationFn: async (artistData: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
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
          function_title: artistData.function_title
        })
        .select()
        .single();

      if (error) throw error;
      return mapDbToArtist(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    }
  });

  const updateArtistMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Artist> }) => {
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
          function_title: updates.function_title
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return mapDbToArtist(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artists'] });
    }
  });

  const addArtist = async (artistData: Omit<Artist, 'id' | 'created_at' | 'updated_at'>) => {
    return addArtistMutation.mutateAsync(artistData);
  };

  const updateArtist = async (id: string, updates: Partial<Artist>) => {
    return updateArtistMutation.mutateAsync({ id, updates });
  };

  return {
    artists,
    loading,
    addArtist,
    updateArtist,
    refetch
  };
};
