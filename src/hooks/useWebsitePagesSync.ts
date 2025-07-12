
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWebsitePagesSync = () => {
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);

  const loadPages = useCallback(async () => {
    if (syncInProgress.current) return;
    
    syncInProgress.current = true;
    
    try {
      console.log('📄 Loading pages from Supabase...');
      
      const { data: pages, error } = await supabase
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
          return localPages;
        }
        return [];
      }

      if (pages && pages.length > 0) {
        console.log('✅ Pages loaded from Supabase:', pages.length);
        localStorage.setItem('websitePages', JSON.stringify(pages));
        
        // Déclencher l'événement de mise à jour
        const event = new CustomEvent('websitePagesUpdated', { detail: pages });
        window.dispatchEvent(event);
        
        return pages;
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
          meta_description: 'Page d\'accueil - Découvrez notre univers musical'
        }];
        
        localStorage.setItem('websitePages', JSON.stringify(defaultPages));
        console.log('📄 Pages par défaut créées');
        return defaultPages;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement des pages:', error);
      
      // Fallback vers localStorage
      const savedPages = localStorage.getItem('websitePages');
      if (savedPages) {
        return JSON.parse(savedPages);
      }
      return [];
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  const refreshPages = useCallback(async () => {
    const now = Date.now();
    
    // Throttle les appels (pas plus d'une fois par seconde)
    if (now - lastSyncTime.current < 1000) {
      return;
    }
    
    lastSyncTime.current = now;
    return await loadPages();
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
    loadPages, 
    refreshPages, 
    syncPages 
  };
};
