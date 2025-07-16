
import { useEffect, useCallback, useRef } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useWebsiteConfigSync = () => {
  const { config, reloadConfig } = useWebsiteConfig();
  const isInitialized = useRef(false);

  const forceSync = useCallback(() => {
    console.log('🔄 Force synchronization requested');
    
    // Recharger la configuration depuis localStorage
    reloadConfig();
    
    // Mettre à jour le titre de la page
    if (config.siteName) {
      document.title = config.siteName;
    }
    
    // Déclencher un événement pour forcer le re-render
    window.dispatchEvent(new CustomEvent('websiteConfigForceReload', { 
      detail: config 
    }));
    
  }, [config, reloadConfig]);

  useEffect(() => {
    if (!isInitialized.current) {
      console.log('🚀 Initializing website config sync');
      isInitialized.current = true;
      forceSync();
    }
  }, [forceSync]);

  useEffect(() => {
    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig') {
        console.log('💾 Website config changed in storage, reloading...');
        setTimeout(() => {
          reloadConfig();
        }, 100);
      }
    };

    // Écouter les événements personnalisés
    const handleConfigChanged = () => {
      console.log('🎉 Website config changed event received');
      setTimeout(() => {
        reloadConfig();
      }, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChanged);
    window.addEventListener('websiteConfigReload', handleConfigChanged);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChanged);
      window.removeEventListener('websiteConfigReload', handleConfigChanged);
    };
  }, [reloadConfig]);

  return { forceSync };
};
