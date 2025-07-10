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
      
      // Synchroniser avec localStorage pour le front-end
      if (data) {
        const pagesForLocalStorage = data.map(page => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
          status: page.status,
          blocks: Array.isArray(page.content) ? page.content : [],
          metaDescription: page.meta_description || ''
        }));
        
        localStorage.setItem('websitePages', JSON.stringify(pagesForLocalStorage));
        
        // Déclencher l'événement pour le menu
        const event = new CustomEvent('websitePagesUpdated', { detail: pagesForLocalStorage });
        window.dispatchEvent(event);
      }
      
      console.log('✅ Pages loaded and synced:', data?.length || 0);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePage = async (pageData: {
    title: string;
    slug: string;
    content: any;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
    status: string;
    page_type: string;
  }) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await supabase
        .from('website_pages')
        .insert([{ 
          ...pageData,
          user_id: user.user.id,
          content: pageData.content || []
        }])
        .select()
        .single();

      if (error) throw error;
      
      await loadPages();
      console.log('✅ Page saved successfully:', data);
      return data;
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la page:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadPages();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('website_pages_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'website_pages' }, 
        (payload) => {
          console.log('🔄 Real-time update received:', payload);
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
    updatePage: async (id: string, updates: Partial<Omit<WebsitePage, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) => {
      try {
        const { error } = await supabase
          .from('website_pages')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
        
        await loadPages();
        console.log('✅ Page updated successfully');
      } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de la page:', error);
        throw error;
      }
    },
    deletePage: async (id: string) => {
      try {
        const { error } = await supabase
          .from('website_pages')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        await loadPages();
        console.log('✅ Page deleted successfully');
      } catch (error) {
        console.error('❌ Erreur lors de la suppression de la page:', error);
        throw error;
      }
    },
    getPageBySlug: async (slug: string) => {
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
        console.error('❌ Erreur lors du chargement de la page:', error);
        return null;
      }
    },
    refreshPages: loadPages
  };
};
