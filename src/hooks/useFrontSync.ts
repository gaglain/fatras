
import { useEffect, useCallback } from 'react';

export const useFrontSync = () => {
  // Helper de parse sécurisé avec auto-réparation
  const safeParse = (key: string, fallback: any = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      console.error(`❌ useFrontSync - Parse error for ${key}, auto-clearing:`, err);
      localStorage.removeItem(key);
      return fallback;
    }
  };

  const syncAll = useCallback(() => {
    console.log('🔄 Front sync - Loading all data');
    
    // Synchroniser les paramètres avec parse sécurisé
    const settings = safeParse('websiteSettings');
    if (settings) {
      console.log('⚙️ Front sync - Settings loaded:', settings.siteName);
      
      if (settings.siteName && document.title !== settings.siteName) {
        document.title = settings.siteName;
      }
      
      window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settings }));
    }
    
    // Synchroniser le design avec parse sécurisé
    const design = safeParse('websiteDesign');
    if (design) {
      console.log('🎨 Front sync - Design loaded:', design.siteName);
      window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: design }));
    }
    
    // Synchroniser le menu avec parse sécurisé
    const parsed = safeParse('websiteMenu') || safeParse('website_menu', []);
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as any)?.data)
        ? (parsed as any).data
        : Array.isArray((parsed as any)?.menu)
          ? (parsed as any).menu
          : [];

    console.log('🔗 Front sync - Menu loaded:', arr.length, 'items');
    window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: arr }));
  }, []);

  useEffect(() => {
    console.log('🚀 Front sync initialized');
    
    // Sync initial immédiat
    syncAll();
    
    // Écouter les événements de sauvegarde
    const handleUpdate = () => {
      console.log('🔔 Front sync - Update detected');
      setTimeout(syncAll, 100);
    };
    
    const handleStorageChange = (e: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign', 'websiteMenu'].includes(e.key || '')) {
        console.log('💾 Front sync - Storage change:', e.key);
        setTimeout(syncAll, 100);
      }
    };
    
    // Événements spécifiques
    window.addEventListener('websiteSettingsSaved', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('websiteMenuSaved', handleUpdate);
    window.addEventListener('storage', handleStorageChange);
    
    // Pas de sync périodique pour éviter le scintillement
    
    return () => {
      window.removeEventListener('websiteSettingsSaved', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteMenuSaved', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [syncAll]);
  
  return { forceSync: syncAll };
};
