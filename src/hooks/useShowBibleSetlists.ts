import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import {
  fetchSetlistsData, fetchLibrarySongsData,
  createSetlistOp, updateSetlistOp, deleteSetlistOp,
  addSongToLibraryOp, addSongOp, updateSongOp, updateLibrarySongOp,
  deleteSongOp, deleteLibrarySongOp, reorderSongsOp
} from './useSetlistOperations';

export interface SetlistSong {
  id: string; setlist_id: string; title: string; duration: string | null;
  position: number; notes: string | null; tonality: string | null;
  bpm: number | null; lyrics: string | null; library_song_id: string | null;
  created_at: string; updated_at: string;
}

export interface Setlist {
  id: string; user_id: string; artist_id: string | null; title: string;
  description: string | null; sacem_program_number: string | null;
  created_at: string; updated_at: string; songs?: SetlistSong[];
}

export interface LibrarySong {
  id: string; user_id: string; artist_id: string | null; title: string;
  duration: string | null; notes: string | null; tonality: string | null;
  bpm: number | null; lyrics: string | null; sacem_number: string | null;
  created_at: string; updated_at: string;
}

export const useShowBibleSetlists = (artistId?: string) => {
  const { user } = useAuth();
  const [setlists, setSetlists] = useState<Setlist[]>([]);
  const [librarySongs, setLibrarySongs] = useState<LibrarySong[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSetlists = async () => {
    if (!user) { setSetlists([]); setLoading(false); return; }
    try { setSetlists(await fetchSetlistsData(artistId)); }
    catch (e) { logger.error('Error fetching setlists:', e); toast.error('Erreur chargement setlists'); }
    finally { setLoading(false); }
  };

  const fetchLibrarySongs = async () => {
    if (!user) { setLibrarySongs([]); return; }
    try { setLibrarySongs(await fetchLibrarySongsData(artistId)); }
    catch (e) { logger.error('Error fetching library songs:', e); }
  };

  const wrap = (fn: () => Promise<any>, refresh: () => Promise<void>) => async () => {
    try { await fn(); await refresh(); return true; } catch (e) { logger.error('Op error:', e); return false; }
  };

  const createSetlist = async (data: { title: string; description?: string; artist_id?: string; sacem_program_number?: string }) => {
    if (!user) { toast.error('Vous devez être connecté'); return null; }
    try { const r = await createSetlistOp(user.id, data); await fetchSetlists(); return r; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur création setlist'); return null; }
  };

  const updateSetlist = async (id: string, data: { title?: string; description?: string; sacem_program_number?: string }) => {
    try { await updateSetlistOp(id, data); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur mise à jour'); return false; }
  };

  const deleteSetlist = async (id: string) => {
    try { await deleteSetlistOp(id); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur suppression'); return false; }
  };

  const addSongToLibrary = async (song: { title: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string; sacem_number?: string; artist_id?: string }) => {
    if (!user) return null;
    try { const r = await addSongToLibraryOp(user.id, song); await fetchLibrarySongs(); return r; }
    catch (e) { logger.error('Error:', e); return null; }
  };

  const addSong = async (setlistId: string, song: { title: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string; sacem_number?: string; library_song_id?: string }, setlistArtistId?: string) => {
    if (!user) { toast.error('Vous devez être connecté'); return false; }
    try { await addSongOp(user.id, setlistId, song, setlistArtistId); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error("Erreur ajout chanson"); return false; }
  };

  const addSongFromLibrary = async (setlistId: string, lib: LibrarySong) =>
    addSong(setlistId, { title: lib.title, duration: lib.duration || undefined, notes: lib.notes || undefined, tonality: lib.tonality || undefined, bpm: lib.bpm || undefined, lyrics: lib.lyrics || undefined, library_song_id: lib.id });

  const updateSong = async (songId: string, data: { title?: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string }) => {
    try { await updateSongOp(songId, data); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur mise à jour'); return false; }
  };

  const updateLibrarySong = async (songId: string, data: { title?: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string; sacem_number?: string }) => {
    try { await updateLibrarySongOp(songId, data); await fetchLibrarySongs(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur mise à jour'); return false; }
  };

  const deleteSong = async (songId: string) => {
    try { await deleteSongOp(songId); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur suppression'); return false; }
  };

  const deleteLibrarySong = async (songId: string) => {
    try { await deleteLibrarySongOp(songId); await fetchLibrarySongs(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur suppression'); return false; }
  };

  const reorderSongs = async (_setlistId: string, songs: SetlistSong[]) => {
    try { await reorderSongsOp(songs); await fetchSetlists(); return true; }
    catch (e) { logger.error('Error:', e); toast.error('Erreur réorganisation'); return false; }
  };

  useEffect(() => { fetchSetlists(); fetchLibrarySongs(); }, [user, artistId]);

  return {
    setlists, librarySongs, loading,
    createSetlist, updateSetlist, deleteSetlist,
    addSong, addSongFromLibrary, addSongToLibrary,
    updateSong, updateLibrarySong, deleteSong, deleteLibrarySong,
    reorderSongs, refetch: fetchSetlists, refetchLibrary: fetchLibrarySongs
  };
};
