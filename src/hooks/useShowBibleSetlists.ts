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
  tonality: string | null;
  bpm: number | null;
  lyrics: string | null;
  library_song_id: string | null;
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

export interface LibrarySong {
  id: string;
  user_id: string;
  artist_id: string | null;
  title: string;
  duration: string | null;
  notes: string | null;
  tonality: string | null;
  bpm: number | null;
  lyrics: string | null;
  created_at: string;
  updated_at: string;
}

export const useShowBibleSetlists = (artistId?: string) => {
  const { user } = useAuth();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [librarySongs, setLibrarySongs] = useState<LibrarySong[]>([]);
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

  const fetchLibrarySongs = async () => {
    if (!user) {
      setLibrarySongs([]);
      return;
    }

    try {
      let query = supabase
        .from('artist_songs')
        .select('*')
        .order('title', { ascending: true });

      if (artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching library songs:', error);
        return;
      }

      setLibrarySongs((data || []) as LibrarySong[]);
    } catch (error) {
      console.error('Error fetching library songs:', error);
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

  const addSongToLibrary = async (song: { 
    title: string; 
    duration?: string; 
    notes?: string; 
    tonality?: string; 
    bpm?: number; 
    lyrics?: string;
    artist_id?: string;
  }): Promise<LibrarySong | null> => {
    if (!user) return null;

    try {
      // Check if song already exists in library for this artist
      const existingQuery = supabase
        .from('artist_songs')
        .select('*')
        .eq('title', song.title);
      
      if (song.artist_id) {
        existingQuery.eq('artist_id', song.artist_id);
      }

      const { data: existing } = await existingQuery.maybeSingle();

      if (existing) {
        // Update existing song with new data if provided
        const updates: any = {};
        if (song.duration) updates.duration = song.duration;
        if (song.notes) updates.notes = song.notes;
        if (song.tonality) updates.tonality = song.tonality;
        if (song.bpm) updates.bpm = song.bpm;
        if (song.lyrics) updates.lyrics = song.lyrics;

        if (Object.keys(updates).length > 0) {
          await supabase
            .from('artist_songs')
            .update(updates)
            .eq('id', existing.id);
        }

        await fetchLibrarySongs();
        return existing as LibrarySong;
      }

      // Create new library song
      const { data: newSong, error } = await supabase
        .from('artist_songs')
        .insert([{
          user_id: user.id,
          artist_id: song.artist_id || null,
          title: song.title,
          duration: song.duration || null,
          notes: song.notes || null,
          tonality: song.tonality || null,
          bpm: song.bpm || null,
          lyrics: song.lyrics || null
        }])
        .select()
        .single();

      if (error) {
        console.error('Error adding song to library:', error);
        return null;
      }

      await fetchLibrarySongs();
      return newSong as LibrarySong;
    } catch (error) {
      console.error('Error adding song to library:', error);
      return null;
    }
  };

  const addSong = async (
    setlistId: string, 
    song: { 
      title: string; 
      duration?: string; 
      notes?: string;
      tonality?: string;
      bpm?: number;
      lyrics?: string;
      library_song_id?: string;
    },
    setlistArtistId?: string
  ) => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return false;
    }

    try {
      // Get max position
      const { data: songs } = await supabase
        .from('show_bible_setlist_songs')
        .select('position')
        .eq('setlist_id', setlistId)
        .order('position', { ascending: false })
        .limit(1);

      const maxPosition = songs && songs.length > 0 ? songs[0].position : -1;

      // Add to library if not from library
      let librarySongId = song.library_song_id;
      if (!librarySongId && setlistArtistId) {
        const librarySong = await addSongToLibrary({
          ...song,
          artist_id: setlistArtistId
        });
        librarySongId = librarySong?.id;
      }

      const { error } = await supabase
        .from('show_bible_setlist_songs')
        .insert([{
          setlist_id: setlistId,
          title: song.title,
          duration: song.duration || null,
          notes: song.notes || null,
          tonality: song.tonality || null,
          bpm: song.bpm || null,
          lyrics: song.lyrics || null,
          library_song_id: librarySongId || null,
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

  const addSongFromLibrary = async (setlistId: string, librarySong: LibrarySong) => {
    return addSong(setlistId, {
      title: librarySong.title,
      duration: librarySong.duration || undefined,
      notes: librarySong.notes || undefined,
      tonality: librarySong.tonality || undefined,
      bpm: librarySong.bpm || undefined,
      lyrics: librarySong.lyrics || undefined,
      library_song_id: librarySong.id
    });
  };

  const updateSong = async (songId: string, data: { 
    title?: string; 
    duration?: string; 
    notes?: string;
    tonality?: string;
    bpm?: number;
    lyrics?: string;
  }) => {
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

  const updateLibrarySong = async (songId: string, data: { 
    title?: string; 
    duration?: string; 
    notes?: string;
    tonality?: string;
    bpm?: number;
    lyrics?: string;
  }) => {
    try {
      const { error } = await supabase
        .from('artist_songs')
        .update(data)
        .eq('id', songId);

      if (error) {
        console.error('Error updating library song:', error);
        toast.error('Erreur lors de la mise à jour');
        return false;
      }

      await fetchLibrarySongs();
      toast.success('Chanson mise à jour dans la bibliothèque');
      return true;
    } catch (error) {
      console.error('Error updating library song:', error);
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

  const deleteLibrarySong = async (songId: string) => {
    try {
      const { error } = await supabase
        .from('artist_songs')
        .delete()
        .eq('id', songId);

      if (error) {
        console.error('Error deleting library song:', error);
        toast.error('Erreur lors de la suppression');
        return false;
      }

      await fetchLibrarySongs();
      toast.success('Chanson supprimée de la bibliothèque');
      return true;
    } catch (error) {
      console.error('Error deleting library song:', error);
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
    fetchLibrarySongs();
  }, [user, artistId]);

  return {
    setlists,
    librarySongs,
    loading,
    createSetlist,
    updateSetlist,
    deleteSetlist,
    addSong,
    addSongFromLibrary,
    addSongToLibrary,
    updateSong,
    updateLibrarySong,
    deleteSong,
    deleteLibrarySong,
    reorderSongs,
    refetch: fetchSetlists,
    refetchLibrary: fetchLibrarySongs
  };
};
