
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WebsitePage = Tables<'website_pages'>;

export const useWebsitePagesSync = () => {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);

  const loadPages = useCallback(async () => {
    if (syncInProgress.current) return pages;
    
    syncInProgress.current = true;
    setLoading(true);
    
    try {
      console.log('📄 Loading pages from Supabase...');
      
      const { data: pagesData, error } = await supabase
        .from('website_pages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erreur lors du chargement des pages:', error);
        
        // Fallback vers localStorage en cas d'erreur Supabase
        const savedPages = localStorage.getItem('websitePages');
        if (savedPages) {
          const localPages = JSON.parse(savedPages);
          console.log('📄 Utilisation des pages en cache:', localPages.length);
          setPages(localPages);
          return localPages;
        }
        setPages([]);
        return [];
      }

      if (pagesData && pagesData.length > 0) {
        console.log('✅ Pages loaded from Supabase:', pagesData.length);
        localStorage.setItem('websitePages', JSON.stringify(pagesData));
        setPages(pagesData);
        
        // Déclencher l'événement de mise à jour
        const event = new CustomEvent('websitePagesUpdated', { detail: pagesData });
        window.dispatchEvent(event);
        
        return pagesData;
      } else {
        // Si pas de pages en base, utiliser les pages par défaut
        const defaultPages = [{
          id: '1',
          title: 'Accueil',
          slug: '/',
          status: 'published',
          content: [{
            id: 'hero-1',
            type: 'hero',
            order: 0,
            content: {
              title: 'Bienvenue sur notre site',
              subtitle: 'Découvrez notre univers musical',
              backgroundImage: '',
              buttonText: 'En savoir plus',
              buttonLink: '#'
            }
          }],
          meta_description: 'Page d\'accueil - Découvrez notre univers musical',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: null,
          meta_title: null,
          meta_keywords: null,
          page_type: 'page'
        }] as WebsitePage[];
        
        localStorage.setItem('websitePages', JSON.stringify(defaultPages));
        setPages(defaultPages);
        console.log('📄 Pages par défaut créées');
        return defaultPages;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pages:', error);
      
      // Fallback vers localStorage
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        const localPages = JSON.parse(savedPages);
        setPages(localPages);
        return localPages;
      }
      setPages([]);
      return [];
    } finally {
      syncInProgress.current = false;
      setLoading(false);
    }
  }, [pages]);

  const refreshPages = useCallback(async () => {
    const now = Date.now();
    
    // Throttle les appels (pas plus d'une fois par seconde)
    if (now - lastSyncTime.current < 1000) {
      return pages;
    }
    
    lastSyncTime.current = now;
    return await loadPages();
  }, [loadPages, pages]);

  const savePage = useCallback(async (pageData: Partial<WebsitePage>) => {
    try {
      console.log('💾 Saving new page:', pageData.title);
      
      const { data, error } = await supabase
        .from('website_pages')
        .insert([{
          title: pageData.title!,
          slug: pageData.slug!,
          content: pageData.content || [],
          status: pageData.status || 'draft',
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          meta_keywords: pageData.meta_keywords,
          page_type: pageData.page_type || 'page'
        }])
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la sauvegarde:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Page sauvegardée:', data.title);
        // Recharger les pages après sauvegarde
        await loadPages();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de la page:', error);
      throw error;
    }
  }, [loadPages]);

  const updatePage = useCallback(async (id: string, pageData: Partial<WebsitePage>) => {
    try {
      console.log('🔄 Updating page:', id);
      
      const { data, error } = await supabase
        .from('website_pages')
        .update({
          title: pageData.title,
          slug: pageData.slug,
          content: pageData.content,
          status: pageData.status,
          meta_title: pageData.meta_title,
          meta_description: pageData.meta_description,
          meta_keywords: pageData.meta_keywords,
          page_type: pageData.page_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Page mise à jour:', data.title);
        // Recharger les pages après mise à jour
        await loadPages();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour de la page:', error);
      throw error;
    }
  }, [loadPages]);

  const deletePage = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting page:', id);
      
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
      }

      console.log('✅ Page supprimée');
      // Recharger les pages après suppression
      await loadPages();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression de la page:', error);
      throw error;
    }
  }, [loadPages]);

  const syncPages = useCallback(async (pages: any[]) => {
    if (syncInProgress.current) return;
    
    try {
      console.log('💾 Synchronisation des pages vers Supabase...');
      
      // Sauvegarder chaque page
      for (const page of pages) {
        const { error } = await supabase
          .from('website_pages')
          .upsert({
            id: page.id,
            title: page.title,
            slug: page.slug,
            content: page.blocks || page.content,
            status: page.status,
            meta_description: page.metaDescription || page.meta_description,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('❌ Erreur lors de la sauvegarde de la page:', page.title, error);
        }
      }
      
      console.log('✅ Pages synchronisées avec Supabase');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation:', error);
    }
  }, []);

  useEffect(() => {
    // Chargement initial
    loadPages();

    // Écouter les mises à jour des pages
    const handlePagesUpdate = async (event: CustomEvent) => {
      if (event.detail && Array.isArray(event.detail)) {
        await syncPages(event.detail);
      }
    };

    window.addEventListener('websitePagesUpdated', handlePagesUpdate as EventListener);

    return () => {
      window.removeEventListener('websitePagesUpdated', handlePagesUpdate as EventListener);
    };
  }, [loadPages, syncPages]);

  return { 
    pages,
    loading,
    loadPages, 
    refreshPages, 
    syncPages,
    savePage,
    updatePage,
    deletePage
  };
};
