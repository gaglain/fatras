import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments?: Array<{ name: string; url: string; size: number }>;
  is_system?: boolean;
  created_at: string;
  updated_at: string;
}

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Convert Json type to string[] for variables
      const formattedData = (data || []).map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : [],
        attachments: Array.isArray(t.attachments) ? t.attachments as Array<{ name: string; url: string; size: number }> : []
      }));
      setTemplates(formattedData);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Erreur lors du chargement des modèles');
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (template: Omit<EmailTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'is_system'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('email_templates')
        .insert([{
          name: template.name,
          subject: template.subject,
          content: template.content,
          category: template.category,
          variables: template.variables,
          attachments: template.attachments || [],
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      toast.success('Modèle créé avec succès');
      fetchTemplates();
      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Erreur lors de la création du modèle');
      return null;
    }
  };

  const updateTemplate = async (id: string, updates: Partial<EmailTemplate>) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      toast.success('Modèle mis à jour avec succès');
      fetchTemplates();
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Erreur lors de la mise à jour du modèle');
    }
  };

  const deleteTemplate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Modèle supprimé avec succès');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erreur lors de la suppression du modèle');
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refreshTemplates: fetchTemplates
  };
};
