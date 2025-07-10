
import { useEffect } from 'react';

export const useWebsiteSync = () => {
  useEffect(() => {
    console.log('🔄 Website sync initialized');
    
    // Sync des paramètres
    const syncSettings = () => {
      try {
        const savedSettings = localStorage.getItem('websiteSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log('⚙️ Syncing settings:', settings.siteName);
          if (settings.siteName) {
            document.title = settings.siteName;
          }
          
          // Déclencher l'événement de synchronisation
          const event = new CustomEvent('websiteSettingsUpdated', { detail: settings });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('❌ Settings sync error:', error);
      }
    };

    // Sync du design
    const syncDesign = () => {
      try {
        const savedDesign = localStorage.getItem('websiteDesign');
        if (savedDesign) {
          const design = JSON.parse(savedDesign);
          console.log('🎨 Syncing design:', design.siteName);
          if (design.siteName) {
            document.title = design.siteName;
          }
          
          // Déclencher l'événement de synchronisation
          const event = new CustomEvent('websiteDesignUpdated', { detail: design });
          window.dispatchEvent(event);
        }
      } catch (error) {
        console.error('❌ Design sync error:', error);
      }
    };

    // Sync des pages depuis Supabase
    const syncPages = async () => {
      try {
        console.log('📄 Syncing pages from Supabase...');
        // Cette fonction sera appelée automatiquement par le hook useWebsitePagesSync
      } catch (error) {
        console.error('❌ Pages sync error:', error);
      }
    };

    // Sync initial
    syncSettings();
    syncDesign();
    syncPages();

    // Écouter les événements de sauvegarde
    const handleSave = () => {
      setTimeout(() => {
        syncSettings();
        syncDesign();
      }, 100);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'websiteSettings' || e.key === 'websiteDesign') {
        handleSave();
      }
    };

    window.addEventListener('websiteDesignSaved', handleSave);
    window.addEventListener('websiteSettingsSaved', handleSave);
    window.addEventListener('storage', handleStorageChange);

    // Sync périodique pour maintenir la cohérence
    const syncInterval = setInterval(() => {
      syncSettings();
      syncDesign();
    }, 30000); // Toutes les 30 secondes

    return () => {
      window.removeEventListener('websiteDesignSaved', handleSave);
      window.removeEventListener('websiteSettingsSaved', handleSave);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(syncInterval);
    };
  }, []);

  return {
    forceSync: () => {
      console.log('🔄 Force sync requested');
      // Déclencher une synchronisation forcée
      const settings = localStorage.getItem('websiteSettings');
      const design = localStorage.getItem('websiteDesign');
      
      if (settings) {
        const event = new CustomEvent('websiteSettingsUpdated', { detail: JSON.parse(settings) });
        window.dispatchEvent(event);
      }
      
      if (design) {
        const event = new CustomEvent('websiteDesignUpdated', { detail: JSON.parse(design) });
        window.dispatchEvent(event);
      }
    }
  };
};
