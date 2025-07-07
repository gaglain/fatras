
import { useEffect } from 'react';

export const useWebsiteSync = () => {
  useEffect(() => {
    console.log('🔄 Website sync initialized (simplified)');
    
    // Sync simple une seule fois au chargement
    const syncOnce = () => {
      try {
        // Synchroniser les paramètres du site
        const savedSettings = localStorage.getItem('websiteSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.siteName) {
            document.title = settings.siteName;
          }
        }

        // Synchroniser le design
        const savedDesign = localStorage.getItem('websiteDesign');
        if (savedDesign) {
          const design = JSON.parse(savedDesign);
          if (design.siteName) {
            document.title = design.siteName;
          }
        }

        console.log('✅ Website sync completed');
      } catch (error) {
        console.error('❌ Website sync error:', error);
      }
    };

    // Sync une seule fois
    syncOnce();

    // Écouter uniquement les événements de sauvegarde
    const handleSave = () => {
      setTimeout(syncOnce, 100);
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
