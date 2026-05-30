import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import type { Setlist, SetlistSong, LibrarySong } from './useShowBibleSetlists';

export async function fetchSetlistsData(artistId?: string): Promise<Setlist[]> {
  let query = supabase.from('show_bible_setlists').select('*').order('updated_at', { ascending: false });
  if (artistId) query = query.eq('artist_id', artistId);
  const { data, error } = await query;
  if (error) throw error;

  return Promise.all(
    (data || []).map(async (setlist) => {
      const { data: songs } = await supabase
        .from('show_bible_setlist_songs').select('*')
        .eq('setlist_id', setlist.id).order('position', { ascending: true });
      return { ...setlist, songs: songs || [] } as Setlist;
    })
  );
}

export async function fetchLibrarySongsData(artistId?: string): Promise<LibrarySong[]> {
  let query = supabase.from('artist_songs').select('*').order('title', { ascending: true });
  if (artistId) query = query.eq('artist_id', artistId);
  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as LibrarySong[];
}

export async function createSetlistOp(userId: string, data: { title: string; description?: string; artist_id?: string; sacem_program_number?: string }) {
  const { data: result, error } = await supabase
    .from('show_bible_setlists')
    .insert([{ user_id: userId, title: data.title, description: data.description || null, artist_id: data.artist_id || null, sacem_program_number: data.sacem_program_number || null }])
    .select().single();
  if (error) throw error;
  toast.success('Setlist créée avec succès');
  return result;
}

export async function updateSetlistOp(id: string, data: { title?: string; description?: string; sacem_program_number?: string }) {
  const { error } = await supabase.from('show_bible_setlists').update(data).eq('id', id);
  if (error) throw error;
  toast.success('Setlist mise à jour');
}

export async function deleteSetlistOp(id: string) {
  const { error } = await supabase.from('show_bible_setlists').delete().eq('id', id);
  if (error) throw error;
  toast.success('Setlist supprimée');
}

export async function duplicateSetlistOp(userId: string, id: string) {
  const { data: original, error: fetchErr } = await supabase
    .from('show_bible_setlists').select('*').eq('id', id).single();
  if (fetchErr || !original) throw fetchErr || new Error('Setlist introuvable');

  const { data: songs, error: songsErr } = await supabase
    .from('show_bible_setlist_songs').select('*').eq('setlist_id', id).order('position', { ascending: true });
  if (songsErr) throw songsErr;

  const { data: newSetlist, error: insErr } = await supabase
    .from('show_bible_setlists')
    .insert([{
      user_id: userId,
      title: `${original.title} (copie)`,
      description: original.description,
      artist_id: original.artist_id,
      sacem_program_number: original.sacem_program_number,
    }])
    .select().single();
  if (insErr || !newSetlist) throw insErr || new Error('Erreur duplication');

  if (songs && songs.length > 0) {
    const rows = songs.map((s, idx) => ({
      setlist_id: newSetlist.id,
      title: s.title,
      duration: s.duration,
      notes: s.notes,
      tonality: s.tonality,
      bpm: s.bpm,
      lyrics: s.lyrics,
      library_song_id: s.library_song_id,
      position: idx,
    }));
    const { error: songInsErr } = await supabase.from('show_bible_setlist_songs').insert(rows);
    if (songInsErr) throw songInsErr;
  }

  toast.success('Setlist dupliquée');
  return newSetlist;
}


export async function addSongToLibraryOp(userId: string, song: {
  title: string; duration?: string; notes?: string; tonality?: string;
  bpm?: number; lyrics?: string; sacem_number?: string; artist_id?: string;
}): Promise<LibrarySong | null> {
  const existingQuery = supabase.from('artist_songs').select('*').eq('title', song.title);
  if (song.artist_id) existingQuery.eq('artist_id', song.artist_id);
  const { data: existing } = await existingQuery.maybeSingle();

  if (existing) {
    const updates: Record<string, any> = {};
    if (song.duration) updates.duration = song.duration;
    if (song.notes) updates.notes = song.notes;
    if (song.tonality) updates.tonality = song.tonality;
    if (song.bpm) updates.bpm = song.bpm;
    if (song.lyrics) updates.lyrics = song.lyrics;
    if (song.sacem_number) updates.sacem_number = song.sacem_number;
    if (Object.keys(updates).length > 0) {
      await supabase.from('artist_songs').update(updates).eq('id', existing.id);
    }
    return existing as LibrarySong;
  }

  const { data: newSong, error } = await supabase
    .from('artist_songs')
    .insert([{ user_id: userId, artist_id: song.artist_id || null, title: song.title, duration: song.duration || null, notes: song.notes || null, tonality: song.tonality || null, bpm: song.bpm || null, lyrics: song.lyrics || null, sacem_number: song.sacem_number || null }])
    .select().single();
  if (error) throw error;
  return newSong as LibrarySong;
}

export async function addSongOp(userId: string, setlistId: string, song: {
  title: string; duration?: string; notes?: string; tonality?: string;
  bpm?: number; lyrics?: string; sacem_number?: string; library_song_id?: string;
}, setlistArtistId?: string) {
  const { data: songs } = await supabase.from('show_bible_setlist_songs').select('position').eq('setlist_id', setlistId).order('position', { ascending: false }).limit(1);
  const maxPosition = songs?.length ? songs[0].position : -1;

  let librarySongId = song.library_song_id;
  if (!librarySongId && setlistArtistId) {
    const lib = await addSongToLibraryOp(userId, { ...song, artist_id: setlistArtistId });
    librarySongId = lib?.id;
  }

  const { error } = await supabase.from('show_bible_setlist_songs').insert([{
    setlist_id: setlistId, title: song.title, duration: song.duration || null, notes: song.notes || null,
    tonality: song.tonality || null, bpm: song.bpm || null, lyrics: song.lyrics || null,
    library_song_id: librarySongId || null, position: maxPosition + 1
  }]);
  if (error) throw error;
  toast.success('Chanson ajoutée');
}

export async function updateSongOp(songId: string, data: { title?: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string }) {
  const { error } = await supabase.from('show_bible_setlist_songs').update(data).eq('id', songId);
  if (error) throw error;
  toast.success('Chanson mise à jour');
}

export async function updateLibrarySongOp(songId: string, data: { title?: string; duration?: string; notes?: string; tonality?: string; bpm?: number; lyrics?: string; sacem_number?: string }) {
  const { error } = await supabase.from('artist_songs').update(data).eq('id', songId);
  if (error) throw error;
  toast.success('Chanson mise à jour dans la bibliothèque');
}

export async function deleteSongOp(songId: string) {
  const { error } = await supabase.from('show_bible_setlist_songs').delete().eq('id', songId);
  if (error) throw error;
  toast.success('Chanson supprimée');
}

export async function deleteLibrarySongOp(songId: string) {
  const { error } = await supabase.from('artist_songs').delete().eq('id', songId);
  if (error) throw error;
  toast.success('Chanson supprimée de la bibliothèque');
}

export async function reorderSongsOp(songs: SetlistSong[]) {
  await Promise.all(songs.map((song, index) => supabase.from('show_bible_setlist_songs').update({ position: index }).eq('id', song.id)));
}
