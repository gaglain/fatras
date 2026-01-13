
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { logger } from '@/lib/logger';

type WebsiteMenuItem = Tables<'website_menu'>;

export const useWebsiteMenuSync = () => {
  const [menu, setMenu] = useState<WebsiteMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);

  const loadMenu = useCallback(async () => {
    if (syncInProgress.current) return;
    
    syncInProgress.current = true;
    setLoading(true);
    
    try {
      logger.debug('Loading menu from Supabase...');
      
      const { data: menuData, error } = await supabase
        .from('website_menu')
        .select('*')
        .order('menu_order', { ascending: true });

      if (error) {
        logger.error('Erreur lors du chargement du menu:', error);
        
        // Fallback vers localStorage
        const savedMenu = localStorage.getItem('websiteMenu');
        if (savedMenu) {
          const localMenu = JSON.parse(savedMenu);
          logger.debug('Utilisation du menu en cache:', localMenu.length);
          setMenu(localMenu);
          return;
        }
        
        // Menu par défaut si aucune donnée
        const defaultMenu: WebsiteMenuItem[] = [
          {
            id: '1',
            user_id: null,
            label: 'Accueil',
            url: '/',
            target: '_self',
            parent_id: null,
            menu_order: 0,
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('websiteMenu', JSON.stringify(defaultMenu));
        setMenu(defaultMenu);
        logger.debug('Menu par défaut créé');
        return;
      }

      if (menuData && menuData.length > 0) {
        logger.info('Menu loaded from Supabase:', menuData.length);
        localStorage.setItem('websiteMenu', JSON.stringify(menuData));
        setMenu(menuData);
        return;
      } else {
        // Menu par défaut si pas de données
        const defaultMenu: WebsiteMenuItem[] = [
          {
            id: '1',
            user_id: null,
            label: 'Accueil',
            url: '/',
            target: '_self',
            parent_id: null,
            menu_order: 0,
            is_visible: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ];
        
        localStorage.setItem('websiteMenu', JSON.stringify(defaultMenu));
        setMenu(defaultMenu);
        logger.debug('Menu par défaut créé');
        return;
      }
    } catch (error: unknown) {
      logger.error('Erreur lors du chargement du menu:', error);
      
      // Fallback complet vers localStorage
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        const localMenu = JSON.parse(savedMenu);
        setMenu(localMenu);
        return;
      }
      
      setMenu([]);
    } finally {
      syncInProgress.current = false;
      setLoading(false);
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    const now = Date.now();
    
    // Throttle les appels
    if (now - lastSyncTime.current < 1000) {
      return;
    }
    
    lastSyncTime.current = now;
    await loadMenu();
  }, [loadMenu]);

  const saveMenuItem = useCallback(async (menuItem: Partial<WebsiteMenuItem>) => {
    try {
      logger.debug('Saving menu item:', menuItem.label);
      
      const { data, error } = await supabase
        .from('website_menu')
        .insert([{
          label: menuItem.label!,
          url: menuItem.url!,
          target: menuItem.target || '_self',
          parent_id: menuItem.parent_id,
          menu_order: menuItem.menu_order || 0,
          is_visible: menuItem.is_visible !== false
        }])
        .select()
        .single();

      if (error) {
        logger.error('Erreur lors de la sauvegarde:', error);
        throw error;
      }

      if (data) {
        logger.debug('Menu item sauvegardé:', data.label);
        await loadMenu();
      }
    } catch (error: unknown) {
      logger.error('Erreur lors de la sauvegarde du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const updateMenuItem = useCallback(async (id: string, menuItem: Partial<WebsiteMenuItem>) => {
    try {
      logger.debug('Updating menu item:', id);
      
      const { data, error } = await supabase
        .from('website_menu')
        .update({
          label: menuItem.label,
          url: menuItem.url,
          target: menuItem.target,
          parent_id: menuItem.parent_id,
          menu_order: menuItem.menu_order,
          is_visible: menuItem.is_visible,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Erreur lors de la mise à jour:', error);
        throw error;
      }

      if (data) {
        logger.debug('Menu item mis à jour:', data.label);
        await loadMenu();
      }
    } catch (error: unknown) {
      logger.error('Erreur lors de la mise à jour du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      logger.debug('Deleting menu item:', id);
      
      const { error } = await supabase
        .from('website_menu')
        .delete()
        .eq('id', id);

      if (error) {
        logger.error('Erreur lors de la suppression:', error);
        throw error;
      }

      logger.debug('Menu item supprimé');
      await loadMenu();
    } catch (error: unknown) {
      logger.error('Erreur lors de la suppression du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const syncMenu = useCallback(async (menuItems: { id?: string; label: string; path?: string; url?: string; target?: string; parent_id?: string | null; menu_order?: number; order?: number; is_visible?: boolean; visible?: boolean }[]) => {
    if (syncInProgress.current) return;
    
    try {
      logger.debug('Synchronisation du menu vers Supabase...');

      // Récupérer l'utilisateur pour peupler user_id si nécessaire
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      const clean = (s: unknown): string => {
        if (typeof s !== 'string') return String(s);
        if (s.startsWith('/http://') || s.startsWith('/https://') || s.startsWith('///')) {
          return s.slice(1);
        }
        return s;
      };

      const isUUID = (v: unknown) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);

      for (const item of menuItems) {
        const rawPath = item.path || item.url || '/';
        const rawUrl = item.url || item.path || '/';
        const path = clean(rawPath);
        const url = clean(rawUrl);
        const isExternal = (path?.startsWith('http') || path?.startsWith('//') || url?.startsWith('http') || url?.startsWith('//'));

        const payload = {
          label: item.label,
          url,
          target: item.target || (isExternal ? '_blank' : '_self'),
          parent_id: item.parent_id || null,
          menu_order: item.menu_order ?? item.order ?? 0,
          is_visible: item.is_visible ?? item.visible ?? true,
          updated_at: new Date().toISOString(),
          user_id: currentUserId,
          ...(isUUID(item.id) ? { id: item.id } : {})
        };

        const { error } = await supabase
          .from('website_menu')
          .upsert([payload]);

        if (error) {
          logger.error('Erreur lors de la sauvegarde du menu:', item.label, error);
        }
      }
      
      // Recharger depuis Supabase pour obtenir les IDs/ordre à jour
      const { data: fresh, error: fetchError } = await supabase
        .from('website_menu')
        .select('*')
        .order('menu_order', { ascending: true });

      if (fetchError) {
        logger.error('Erreur de relecture du menu:', fetchError);
      } else if (fresh) {
        localStorage.setItem('websiteMenu', JSON.stringify(fresh));
        window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: fresh }));
      }
      
      logger.debug('Menu synchronisé avec Supabase');
    } catch (error: unknown) {
      logger.error('Erreur lors de la synchronisation du menu:', error);
    }
  }, []);

  useEffect(() => {
    // Chargement initial une seule fois
    loadMenu();
  }, [loadMenu]);

  return { 
    menu,
    loading,
    loadMenu, 
    refreshMenu, 
    syncMenu,
    saveMenuItem,
    updateMenuItem,
    deleteMenuItem
  };
};
