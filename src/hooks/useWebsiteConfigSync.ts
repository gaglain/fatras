
import { useEffect, useCallback } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useWebsiteConfigSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig') {
        console.log('📦 Storage changed, reloading config');
        reloadConfig();
      }
    };

    const handleConfigChange = () => {
      console.log('⚡ Config change event, reloading');
      reloadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChange);
    window.addEventListener('websiteConfigReload', handleConfigChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChange);
      window.removeEventListener('websiteConfigReload', handleConfigChange);
    };
  }, [reloadConfig]);

  return { forceSync };
};
