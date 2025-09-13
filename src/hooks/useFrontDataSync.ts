import { useEffect, useCallback, useRef } from 'react';

export const useFrontDataSync = () => {
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef(0);
  const SYNC_INTERVAL = 1000; // 1 seconde pour réactivité

  const forceSync = useCallback(() => {
    const now = Date.now();
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_INTERVAL) {
      return;
    }

    syncInProgress.current = true;
    lastSyncTime.current = now;

    console.log('🔄 Front data sync - Force sync triggered');

    try {
      // Déclencher un rafraîchissement doux du front (évite le scintillement)
      window.dispatchEvent(new CustomEvent('frontDataRefresh'));
      
    } catch (error) {
      console.error('❌ Error during front sync:', error);
    } finally {
      setTimeout(() => {
        syncInProgress.current = false;
      }, 500);
    }
  }, []);

  useEffect(() => {
    // Sync initial
    setTimeout(forceSync, 100);

    // Pas de sync périodique pour éviter le scintillement

    // Listeners pour les changements
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings' || event.key === 'websiteDesign' || event.key === 'websitePages') {
        console.log('📦 Storage change detected for:', event.key);
        setTimeout(forceSync, 200);
      }
    };

    const handleCustomEvent = () => {
      console.log('🎯 Custom event detected, syncing...');
      setTimeout(forceSync, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvent);
    window.addEventListener('websiteDesignUpdated', handleCustomEvent);
    window.addEventListener('websiteSettingsSaved', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvent);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvent);
      window.removeEventListener('websiteSettingsSaved', handleCustomEvent);
    };
  }, [forceSync]);

  return { forceSync };
};