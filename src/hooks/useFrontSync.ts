
import { useEffect, useCallback, useRef } from 'react';

export const useFrontSync = () => {
  const hasInitialized = useRef(false);
  const syncTimeout = useRef<NodeJS.Timeout | null>(null);

  const safeParse = (key: string, fallback: any = null) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      localStorage.removeItem(key);
      return fallback;
    }
  };

  const syncAll = useCallback(() => {
    // Synchroniser le titre
    const settings = safeParse('websiteSettings');
    if (settings?.siteName && document.title !== settings.siteName) {
      document.title = settings.siteName;
    }
  }, []);

  const debouncedSync = useCallback(() => {
    if (syncTimeout.current) {
      clearTimeout(syncTimeout.current);
    }
    syncTimeout.current = setTimeout(syncAll, 200);
  }, [syncAll]);

  useEffect(() => {
    // Sync initial une seule fois
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      syncAll();
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign', 'websiteMenu'].includes(e.key || '')) {
        debouncedSync();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      if (syncTimeout.current) {
        clearTimeout(syncTimeout.current);
      }
    };
  }, [syncAll, debouncedSync]);
  
  return { forceSync: syncAll };
};
