
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
type WebsitePage = Tables<'website_pages'>;

export const useWebsitePagesSync = () => {
  const { user } = useAuth();
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);
  const isInitialized = useRef(false);
  const userIdRef = useRef<string | null>(null);

  const loadPages = useCallback(async (): Promise<WebsitePage[]> => {
    if (syncInProgress.current) return pages;
    if (!user?.id) {
      logger.log('📄 No user logged in, skipping page load');
      setLoading(false);
      return [];
    }
    
    syncInProgress.current = true;
    setLoading(true);
    
    try {
      logger.log('📄 Loading pages from Supabase for user:', user.id);
      
      const { data: pagesData, error } = await supabase
        .from('website_pages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('❌ Error loading pages:', error);
        // Fallback to localStorage
        const savedPages = localStorage.getItem('websitePages');
        if (savedPages) {
          const localPages = JSON.parse(savedPages);
          logger.log('📄 Using cached pages:', localPages.length);
          setPages(localPages);
          return localPages;
        }
        setPages([]);
        return [];
      }

      if (pagesData) {
        logger.log('✅ Pages loaded from Supabase:', pagesData.length);
        localStorage.setItem('websitePages', JSON.stringify(pagesData));
        setPages(pagesData);
        
        // Check if homepage exists
        const hasHomepage = pagesData.some(p => 
          p.slug === '/' || p.slug === '' || p.slug === 'home' || p.slug === 'accueil'
        );
        
        // Create homepage if it doesn't exist and user is logged in
        if (!hasHomepage && user?.id) {
          logger.log('📄 No homepage found, creating default...');
          
          const defaultHomepage = {
            user_id: user.id,
            title: 'Accueil',
            slug: '/',
            status: 'published' as const,
            content: [
              {
                id: 'hero-1',
                type: 'hero',
                order: 0,
                content: {
                  title: 'Bienvenue sur notre site',
                  subtitle: 'Découvrez notre univers musical',
                  backgroundImage: '',
                  buttonText: 'En savoir plus',
                  buttonLink: '/front/artists'
                }
              },
              {
                id: 'events-1',
                type: 'events',
                order: 1,
                content: { title: 'Nos Spectacles à Venir', showAll: false }
              },
              {
                id: 'artists-1',
                type: 'artists',
                order: 2,
                content: { title: 'Nos Spectacles', showAll: false }
              }
            ],
            meta_description: 'Page d\'accueil',
            page_type: 'home'
          };
          
          const { data: newPage, error: insertError } = await supabase
            .from('website_pages')
            .insert([defaultHomepage])
            .select()
            .single();
          
          if (!insertError && newPage) {
            logger.log('✅ Default homepage created');
            const updatedPages = [newPage, ...pagesData];
            localStorage.setItem('websitePages', JSON.stringify(updatedPages));
            setPages(updatedPages);
            return updatedPages;
          }
        }
        
        return pagesData;
      }
      
      return [];
    } catch (error) {
      logger.error('❌ Error loading pages:', error);
      return [];
    } finally {
      syncInProgress.current = false;
      setLoading(false);
    }
  }, [pages, user?.id]);

  const savePage = useCallback(async (pageData: Partial<WebsitePage>) => {
    if (!user?.id) {
      logger.error('❌ No user logged in');
      throw new Error('Vous devez être connecté pour créer une page');
    }
    
    try {
      logger.log('💾 Saving new page:', pageData.title, 'for user:', user.id);
      
      const { data, error } = await supabase
        .from('website_pages')
        .insert([{
          user_id: user.id,
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
        logger.error('❌ Error saving page:', error);
        throw error;
      }

      if (data) {
        logger.log('✅ Page saved:', data.title);
        // Update local state immediately
        setPages(prev => [data, ...prev]);
        // Update localStorage
        const updatedPages = [data, ...pages];
        localStorage.setItem('websitePages', JSON.stringify(updatedPages));
      }
    } catch (error) {
      logger.error('❌ Error saving page:', error);
      throw error;
    }
  }, [pages, user]);

  const updatePage = useCallback(async (id: string, pageData: Partial<WebsitePage>) => {
    try {
      logger.log('🔄 Updating page:', id);
      
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
        logger.error('❌ Error updating page:', error);
        throw error;
      }

      if (data) {
        logger.log('✅ Page updated:', data.title);
        // Update local state immediately
        setPages(prev => prev.map(p => p.id === id ? data : p));
        // Update localStorage
        const updatedPages = pages.map(p => p.id === id ? data : p);
        localStorage.setItem('websitePages', JSON.stringify(updatedPages));
      }
    } catch (error) {
      logger.error('❌ Error updating page:', error);
      throw error;
    }
  }, [pages]);

  const deletePage = useCallback(async (id: string) => {
    try {
      logger.log('🗑️ Deleting page:', id);
      
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('❌ Error deleting page:', error);
        throw error;
      }

      logger.log('✅ Page deleted');
      // Update local state immediately
      setPages(prev => prev.filter(p => p.id !== id));
      // Update localStorage
      const updatedPages = pages.filter(p => p.id !== id);
      localStorage.setItem('websitePages', JSON.stringify(updatedPages));
    } catch (error) {
      logger.error('❌ Error deleting page:', error);
      throw error;
    }
  }, [pages]);

  const refreshPages = useCallback(async () => {
    const now = Date.now();
    
    // Throttle requests (max once per 2 seconds)
    if (now - lastSyncTime.current < 2000) {
      return pages;
    }
    
    lastSyncTime.current = now;
    return await loadPages();
  }, [loadPages]);

  // Initialize once per user
  useEffect(() => {
    if (!isInitialized.current || (user?.id && userIdRef.current !== user.id)) {
      isInitialized.current = true;
      userIdRef.current = user?.id || null;
      loadPages();
    }
  }, [user?.id, loadPages]);

  return { 
    pages,
    loading,
    loadPages, 
    refreshPages, 
    savePage,
    updatePage,
    deletePage
  };
};
