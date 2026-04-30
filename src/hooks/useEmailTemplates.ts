import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface EmailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  content: string;
  category: string;
  variables: string[];
  attachments?: Array<{ name: string; url: string; size: number }>;
  artist_id?: string | null;
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
    } catch (error: unknown) {
      logger.error('Error fetching templates:', error);
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
          artist_id: template.artist_id ?? null,
          user_id: user.id
        } as any])
        .select()
        .single();

      if (error) throw error;
      toast.success('Modèle créé avec succès');
      fetchTemplates();
      return data;
    } catch (error: unknown) {
      logger.error('Error creating template:', error);
      toast.error('Erreur lors de la création du modèle');
      return null;
    }
  };

  const duplicateTemplate = async (id: string) => {
    try {
      const original = templates.find(t => t.id === id);
      if (!original) throw new Error('Template introuvable');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      const { error } = await supabase.from('email_templates').insert([{
        name: `${original.name} (copie)`,
        subject: original.subject,
        content: original.content,
        category: original.category,
        variables: original.variables,
        attachments: original.attachments || [],
        artist_id: original.artist_id ?? null,
        user_id: user.id,
      } as any]);
      if (error) throw error;
      toast.success('Modèle dupliqué');
      fetchTemplates();
    } catch (error: unknown) {
      logger.error('Error duplicating template:', error);
      toast.error('Erreur lors de la duplication');
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
    } catch (error: unknown) {
      logger.error('Error updating template:', error);
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
    } catch (error: unknown) {
      logger.error('Error deleting template:', error);
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
    duplicateTemplate,
    refreshTemplates: fetchTemplates
  };
};
