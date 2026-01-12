import { useEffect, useRef, useCallback } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteUnifiedSync } from './useWebsiteUnifiedSync';
import { logger } from '@/lib/logger';

export const useWebsiteRealTimeSync = () => {
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { forceSync: forceUnifiedSync } = useWebsiteUnifiedSync();
  
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef(0);
  const isInitialized = useRef(false);
  const SYNC_THROTTLE = 2000; // 2 seconds for responsiveness

  const performSafeSync = useCallback(async () => {
    const now = Date.now();
    
    // Prevent simultaneous synchronizations but reduce throttle
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_THROTTLE) {
      logger.debug('🔄 Sync skipped - throttled or in progress');
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      logger.debug('🔄 Performing comprehensive website sync');
      
      // Synchronization with both settings and unified design sync
      const results = await Promise.allSettled([
        syncSettingsChanges(),
        forceUnifiedSync()
      ]);
      
      // Log results for debugging
      results.forEach((result, index) => {
        const type = index === 0 ? 'Settings' : 'Design';
        if (result.status === 'rejected') {
          logger.error(`❌ ${type} sync failed:`, result.reason);
        } else {
          logger.debug(`✅ ${type} sync completed`);
        }
      });
      
      logger.debug('✅ Website sync completed successfully');
    } catch (error) {
      logger.error('❌ Critical sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [syncSettingsChanges, forceUnifiedSync]);

  const initializeSync = useCallback(async () => {
    if (isInitialized.current || syncInProgress.current) {
      logger.debug('🔄 Init sync skipped - already initialized or in progress');
      return;
    }
    
    isInitialized.current = true;
    logger.debug('🚀 Initializing enhanced website sync system');
    
    // Short delay to ensure DOM is ready
    setTimeout(() => {
      performSafeSync();
    }, 500);
  }, [performSafeSync]);

  useEffect(() => {
    logger.debug('🎯 WebsiteRealTimeSync hook mounted');
    
    // Immediate initialization
    initializeSync();

    // More frequent periodic synchronization for preview
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current && isInitialized.current) {
        logger.debug('⏰ Periodic sync triggered');
        performSafeSync();
      }
    }, 10000); // 10 seconds instead of 2 minutes

    // Cleanup on unmount
    return () => {
      logger.debug('🧹 Cleaning up WebsiteRealTimeSync');
      clearInterval(syncInterval);
      isInitialized.current = false;
    };
  }, [initializeSync, performSafeSync]);

  // Force sync public with better error handling
  const forceSync = useCallback(async () => {
    if (syncInProgress.current) {
      logger.debug('🔄 Force sync already in progress');
      return false;
    }
    
    try {
      logger.debug('🔄 Force sync requested by user');
      await performSafeSync();
      return true;
    } catch (error) {
      logger.error('❌ Force sync failed:', error);
      return false;
    }
  }, [performSafeSync]);

  return {
    forceSync,
    isInitialized: isInitialized.current,
    isSyncing: syncInProgress.current
  };
};
