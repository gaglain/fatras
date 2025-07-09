
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
        }
      } catch (error) {
        console.error('❌ Design sync error:', error);
      }
    };

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

    window.addEventListener('websiteDesignSaved', handleSave);
    window.addEventListener('websiteSettingsSaved', handleSave);

    return () => {
      window.removeEventListener('websiteDesignSaved', handleSave);
      window.removeEventListener('websiteSettingsSaved', handleSave);
    };
  }, []);

  return {
    forceSync: () => {
      console.log('🔄 Force sync requested');
    }
  };
};
