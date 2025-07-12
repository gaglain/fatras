
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useWebsiteMenuSync = () => {
  const syncInProgress = useRef(false);

  const loadMenu = useCallback(async () => {
    if (syncInProgress.current) return [];
    
    syncInProgress.current = true;
    
    try {
      console.log('🔗 Loading menu from Supabase...');
      
      const { data: menuItems, error } = await supabase
        .from('website_menu')
        .select('*')
        .order('menu_order', { ascending: true });

      if (error) {
        console.error('Erreur lors du chargement du menu:', error);
        
        // Fallback vers localStorage
        const savedMenu = localStorage.getItem('websiteMenu');
        if (savedMenu) {
          return JSON.parse(savedMenu);
        }
        return [];
      }

      if (menuItems && menuItems.length > 0) {
        console.log('✅ Menu loaded from Supabase:', menuItems.length);
        localStorage.setItem('websiteMenu', JSON.stringify(menuItems));
        return menuItems;
      } else {
        // Menu par défaut si aucun menu en base
        const defaultMenu = [
          {
            id: '1',
            label: 'Accueil',
            url: '/',
            menu_order: 0,
            is_visible: true,
            target: '_self'
          },
          {
            id: '2', 
            label: 'Artistes',
            url: '/artists',
            menu_order: 1,
            is_visible: true,
            target: '_self'
          },
          {
            id: '3',
            label: 'Événements', 
            url: '/events',
            menu_order: 2,
            is_visible: true,
            target: '_self'
          },
          {
            id: '4',
            label: 'Contact',
            url: '/contact',
            menu_order: 3,
            is_visible: true,
            target: '_self'
          }
        ];
        
        localStorage.setItem('websiteMenu', JSON.stringify(defaultMenu));
        console.log('🔗 Menu par défaut créé');
        return defaultMenu;
      }
    } catch (error) {
      console.error('Erreur lors du chargement du menu:', error);
      
      // Fallback vers localStorage
      const savedMenu = localStorage.getItem('websiteMenu');
      if (savedMenu) {
        return JSON.parse(savedMenu);
      }
      return [];
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  const refreshMenu = useCallback(async () => {
    return await loadMenu();
  }, [loadMenu]);

  const syncMenu = useCallback(async (menuItems: any[]) => {
    if (syncInProgress.current) return;
    
    try {
      console.log('💾 Synchronisation du menu vers Supabase...');
      
      // Supprimer l'ancien menu
      await supabase.from('website_menu').delete().neq('id', '');
      
      // Insérer le nouveau menu
      for (const item of menuItems) {
        const { error } = await supabase
          .from('website_menu')
          .insert({
            id: item.id,
            label: item.label,
            url: item.url,
            menu_order: item.menu_order || item.order,
            is_visible: item.is_visible !== false,
            target: item.target || '_self'
          });

        if (error) {
          console.error('❌ Erreur lors de la sauvegarde du menu:', item.label, error);
        }
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
    loadMenu, 
    refreshMenu, 
    syncMenu 
  };
};
