import { useEffect, useCallback } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { logger } from '@/lib/logger';

export const useWebsiteConfigSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  const forceSync = useCallback(() => {
    logger.debug('Force sync requested');
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    logger.debug('WebsiteConfigSync hook mounted');
    
    // Force reload au montage
    reloadConfig();

    const handleStorageChange = (event: StorageEvent) => {
      logger.debug('Storage event detected:', event.key);
      if (event.key === 'websiteConfig' || event.key === 'websiteSettings' || event.key === 'websiteDesign') {
        logger.debug('Website config storage changed, reloading');
        setTimeout(() => reloadConfig(), 100);
      }
    };

    const handleConfigChange = () => {
      logger.debug('Custom config change event detected');
      setTimeout(() => reloadConfig(), 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        logger.debug('Page became visible, reloading config');
        setTimeout(() => reloadConfig(), 200);
      }
    };

    const handleFocus = () => {
      logger.debug('Window focused, reloading config');
      setTimeout(() => reloadConfig(), 100);
    };

    // Écouter tous les événements possibles
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChange);
    window.addEventListener('websiteConfigReload', handleConfigChange);
    window.addEventListener('siteConfigChanged', handleConfigChange);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChange);
      window.removeEventListener('websiteConfigReload', handleConfigChange);
      window.removeEventListener('siteConfigChanged', handleConfigChange);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [reloadConfig]);

  return { forceSync };
};
