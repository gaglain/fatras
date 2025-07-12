
import { useEffect, useRef, useCallback } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteDesignSync } from './useWebsiteDesignSync';

export const useWebsiteRealTimeSync = () => {
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncDesignChanges } = useWebsiteDesignSync();
  
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef(0);
  const isInitialized = useRef(false);
  const SYNC_THROTTLE = 2000; // Réduit à 2 secondes pour plus de réactivité

  const performSafeSync = useCallback(async () => {
    const now = Date.now();
    
    // Prévenir les synchronisations simultanées mais réduire le throttle
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_THROTTLE) {
      console.log('🔄 Sync skipped - throttled or in progress');
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🔄 Performing comprehensive website sync');
      
      // Synchronisation parallèle pour plus d'efficacité
      const results = await Promise.allSettled([
        syncSettingsChanges(),
        syncDesignChanges()
      ]);
      
      // Log des résultats pour debugging
      results.forEach((result, index) => {
        const type = index === 0 ? 'Settings' : 'Design';
        if (result.status === 'rejected') {
          console.error(`❌ ${type} sync failed:`, result.reason);
        } else {
          console.log(`✅ ${type} sync completed`);
        }
      });
      
      console.log('✅ Website sync completed successfully');
    } catch (error) {
      console.error('❌ Critical sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [syncSettingsChanges, syncDesignChanges]);

  const initializeSync = useCallback(async () => {
    if (isInitialized.current || syncInProgress.current) {
      console.log('🔄 Init sync skipped - already initialized or in progress');
      return;
    }
    
    isInitialized.current = true;
    console.log('🚀 Initializing enhanced website sync system');
    
    // Délai court pour s'assurer que le DOM est prêt
    setTimeout(() => {
      performSafeSync();
    }, 500);
  }, [performSafeSync]);

  useEffect(() => {
    console.log('🎯 WebsiteRealTimeSync hook mounted');
    
    // Initialisation immédiate
    initializeSync();

    // Synchronisation périodique plus fréquente pour l'aperçu
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('⏰ Periodic sync triggered');
        performSafeSync();
      }
    }, 10000); // 10 secondes au lieu de 2 minutes

    // Nettoyage à la désinscription
    return () => {
      console.log('🧹 Cleaning up WebsiteRealTimeSync');
      clearInterval(syncInterval);
      isInitialized.current = false;
    };
  }, [initializeSync, performSafeSync]);

  // Force sync public avec meilleure gestion d'erreurs
  const forceSync = useCallback(async () => {
    if (syncInProgress.current) {
      console.log('🔄 Force sync already in progress');
      return false;
    }
    
    try {
      console.log('🔄 Force sync requested by user');
      await performSafeSync();
      return true;
    } catch (error) {
      console.error('❌ Force sync failed:', error);
      return false;
    }
  }, [performSafeSync]);

  return {
    forceSync,
    isInitialized: isInitialized.current,
    isSyncing: syncInProgress.current
  };
};
