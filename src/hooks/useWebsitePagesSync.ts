
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WebsitePage = Tables<'website_pages'>;

export const useWebsitePagesSync = () => {
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);
  const isInitialized = useRef(false);

  const loadPages = useCallback(async (): Promise<WebsitePage[]> => {
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
        console.error('❌ Error loading pages:', error);
        // Fallback to localStorage
        const savedPages = localStorage.getItem('websitePages');
        if (savedPages) {
          const localPages = JSON.parse(savedPages);
          console.log('📄 Using cached pages:', localPages.length);
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
        return pagesData;
      } else {
        // Create default page if none exist
        const defaultPages: Partial<WebsitePage>[] = [{
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
          page_type: 'page'
        }];
        
        console.log('📄 No pages found, using defaults');
        return [];
      }
    } catch (error) {
      console.error('❌ Error loading pages:', error);
      return [];
    } finally {
      syncInProgress.current = false;
      setLoading(false);
    }
  }, []);

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
        console.error('❌ Error saving page:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Page saved:', data.title);
        // Update local state immediately
        setPages(prev => [data, ...prev]);
        // Update localStorage
        const updatedPages = [data, ...pages];
        localStorage.setItem('websitePages', JSON.stringify(updatedPages));
      }
    } catch (error) {
      console.error('❌ Error saving page:', error);
      throw error;
    }
  }, [pages]);

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
        console.error('❌ Error updating page:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Page updated:', data.title);
        // Update local state immediately
        setPages(prev => prev.map(p => p.id === id ? data : p));
        // Update localStorage
        const updatedPages = pages.map(p => p.id === id ? data : p);
        localStorage.setItem('websitePages', JSON.stringify(updatedPages));
      }
    } catch (error) {
      console.error('❌ Error updating page:', error);
      throw error;
    }
  }, [pages]);

  const deletePage = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting page:', id);
      
      const { error } = await supabase
        .from('website_pages')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting page:', error);
        throw error;
      }

      console.log('✅ Page deleted');
      // Update local state immediately
      setPages(prev => prev.filter(p => p.id !== id));
      // Update localStorage
      const updatedPages = pages.filter(p => p.id !== id);
      localStorage.setItem('websitePages', JSON.stringify(updatedPages));
    } catch (error) {
      console.error('❌ Error deleting page:', error);
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

  // Initialize once
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      loadPages();
    }
  }, []);

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
