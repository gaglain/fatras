
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WebsitePage = Tables<'website_pages'>;

export const useWebsitePagesSync = () => {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPages = async () => {
    try {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      setPages(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async (page: Omit<WebsitePage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('website_pages')
        .insert([{ ...page, user_id: user.user?.id || null }])
        .select()
        .single();

      if (error) throw error;
      
      await loadPages();
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la page:', error);
      throw error;
    }
  };

  const updatePage = async (id: string, updates: Partial<WebsitePage>) => {
    try {
      const { error } = await supabase
        .from('website_pages')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await loadPages();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la page:', error);
      throw error;
    }
  };

  const deletePage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadPages();
    } catch (error) {
      console.error('Erreur lors de la suppression de la page:', error);
      throw error;
    }
  };

  const getPageBySlug = async (slug: string) => {
    try {
      const { data, error } = await supabase
        .from('website_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement de la page:', error);
      return null;
    }
  };

  useEffect(() => {
    loadPages();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('website_pages_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'website_pages' }, 
        () => {
          loadPages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    pages,
    loading,
    savePage,
    updatePage,
    deletePage,
    getPageBySlug,
    refreshPages: loadPages
  };
};
