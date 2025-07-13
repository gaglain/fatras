
import { useEffect, useCallback, useRef } from 'react';
import { useWebsiteStylesManager } from './useWebsiteStylesManager';
import { useWebsiteDataManager } from './useWebsiteDataManager';

export const useWebsiteUnifiedSync = () => {
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);
  const lastDataHash = useRef<string>('');
  
  const { applyStyles, cleanup } = useWebsiteStylesManager();
  const { loadSettings, loadDesign, updatePageTitle, updateMetaDescription, updateDOMElements } = useWebsiteDataManager();

  const applyAllChanges = useCallback(async () => {
    const now = Date.now();
    
    // Throttle pour les changements rapides
    if (syncInProgress.current || (now - lastSyncTime.current) < 200) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🚀 Starting unified website sync');
      
      const settings = loadSettings();
      const design = loadDesign();
      
      // Créer un hash pour détecter les vrais changements
      const currentDataHash = `${JSON.stringify(settings)}-${JSON.stringify(design)}`;
      
      // Si les données n'ont pas changé, ne pas refaire la sync
      if (currentDataHash === lastDataHash.current && lastDataHash.current !== '') {
        console.log('🔄 No data changes detected, skipping sync');
        return;
      }
      
      lastDataHash.current = currentDataHash;
      
      // Déterminer le nom du site
      const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
      console.log('🏷️ Final site name:', finalSiteName);
      
      // Mettre à jour le titre de la page
      updatePageTitle(finalSiteName);
      
      // Mettre à jour la description meta
      if (settings?.siteDescription) {
        updateMetaDescription(settings.siteDescription);
      }
      
      // Appliquer les styles CSS
      if (design) {
        applyStyles(design);
      }
      
      // Mettre à jour les éléments DOM
      const updateElements = () => {
        updateDOMElements(finalSiteName, design?.logo);
      };
      
      // Appliquer immédiatement et avec des délais
      updateElements();
      setTimeout(updateElements, 100);
      setTimeout(updateElements, 500);
      
      console.log('✅ Unified sync completed successfully');
      
    } catch (error) {
      console.error('❌ Unified sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [applyStyles, loadSettings, loadDesign, updatePageTitle, updateMetaDescription, updateDOMElements]);

  useEffect(() => {
    console.log('🚀 Unified website sync hook initialized');
    
    // Sync initial
    applyAllChanges();

    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected for:', event.key);
        setTimeout(applyAllChanges, 100);
      }
    };

    const handleCustomEvents = () => {
      console.log('🎉 Custom event detected, forcing sync');
      setTimeout(applyAllChanges, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvents);
    window.addEventListener('websiteDesignSaved', handleCustomEvents);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvents);
    
    // Polling de sécurité
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        applyAllChanges();
      }
    }, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvents);
      window.removeEventListener('websiteDesignSaved', handleCustomEvents);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvents);
      cleanup();
    };
  }, [applyAllChanges, cleanup]);

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    lastDataHash.current = '';
    syncInProgress.current = false;
    lastSyncTime.current = 0;
    return applyAllChanges();
  }, [applyAllChanges]);

  return {
    forceSync,
    isActiveSyncing: syncInProgress.current
  };
};
