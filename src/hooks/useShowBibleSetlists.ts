import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface SetlistSong {
  id: string;
  setlist_id: string;
  title: string;
  duration: string | null;
  position: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Setlist {
  id: string;
  user_id: string;
  artist_id: string | null;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  songs?: SetlistSong[];
}

export const useShowBibleSetlists = (artistId?: string) => {
  const { user } = useAuth();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSetlists = async () => {
    if (!user) {
      setSetlists([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('show_bible_setlists')
        .select('*')
        .order('updated_at', { ascending: false });

      if (artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching setlists:', error);
        toast.error('Erreur lors du chargement des setlists');
        return;
      }

      // Fetch songs for each setlist
      const setlistsWithSongs = await Promise.all(
        (data || []).map(async (setlist) => {
          const { data: songs } = await supabase
            .from('show_bible_setlist_songs')
            .select('*')
            .eq('setlist_id', setlist.id)
            .order('position', { ascending: true });

          return {
            ...setlist,
            songs: songs || []
          };
        })
      );

      setSetlists(setlistsWithSongs as Setlist[]);
    } catch (error) {
      console.error('Error fetching setlists:', error);
      toast.error('Erreur lors du chargement des setlists');
    } finally {
      setLoading(false);
    }
  };

  const createSetlist = async (data: { title: string; description?: string; artist_id?: string }) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return null;
    }

    try {
      const { data: newSetlist, error } = await supabase
        .from('show_bible_setlists')
        .insert([{
          user_id: user.id,
          title: data.title,
          description: data.description || null,
          artist_id: data.artist_id || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating setlist:', error);
        toast.error('Erreur lors de la création de la setlist');
        return null;
      }

      await fetchSetlists();
      toast.success('Setlist créée avec succès');
      return newSetlist;
    } catch (error) {
      console.error('Error creating setlist:', error);
      toast.error('Erreur lors de la création de la setlist');
      return null;
    }
  };

  const updateSetlist = async (id: string, data: { title?: string; description?: string }) => {
    try {
      const { error } = await supabase
        .from('show_bible_setlists')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating setlist:', error);
        toast.error('Erreur lors de la mise à jour');
        return false;
      }

      await fetchSetlists();
      toast.success('Setlist mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating setlist:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  const deleteSetlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('show_bible_setlists')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting setlist:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      await fetchSetlists();
      toast.success('Setlist supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting setlist:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  const addSong = async (setlistId: string, song: { title: string; duration?: string; notes?: string }) => {
    try {
      // Get max position
      const { data: songs } = await supabase
        .from('show_bible_setlist_songs')
        .select('position')
        .eq('setlist_id', setlistId)
        .order('position', { ascending: false })
        .limit(1);

      const maxPosition = songs && songs.length > 0 ? songs[0].position : -1;

      const { error } = await supabase
        .from('show_bible_setlist_songs')
        .insert([{
          setlist_id: setlistId,
          title: song.title,
          duration: song.duration || null,
          notes: song.notes || null,
          position: maxPosition + 1
        }]);

      if (error) {
        console.error('Error adding song:', error);
        toast.error('Erreur lors de l\'ajout de la chanson');
        return false;
      }

      await fetchSetlists();
      toast.success('Chanson ajoutée');
      return true;
    } catch (error) {
      console.error('Error adding song:', error);
      toast.error('Erreur lors de l\'ajout de la chanson');
      return false;
    }
  };

  const updateSong = async (songId: string, data: { title?: string; duration?: string; notes?: string }) => {
    try {
      const { error } = await supabase
        .from('show_bible_setlist_songs')
        .update(data)
        .eq('id', songId);

      if (error) {
        console.error('Error updating song:', error);
        toast.error('Erreur lors de la mise à jour');
        return false;
      }

      await fetchSetlists();
      toast.success('Chanson mise à jour');
      return true;
    } catch (error) {
      console.error('Error updating song:', error);
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
  };

  const deleteSong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('show_bible_setlist_songs')
        .delete()
        .eq('id', songId);

      if (error) {
        console.error('Error deleting song:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      await fetchSetlists();
      toast.success('Chanson supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting song:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  const reorderSongs = async (setlistId: string, songs: SetlistSong[]) => {
    try {
      const updates = songs.map((song, index) => 
        supabase
          .from('show_bible_setlist_songs')
          .update({ position: index })
          .eq('id', song.id)
      );

      await Promise.all(updates);
      await fetchSetlists();
      return true;
    } catch (error) {
      console.error('Error reordering songs:', error);
      toast.error('Erreur lors de la réorganisation');
      return false;
    }
  };

  useEffect(() => {
    fetchSetlists();
  }, [user, artistId]);

  return {
    setlists,
    loading,
    createSetlist,
    updateSetlist,
    deleteSetlist,
    addSong,
    updateSong,
    deleteSong,
    reorderSongs,
    refetch: fetchSetlists
  };
};
