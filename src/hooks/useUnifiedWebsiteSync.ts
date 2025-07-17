
import { useEffect, useCallback, useRef } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useUnifiedWebsiteSync = () => {
  const { reloadConfig } = useWebsiteConfig();
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);

  const performSync = useCallback(() => {
    const now = Date.now();
    
    // Éviter les synchronisations trop fréquentes
    if (syncInProgress.current || (now - lastSyncTime.current) < 200) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    console.log('🔄 Unified sync triggered');
    
    setTimeout(() => {
      reloadConfig();
      syncInProgress.current = false;
    }, 50);
  }, [reloadConfig]);

  useEffect(() => {
    console.log('🚀 Unified website sync initialized');
    
    // Sync initial
    performSync();

    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteConfig', 'websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('📦 Storage change detected:', event.key);
        performSync();
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvents = () => {
      console.log('⚡ Custom config event detected');
      performSync();
    };

    // Écouter le focus de la fenêtre
    const handleFocus = () => {
      console.log('👁️ Window focus detected');
      performSync();
    };

    // Attacher tous les listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleCustomEvents);
    window.addEventListener('siteConfigChanged', handleCustomEvents);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleCustomEvents);
      window.removeEventListener('siteConfigChanged', handleCustomEvents);
      window.removeEventListener('focus', handleFocus);
    };
  }, [performSync]);

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    syncInProgress.current = false;
    lastSyncTime.current = 0;
    performSync();
  }, [performSync]);

  return { forceSync };
};
