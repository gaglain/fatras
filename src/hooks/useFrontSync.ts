
import { useEffect, useCallback } from 'react';

export const useFrontSync = () => {
  const syncAll = useCallback(() => {
    console.log('🔄 Front sync - Loading all data');
    
    try {
      // Synchroniser les paramètres
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('⚙️ Front sync - Settings loaded:', settings.siteName);
        
        if (settings.siteName && document.title !== settings.siteName) {
          document.title = settings.siteName;
        }
        
        // Déclencher l'événement
        window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settings }));
      }
      
      // Synchroniser le design
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('🎨 Front sync - Design loaded:', design.siteName);
        
        // Déclencher l'événement
        window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: design }));
      }
      
      // Synchroniser le menu
      const savedMenu = localStorage.getItem('websiteMenu') || localStorage.getItem('website_menu');
      if (savedMenu) {
        try {
          const parsed = JSON.parse(savedMenu);
          const arr = Array.isArray(parsed)
            ? parsed
            : Array.isArray((parsed as any)?.data)
              ? (parsed as any).data
              : Array.isArray((parsed as any)?.menu)
                ? (parsed as any).menu
                : [];

          console.log('🔗 Front sync - Menu loaded:', arr.length, 'items');
          // Déclencher l'événement avec un tableau garanti
          window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: arr }));
        } catch (e) {
          console.error('❌ Front sync - Failed to parse menu:', e);
          window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: [] }));
        }
      } else {
        // Aucun menu => envoyer un tableau vide pour éviter les erreurs
        window.dispatchEvent(new CustomEvent('websiteMenuUpdated', { detail: [] }));
      }
      
    } catch (error) {
      console.error('❌ Front sync error:', error);
    }
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
    
    // Sync périodique agressif pour l'aperçu
    const interval = setInterval(syncAll, 3000);
    
    return () => {
      window.removeEventListener('websiteSettingsSaved', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteMenuSaved', handleUpdate);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [syncAll]);
  
  return { forceSync: syncAll };
};
