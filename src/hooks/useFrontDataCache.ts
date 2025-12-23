import { useCallback, useRef } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Cache en mémoire pour éviter les requêtes répétées
const memoryCache = new Map<string, CacheEntry<any>>();

export const useFrontDataCache = () => {
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());

  const getCached = useCallback(<T>(key: string): T | null => {
    // 1. Vérifier le cache mémoire
    const memEntry = memoryCache.get(key);
    if (memEntry && Date.now() - memEntry.timestamp < CACHE_DURATION) {
      return memEntry.data as T;
    }

    // 2. Vérifier sessionStorage
    try {
      const stored = sessionStorage.getItem(`front_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored) as CacheEntry<T>;
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
          // Restaurer en mémoire
          memoryCache.set(key, parsed);
          return parsed.data;
        }
      }
    } catch (e) {
      // Ignorer les erreurs de parsing
    }

    return null;
  }, []);

  const setCache = useCallback(<T>(key: string, data: T): void => {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now()
    };

    // Sauvegarder en mémoire
    memoryCache.set(key, entry);

    // Sauvegarder en sessionStorage
    try {
      sessionStorage.setItem(`front_cache_${key}`, JSON.stringify(entry));
    } catch (e) {
      // sessionStorage peut être plein ou désactivé
      console.warn('Cache sessionStorage failed:', e);
    }
  }, []);

  const fetchWithCache = useCallback(async <T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { forceRefresh?: boolean }
  ): Promise<T> => {
    // Si pas de force refresh, vérifier le cache
    if (!options?.forceRefresh) {
      const cached = getCached<T>(key);
      if (cached !== null) {
        console.log(`📦 Cache hit for: ${key}`);
        return cached;
      }
    }

    // Éviter les requêtes en double
    const pending = pendingRequests.current.get(key);
    if (pending) {
      console.log(`⏳ Waiting for pending request: ${key}`);
      return pending;
    }

    console.log(`🔄 Fetching: ${key}`);
    const promise = fetcher()
      .then(data => {
        setCache(key, data);
        pendingRequests.current.delete(key);
        return data;
      })
      .catch(error => {
        pendingRequests.current.delete(key);
        throw error;
      });

    pendingRequests.current.set(key, promise);
    return promise;
  }, [getCached, setCache]);

  const clearCache = useCallback((key?: string): void => {
    if (key) {
      memoryCache.delete(key);
      sessionStorage.removeItem(`front_cache_${key}`);
    } else {
      memoryCache.clear();
      // Nettoyer tous les caches front
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('front_cache_')) {
          sessionStorage.removeItem(k);
        }
      });
    }
  }, []);

  return {
    getCached,
    setCache,
    fetchWithCache,
    clearCache
  };
};

// Clés de cache standardisées
export const CACHE_KEYS = {
  WEBSITE_DESIGN: 'website_design',
  WEBSITE_SETTINGS: 'website_settings',
  HOMEPAGE: 'homepage',
  EVENTS: 'events',
  ARTISTS: 'artists',
  MENU: 'menu'
} as const;
