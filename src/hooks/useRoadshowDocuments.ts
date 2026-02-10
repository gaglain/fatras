import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface RoadshowDocument {
  id: string;
  roadshow_stop_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  category: string;
  description: string | null;
  created_at: string;
}

export const useRoadshowDocuments = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getDocuments = async (stopId: string): Promise<RoadshowDocument[]> => {
    const { data, error } = await supabase
      .from('roadshow_documents')
      .select('*')
      .eq('roadshow_stop_id', stopId)
      .order('created_at', { ascending: false });

    if (error) return [];
    return data || [];
  };

  const uploadDocument = async (
    stopId: string,
    file: File,
    category: string = 'other',
    description?: string
  ): Promise<boolean> => {
    if (!user) return false;
    setLoading(true);

    try {
      const filePath = `${stopId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('roadshow-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from('roadshow_documents')
        .insert({
          roadshow_stop_id: stopId,
          user_id: user.id,
          file_name: file.name,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
          category,
          description
        });

      if (dbError) throw dbError;
      toast.success('Document ajouté');
      return true;
    } catch {
      toast.error('Erreur lors de l\'upload');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (docId: string, filePath: string): Promise<boolean> => {
    try {
      await supabase.storage.from('roadshow-documents').remove([filePath]);
      const { error } = await supabase.from('roadshow_documents').delete().eq('id', docId);
      if (error) throw error;
      toast.success('Document supprimé');
      return true;
    } catch {
      toast.error('Erreur lors de la suppression');
      return false;
    }
  };

  const getDocumentUrl = (filePath: string): string => {
    const { data } = supabase.storage.from('roadshow-documents').getPublicUrl(filePath);
    return data.publicUrl;
  };

  return { getDocuments, uploadDocument, deleteDocument, getDocumentUrl, loading };
};
