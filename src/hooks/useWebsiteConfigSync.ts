
import { useEffect, useCallback } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useWebsiteConfigSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  const forceSync = useCallback(() => {
    console.log('🔄 Force synchronization requested');
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    // Polling très agressif pour détecter les changements
    const pollForChanges = () => {
      const currentConfig = localStorage.getItem('websiteConfig');
      if (currentConfig) {
        try {
          const config = JSON.parse(currentConfig);
          const currentTitle = document.title;
          if (config.siteName && config.siteName !== currentTitle) {
            console.log('🔄 Config change detected via polling, reloading...');
            reloadConfig();
          }
        } catch (e) {
          console.error('Error parsing config during polling:', e);
        }
      }
    };

    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig') {
        console.log('💾 Website config changed in storage, reloading...');
        setTimeout(() => reloadConfig(), 50);
      }
    };

    // Écouter les événements personnalisés
    const handleConfigChanged = (event: any) => {
      console.log('🎉 Website config changed event received', event.detail);
      setTimeout(() => reloadConfig(), 50);
    };

    const handleForceReload = () => {
      console.log('🔄 Force reload event received');
      setTimeout(() => reloadConfig(), 50);
    };

    // Écouter les changements de focus de fenêtre
    const handleFocus = () => {
      console.log('🎯 Window focused, checking for config updates...');
      setTimeout(() => reloadConfig(), 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChanged);
    window.addEventListener('websiteConfigReload', handleConfigChanged);
    window.addEventListener('websiteConfigForceReload', handleForceReload);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);

    // Polling toutes les 500ms pour détecter les changements
    const pollingInterval = setInterval(pollForChanges, 500);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChanged);
      window.removeEventListener('websiteConfigReload', handleConfigChanged);
      window.removeEventListener('websiteConfigForceReload', handleForceReload);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      clearInterval(pollingInterval);
    };
  }, [reloadConfig]);

  return { forceSync };
};
