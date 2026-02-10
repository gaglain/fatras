import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface RoadshowNote {
  id: string;
  roadshow_stop_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useRoadshowNotes = (stopId?: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<RoadshowNote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    if (!stopId) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('roadshow_notes')
      .select('*')
      .eq('roadshow_stop_id', stopId)
      .order('created_at', { ascending: false });

    if (!error) setNotes(data || []);
    setLoading(false);
  };

  const addNote = async (content: string): Promise<boolean> => {
    if (!user || !stopId) return false;
    const { error } = await supabase
      .from('roadshow_notes')
      .insert({ roadshow_stop_id: stopId, user_id: user.id, content });

    if (error) {
      toast.error('Erreur lors de l\'ajout de la note');
      return false;
    }
    toast.success('Note ajoutée');
    await fetchNotes();
    return true;
  };

  const updateNote = async (noteId: string, content: string): Promise<boolean> => {
    const { error } = await supabase
      .from('roadshow_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', noteId);

    if (error) {
      toast.error('Erreur lors de la mise à jour');
      return false;
    }
    await fetchNotes();
    return true;
  };

  const deleteNote = async (noteId: string): Promise<boolean> => {
    const { error } = await supabase.from('roadshow_notes').delete().eq('id', noteId);
    if (error) {
      toast.error('Erreur lors de la suppression');
      return false;
    }
    toast.success('Note supprimée');
    await fetchNotes();
    return true;
  };

  useEffect(() => {
    if (stopId) fetchNotes();
  }, [stopId]);

  // Realtime subscription
  useEffect(() => {
    if (!stopId) return;
    const channel = supabase
      .channel(`roadshow-notes-${stopId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'roadshow_notes',
        filter: `roadshow_stop_id=eq.${stopId}`
      }, () => fetchNotes())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [stopId]);

  return { notes, loading, addNote, updateNote, deleteNote };
};
