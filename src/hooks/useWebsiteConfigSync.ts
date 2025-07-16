
import { useEffect, useCallback } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useWebsiteConfigSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    reloadConfig();
  }, [reloadConfig]);

  useEffect(() => {
    console.log('🎯 WebsiteConfigSync hook mounted');
    
    // Force reload au montage
    reloadConfig();

    const handleStorageChange = (event: StorageEvent) => {
      console.log('📦 Storage event detected:', event.key);
      if (event.key === 'websiteConfig' || event.key === 'websiteSettings' || event.key === 'websiteDesign') {
        console.log('📦 Website config storage changed, reloading');
        setTimeout(() => reloadConfig(), 100);
      }
    };

    const handleConfigChange = (event?: CustomEvent) => {
      console.log('⚡ Custom config change event detected');
      setTimeout(() => reloadConfig(), 100);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, reloading config');
        setTimeout(() => reloadConfig(), 200);
      }
    };

    const handleFocus = () => {
      console.log('🎯 Window focused, reloading config');
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
