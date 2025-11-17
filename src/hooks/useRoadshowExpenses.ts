import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface RoadshowExpense {
  id: string;
  roadshow_stop_id: string;
  user_id: string;
  title: string;
  description?: string;
  amount?: number;
  file_url: string;
  file_type: 'image' | 'pdf';
  created_at: string;
  updated_at: string;
}

export const useRoadshowExpenses = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const getExpenses = async (roadshowStopId: string): Promise<RoadshowExpense[]> => {
    if (!user) return [];

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadshow_expenses')
        .select('*')
        .eq('roadshow_stop_id', roadshowStopId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as RoadshowExpense[];
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast.error('Erreur lors du chargement des notes de frais');
      return [];
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erreur lors du téléchargement du fichier');
      return null;
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
      toast.success('Note de frais créée avec succès');
      return true;
    } catch (error) {
      console.error('Error creating expense:', error);
      toast.error('Erreur lors de la création de la note de frais');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteExpense = async (expenseId: string, fileUrl: string) => {
    if (!user) return false;

    setLoading(true);
    try {
      // Extract file path from URL
      const filePath = fileUrl.split('/roadshow-expenses/')[1];
      
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
      toast.success('Note de frais supprimée');
      return true;
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Erreur lors de la suppression');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    getExpenses,
    createExpense,
    deleteExpense
  };
};
