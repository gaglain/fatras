
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface MenuItem {
  id: string;
  label: string;
  url: string;
  parent_id?: string;
  menu_order: number;
  is_visible: boolean;
  target: string;
}

export const useWebsiteMenuSync = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('website_menu')
        .select('*')
        .eq('is_visible', true)
        .order('menu_order');

      if (error) throw error;
      
      setMenuItems(data || []);
      
      // Déclencher l'événement pour le frontend
      const event = new CustomEvent('websiteMenuUpdated', { detail: data || [] });
      window.dispatchEvent(event);
      
    } catch (error) {
      console.error('Erreur lors du chargement du menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveMenuItem = async (item: Omit<MenuItem, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('website_menu')
        .insert([{ ...item, user_id: (await supabase.auth.getUser()).data.user?.id }])
        .select()
        .single();

      if (error) throw error;
      
      await loadMenu();
      return data;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du menu:', error);
      throw error;
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    try {
      const { error } = await supabase
        .from('website_menu')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await loadMenu();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu:', error);
      throw error;
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('website_menu')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await loadMenu();
    } catch (error) {
      console.error('Erreur lors de la suppression du menu:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadMenu();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('website_menu_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'website_menu' }, 
        () => {
          loadMenu();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    menuItems,
    loading,
    saveMenuItem,
    updateMenuItem,
    deleteMenuItem,
    refreshMenu: loadMenu
  };
};
