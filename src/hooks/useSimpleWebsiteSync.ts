
import { useEffect } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useSimpleWebsiteSync = () => {
  const { reloadConfig } = useWebsiteConfig();

  useEffect(() => {
    // Force reload au montage
    console.log('🔄 Force reload config on mount');
    reloadConfig();

    // Écouter les changements de localStorage
    const handleStorageChange = () => {
      console.log('📦 Storage changed, reloading...');
      reloadConfig();
    };

    // Écouter les changements de focus de la fenêtre
    const handleFocus = () => {
      console.log('👁️ Window focused, reloading config...');
      reloadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('websiteConfigChanged', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('websiteConfigChanged', handleStorageChange);
    };
  }, [reloadConfig]);

  return { forceReload: reloadConfig };
};
