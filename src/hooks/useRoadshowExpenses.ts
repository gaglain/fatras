import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface RoadshowExpense {
  id: string;
  roadshow_stop_id: string;
  user_id: string;
  title: string;
  description?: string;
  amount?: number;
  tax_rate?: number;
  file_url: string;
  file_type: 'image' | 'pdf';
  created_at: string;
  updated_at: string;
}

export const useRoadshowExpenses = (roadshowStopId?: string) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<RoadshowExpense[]>([]);

  const fetchExpenses = async () => {
    if (!user || !roadshowStopId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadshow_expenses')
        .select('*')
        .eq('roadshow_stop_id', roadshowStopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setExpenses((data || []) as RoadshowExpense[]);
    } catch (error: unknown) {
      logger.error('Error fetching expenses:', error);
      toast.error('Erreur lors du chargement des notes de frais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [roadshowStopId, user?.id]);

  const uploadExpenseFile = async (file: File, roadshowStopId: string) => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${roadshowStopId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('roadshow-expenses')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('roadshow-expenses')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: unknown) {
      logger.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      return null;
    }
  };

  // Add expense to media bank (background_images table with category)
  const addToMediaBank = async (
    fileUrl: string,
    fileName: string,
    fileSize: number,
    roadshowStopId: string
  ) => {
    if (!user) return;

    try {
      await supabase
        .from('background_images')
        .insert({
          user_id: user.id,
          name: fileName,
          url: fileUrl,
          file_size: fileSize,
          category: 'notes_de_frais',
          source_type: 'roadshow_expense',
          source_id: roadshowStopId,
          tags: ['note de frais', 'roadshow']
        });
    } catch (error: unknown) {
      logger.warn('Error adding to media bank:', error);
      // Non-blocking error - don't show toast
    }
  };

  const createExpense = async (
    roadshowStopId: string,
    title: string,
    file: File,
    description?: string,
    amount?: number
  ) => {
    if (!user) return false;

    setLoading(true);
    try {
      const fileUrl = await uploadExpenseFile(file, roadshowStopId);
      if (!fileUrl) return false;

      const fileType = file.type.startsWith('image/') ? 'image' : 'pdf';

      const { error } = await supabase
        .from('roadshow_expenses')
        .insert({
          roadshow_stop_id: roadshowStopId,
          user_id: user.id,
          title,
          description,
          amount,
          file_url: fileUrl,
          file_type: fileType
        });

      if (error) throw error;

      // Also add to media bank
      await addToMediaBank(fileUrl, `${title} - ${file.name}`, file.size, roadshowStopId);

      toast.success('Note de frais créée avec succès');
      return true;
    } catch (error: unknown) {
      logger.error('Error creating expense:', error);
      toast.error('Erreur lors de la création de la note de frais');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Extract storage path from a stored file_url (which may be a legacy public URL or a path)
  const getFilePath = (fileUrl: string): string | null => {
    if (!fileUrl) return null;
    if (fileUrl.includes('/roadshow-expenses/')) {
      return fileUrl.split('/roadshow-expenses/')[1] || null;
    }
    return fileUrl; // already a path
  };

  // Generate a fresh signed URL for a private bucket file (1 hour expiry)
  const getFileSignedUrl = async (fileUrl: string): Promise<string | null> => {
    const path = getFilePath(fileUrl);
    if (!path) return null;
    try {
      const { data, error } = await supabase.storage
        .from('roadshow-expenses')
        .createSignedUrl(path, 3600);
      if (error) throw error;
      return data?.signedUrl || null;
    } catch (error) {
      logger.error('Error creating signed URL:', error);
      return null;
    }
  };

  const deleteExpense = async (expenseId: string, fileUrl: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Extract file path from URL (supports legacy public URLs and raw paths)
      const filePath = getFilePath(fileUrl);
      
      // Delete file from storage
      if (filePath) {
        await supabase.storage
          .from('roadshow-expenses')
          .remove([filePath]);
      }

      // Delete database record
      const { error } = await supabase
        .from('roadshow_expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      // Also remove from media bank
      await supabase
        .from('background_images')
        .delete()
        .eq('url', fileUrl);

      toast.success('Note de frais supprimée');
      return true;
    } catch (error: unknown) {
      logger.error('Error deleting expense:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    expenses,
    loading,
    fetchExpenses,
    createExpense,
    deleteExpense,
    getFileSignedUrl
  };
};
