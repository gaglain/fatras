
import { useEffect, useRef, useCallback } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteDesignSync } from './useWebsiteDesignSync';
import { useWebsitePagesSync } from './useWebsitePagesSync';
import { useWebsiteMenuSync } from './useWebsiteMenuSync';

export const useWebsiteRealTimeSync = () => {
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncDesignChanges } = useWebsiteDesignSync();
  const { refreshPages } = useWebsitePagesSync();
  const { refreshMenu } = useWebsiteMenuSync();
  
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef(0);
  const isInitialized = useRef(false);
  const SYNC_THROTTLE = 2000; // Augmentation à 2 secondes

  const performSafeSync = useCallback(async () => {
    const now = Date.now();
    
    // Prévenir les syncs trop rapides
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_THROTTLE) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🔄 Performing optimized sync');
      await Promise.all([
        syncSettingsChanges(),
        syncDesignChanges()
      ]);
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [syncSettingsChanges, syncDesignChanges]);

  const initializeSync = useCallback(async () => {
    if (isInitialized.current || syncInProgress.current) return;
    
    isInitialized.current = true;
    syncInProgress.current = true;
    
    try {
      console.log('🚀 Initializing website sync system');
      await Promise.all([
        syncSettingsChanges(),
        syncDesignChanges(),
        refreshPages(),
        refreshMenu()
      ]);
      console.log('✅ Website sync system initialized');
    } catch (error) {
      console.error('❌ Initialization error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [syncSettingsChanges, syncDesignChanges, refreshPages, refreshMenu]);

  useEffect(() => {
    // Initialisation une seule fois
    initializeSync();

    // Gestionnaire d'événements avec debounce
    let syncTimeout: NodeJS.Timeout;
    const handleSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(performSafeSync, 500);
    };

    // Écoute uniquement des événements critiques
    window.addEventListener('websiteSettingsUpdated', handleSync);
    window.addEventListener('websiteDesignUpdated', handleSync);

    // Sync périodique réduite (60 secondes)
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('⏰ Periodic sync check');
        performSafeSync();
      }
    }, 60000);

    // Sync sur focus avec throttling
    const handleFocus = () => {
      if (!document.hidden && !syncInProgress.current && isInitialized.current) {
        console.log('👁️ Window focus - triggering sync');
        performSafeSync();
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      clearTimeout(syncTimeout);
      window.removeEventListener('websiteSettingsUpdated', handleSync);
      window.removeEventListener('websiteDesignUpdated', handleSync);
      window.removeEventListener('focus', handleFocus);
      clearInterval(syncInterval);
    };
  }, [initializeSync, performSafeSync]);

  return {
    forceSync: async () => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('🔄 Force sync requested');
        await performSafeSync();
        await Promise.all([refreshPages(), refreshMenu()]);
      }
    }
  };
};
