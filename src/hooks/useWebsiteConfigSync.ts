
import { useEffect, useCallback } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useWebsiteConfigSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  const forceSync = useCallback(() => {
    console.log('🔄 Force synchronization requested');
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig') {
        console.log('💾 Website config changed in storage, reloading...');
        reloadConfig();
      }
    };

    // Écouter les événements personnalisés
    const handleConfigChanged = () => {
      console.log('🎉 Website config changed event received');
      reloadConfig();
    };

    const handleForceReload = () => {
      console.log('🔄 Force reload event received');
      reloadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChanged);
    window.addEventListener('websiteConfigReload', handleConfigChanged);
    window.addEventListener('websiteConfigForceReload', handleForceReload);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChanged);
      window.removeEventListener('websiteConfigReload', handleConfigChanged);
      window.removeEventListener('websiteConfigForceReload', handleForceReload);
    };
  }, [reloadConfig]);

  return { forceSync };
};
