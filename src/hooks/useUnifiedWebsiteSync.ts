import { useEffect, useCallback, useRef } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { logger } from '@/lib/logger';

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
    
    logger.debug('Unified sync triggered');
    
    setTimeout(() => {
      reloadConfig();
      syncInProgress.current = false;
    }, 50);
  }, [reloadConfig]);

  useEffect(() => {
    logger.debug('Unified website sync initialized');
    
    // Sync initial
    performSync();

    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteConfig', 'websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        logger.debug('Storage change detected:', event.key);
        performSync();
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvents = () => {
      logger.debug('Custom config event detected');
      performSync();
    };

    // Écouter le focus de la fenêtre
    const handleFocus = () => {
      logger.debug('Window focus detected');
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
    logger.debug('Force sync requested');
    syncInProgress.current = false;
    lastSyncTime.current = 0;
    performSync();
  }, [performSync]);

  return { forceSync };
};
