import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface ShowBibleDocument {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  url: string;
  file_path: string;
  bucket_name: string;
  file_size_bytes: number;
  file_size_display: string;
  category: string;
  description: string | null;
  tags: string[];
  version: string;
  artists: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentData {
  name: string;
  type: 'audio' | 'video' | 'image' | 'text' | 'pdf' | 'other';
  url: string;
  file_path: string;
  bucket_name: string;
  file_size_bytes: number;
  file_size_display: string;
  category: string;
  description?: string;
  tags: string[];
  version: string;
  artists: string[];
}

export const useShowBible = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ShowBibleDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDocuments = async () => {
    if (!user) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('show_bible_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des documents:', error);
        toast.error('Erreur lors du chargement des documents');
        return;
      }

      setDocuments((data || []) as ShowBibleDocument[]);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      toast.error('Erreur lors du chargement des documents');
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (documentData: CreateDocumentData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des documents');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('show_bible_documents')
        .insert([{
          user_id: user.id,
          ...documentData
        }])
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du document:', error);
        toast.error('Erreur lors de la création du document');
        return null;
      }

      setDocuments(prev => [data as ShowBibleDocument, ...prev]);
      toast.success('Document ajouté à la bible du spectacle');
      return data;
    } catch (error) {
      console.error('Erreur lors de la création du document:', error);
      toast.error('Erreur lors de la création du document');
      return null;
    }
  };

  const deleteDocument = async (documentId: string, filePath: string, bucketName: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour supprimer des documents');
      return false;
    }

    try {
      // Supprimer le fichier du storage
      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (storageError) {
        console.error('Erreur lors de la suppression du fichier:', storageError);
        // On continue même si la suppression du fichier échoue
      }

      // Supprimer l'entrée de la base de données
      const { error: dbError } = await supabase
        .from('show_bible_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error('Erreur lors de la suppression du document:', dbError);
        toast.error('Erreur lors de la suppression du document');
        return false;
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      toast.success('Document supprimé');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      toast.error('Erreur lors de la suppression du document');
      return false;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  return {
    documents,
    loading,
    createDocument,
    deleteDocument,
    refetch: fetchDocuments
  };
};