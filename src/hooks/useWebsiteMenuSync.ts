
import { useEffect, useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type WebsiteMenuItem = Tables<'website_menu'>;

export const useWebsiteMenuSync = () => {
  const [menu, setMenu] = useState<WebsiteMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);

  const loadMenu = useCallback(async () => {
    if (syncInProgress.current) return menu;
    
    syncInProgress.current = true;
    setLoading(true);
    
    try {
      console.log('🔗 Loading menu from Supabase...');
      
      const { data: menuData, error } = await supabase
        .from('website_menu')
        .select('*')
        .order('menu_order', { ascending: true });

      if (error) {
        console.error('❌ Erreur lors du chargement du menu:', error);
        
        // Fallback vers localStorage
        const savedMenu = localStorage.getItem('websiteMenu');
        if (savedMenu) {
          const localMenu = JSON.parse(savedMenu);
          console.log('🔗 Utilisation du menu en cache:', localMenu.length);
          setMenu(localMenu);
          return localMenu;
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
        console.log('🔗 Menu par défaut créé');
        return defaultMenu;
      }

      if (menuData && menuData.length > 0) {
        console.log('✅ Menu loaded from Supabase:', menuData.length);
        localStorage.setItem('websiteMenu', JSON.stringify(menuData));
        setMenu(menuData);
        
        // Déclencher l'événement de mise à jour
        const event = new CustomEvent('websiteMenuUpdated', { detail: menuData });
        window.dispatchEvent(event);
        
        return menuData;
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
        console.log('🔗 Menu par défaut créé');
        return defaultMenu;
      }
    } catch (error) {
      console.error('❌ Erreur lors du chargement du menu:', error);
      
      // Fallback complet vers localStorage
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        const localMenu = JSON.parse(savedMenu);
        setMenu(localMenu);
        return localMenu;
      }
      
      setMenu([]);
      return [];
    } finally {
      syncInProgress.current = false;
      setLoading(false);
    }
  }, [menu]);

  const refreshMenu = useCallback(async () => {
    const now = Date.now();
    
    // Throttle les appels
    if (now - lastSyncTime.current < 1000) {
      return menu;
    }
    
    lastSyncTime.current = now;
    return await loadMenu();
  }, [loadMenu, menu]);

  const saveMenuItem = useCallback(async (menuItem: Partial<WebsiteMenuItem>) => {
    try {
      console.log('💾 Saving menu item:', menuItem.label);
      
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
        console.error('❌ Erreur lors de la sauvegarde:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Menu item sauvegardé:', data.label);
        await loadMenu();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const updateMenuItem = useCallback(async (id: string, menuItem: Partial<WebsiteMenuItem>) => {
    try {
      console.log('🔄 Updating menu item:', id);
      
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
        console.error('❌ Erreur lors de la mise à jour:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Menu item mis à jour:', data.label);
        await loadMenu();
      }
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const deleteMenuItem = useCallback(async (id: string) => {
    try {
      console.log('🗑️ Deleting menu item:', id);
      
      const { error } = await supabase
        .from('website_menu')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Erreur lors de la suppression:', error);
        throw error;
      }

      console.log('✅ Menu item supprimé');
      await loadMenu();
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du menu:', error);
      throw error;
    }
  }, [loadMenu]);

  const syncMenu = useCallback(async (menuItems: any[]) => {
    if (syncInProgress.current) return;
    
    try {
      console.log('💾 Synchronisation du menu vers Supabase...');

      // Récupérer l'utilisateur pour peupler user_id si nécessaire
      const { data: authData } = await supabase.auth.getUser();
      const currentUserId = authData?.user?.id || null;

      const clean = (s: any) => {
        if (typeof s !== 'string') return s;
        if (s.startsWith('/http://') || s.startsWith('/https://') || s.startsWith('///')) {
          return s.slice(1);
        }
        return s;
      };

      const isUUID = (v: any) => typeof v === 'string' && /^[0-9a-fA-F-]{36}$/.test(v);

      for (const item of menuItems) {
        const rawPath = item.path || item.url || '/';
        const rawUrl = item.url || item.path || '/';
        const path = clean(rawPath);
        const url = clean(rawUrl);
        const isExternal = (path?.startsWith('http') || path?.startsWith('//') || url?.startsWith('http') || url?.startsWith('//'));

        const payload: any = {
          label: item.label,
          url,
          target: item.target || (isExternal ? '_blank' : '_self'),
          parent_id: item.parent_id || null,
          menu_order: item.menu_order ?? item.order ?? 0,
          is_visible: item.is_visible ?? item.visible ?? true,
          updated_at: new Date().toISOString(),
        };
        if (currentUserId) payload.user_id = currentUserId;
        if (isUUID(item.id)) payload.id = item.id; // Ne pas envoyer d'id invalide

        const { error } = await supabase
          .from('website_menu')
          .upsert(payload);

        if (error) {
          console.error('❌ Erreur lors de la sauvegarde du menu:', item.label, error);
        }
      }
      
      // Recharger depuis Supabase pour obtenir les IDs/ordre à jour
      const { data: fresh, error: fetchError } = await supabase
        .from('website_menu')
        .select('*')
        .order('menu_order', { ascending: true });

      if (fetchError) {
        console.error('❌ Erreur de relecture du menu:', fetchError);
      } else if (fresh) {
        localStorage.setItem('websiteMenu', JSON.stringify(fresh));
        window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: fresh }));
      }
      
      console.log('✅ Menu synchronisé avec Supabase');
    } catch (error) {
      console.error('❌ Erreur lors de la synchronisation du menu:', error);
    }
  }, []);

  useEffect(() => {
    // Chargement initial
    loadMenu();

    // Écouter les mises à jour du menu
    const handleMenuUpdate = async (event: CustomEvent) => {
      if (event.detail && Array.isArray(event.detail)) {
        await syncMenu(event.detail);
      }
    };

    window.addEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);

    return () => {
      window.removeEventListener('websiteMenuUpdated', handleMenuUpdate as EventListener);
    };
  }, [loadMenu, syncMenu]);

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
