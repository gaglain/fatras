
import { useEffect, useRef } from 'react';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const useSimpleWebsiteSync = () => {
  const { reloadConfig } = useWebsiteConfig();
  const hasLoaded = useRef(false);

  useEffect(() => {
    // Charger une seule fois au montage
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      reloadConfig();
    }

    // Écouter uniquement les changements de localStorage explicites
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && ['websiteConfig', 'websiteSettings', 'websiteDesign'].includes(event.key)) {
        reloadConfig();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [reloadConfig]);

  return { forceReload: reloadConfig };
};
