
import { useEffect, useCallback } from 'react';

export const useWebsiteSync = () => {
  const syncSettings = useCallback(() => {
    try {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('⚙️ Syncing settings:', settings.siteName);
        
        if (settings.siteName && document.title !== settings.siteName) {
          document.title = settings.siteName;
        }
        
        // Déclencher l'événement de synchronisation
        const event = new CustomEvent('websiteSettingsUpdated', { detail: settings });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('❌ Settings sync error:', error);
    }
  }, []);

  const syncDesign = useCallback(() => {
    try {
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('🎨 Syncing design:', design.siteName);
        
        if (design.siteName && document.title !== design.siteName) {
          document.title = design.siteName;
        }
        
        // Déclencher l'événement de synchronisation
        const event = new CustomEvent('websiteDesignUpdated', { detail: design });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error('❌ Design sync error:', error);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Website sync initialized');
    
    // Sync initial
    syncSettings();
    syncDesign();

    // Écouter les événements de sauvegarde
    const handleSave = () => {
      setTimeout(() => {
        syncSettings();
        syncDesign();
      }, 100);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'websiteSettings') {
        syncSettings();
      } else if (e.key === 'websiteDesign') {
        syncDesign();
      }
    };

    window.addEventListener('websiteDesignSaved', handleSave);
    window.addEventListener('websiteSettingsSaved', handleSave);
    window.addEventListener('storage', handleStorageChange);

    // Sync périodique moins fréquent
    const syncInterval = setInterval(() => {
      syncSettings();
      syncDesign();
    }, 60000); // Toutes les 60 secondes

    return () => {
      window.removeEventListener('websiteDesignSaved', handleSave);
      window.removeEventListener('websiteSettingsSaved', handleSave);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, [syncSettings, syncDesign]);

  return {
    forceSync: () => {
      console.log('🔄 Force sync requested');
      syncSettings();
      syncDesign();
    }
  };
};
