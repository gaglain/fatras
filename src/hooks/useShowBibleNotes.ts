import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface ShowBibleNote {
  id: string;
  user_id: string;
  artist_id: string | null;
  title: string;
  content: string;
  content_type: string;
  mentioned_users: string[];
  tags: string[];
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  content_type?: string;
  artist_id?: string | null;
  mentioned_users?: string[];
  tags?: string[];
  is_pinned?: boolean;
}

export const useShowBibleNotes = (artistId?: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<ShowBibleNote[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from('show_bible_notes')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (artistId) {
        query = query.eq('artist_id', artistId);
      }

      const { data, error } = await query;

      if (error) {
        logger.error('Error fetching notes:', error);
        toast.error('Erreur lors du chargement des notes');
        return;
      }

      setNotes((data || []) as ShowBibleNote[]);
    } catch (error: unknown) {
      logger.error('Error fetching notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const createNote = async (noteData: CreateNoteData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer une note');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('show_bible_notes')
        .insert([{
          user_id: user.id,
          ...noteData,
          content_type: noteData.content_type || 'markdown',
          mentioned_users: noteData.mentioned_users || [],
          tags: noteData.tags || [],
          is_pinned: noteData.is_pinned || false
        }])
        .select()
        .single();

      if (error) {
        logger.error('Error creating note:', error);
        toast.error('Erreur lors de la création de la note');
        return null;
      }

      setNotes(prev => [data as ShowBibleNote, ...prev]);
      toast.success('Note créée avec succès');
      return data;
    } catch (error: unknown) {
      logger.error('Error creating note:', error);
      toast.error('Erreur lors de la création de la note');
      return null;
    }
  };

  const updateNote = async (noteId: string, updates: Partial<CreateNoteData>) => {
    if (!user) {
      toast.error('Vous devez être connecté pour modifier une note');
      return false;
    }

    try {
      const { error } = await supabase
        .from('show_bible_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error updating note:', error);
        toast.error('Erreur lors de la mise à jour de la note');
        return false;
      }

      setNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates } as ShowBibleNote : note
      ));
      toast.success('Note mise à jour');
      return true;
    } catch (error: unknown) {
      logger.error('Error updating note:', error);
      toast.error('Erreur lors de la mise à jour de la note');
      return false;
    }
  };

  const deleteNote = async (noteId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer une note');
      return false;
    }

    try {
      const { error } = await supabase
        .from('show_bible_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error deleting note:', error);
        toast.error('Erreur lors de la suppression de la note');
        return false;
      }

      setNotes(prev => prev.filter(note => note.id !== noteId));
      toast.success('Note supprimée');
      return true;
    } catch (error: unknown) {
      logger.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression de la note');
      return false;
    }
  };

  const togglePin = async (noteId: string, isPinned: boolean) => {
    return updateNote(noteId, { is_pinned: !isPinned });
  };

  useEffect(() => {
    fetchNotes();
  }, [user, artistId]);

  return {
    notes,
    loading,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    refetch: fetchNotes
  };
};