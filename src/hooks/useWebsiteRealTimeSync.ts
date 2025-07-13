
import { useEffect, useRef, useCallback } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteUnifiedSync } from './useWebsiteUnifiedSync';

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
      console.log('🔄 Sync skipped - throttled or in progress');
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🔄 Performing comprehensive website sync');
      
      // Synchronization with both settings and unified design sync
      const results = await Promise.allSettled([
        syncSettingsChanges(),
        forceUnifiedSync()
      ]);
      
      // Log results for debugging
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
  }, [syncSettingsChanges, forceUnifiedSync]);

  const initializeSync = useCallback(async () => {
    if (isInitialized.current || syncInProgress.current) {
      console.log('🔄 Init sync skipped - already initialized or in progress');
      return;
    }
    
    isInitialized.current = true;
    console.log('🚀 Initializing enhanced website sync system');
    
    // Short delay to ensure DOM is ready
    setTimeout(() => {
      performSafeSync();
    }, 500);
  }, [performSafeSync]);

  useEffect(() => {
    console.log('🎯 WebsiteRealTimeSync hook mounted');
    
    // Immediate initialization
    initializeSync();

    // More frequent periodic synchronization for preview
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('⏰ Periodic sync triggered');
        performSafeSync();
      }
    }, 10000); // 10 seconds instead of 2 minutes

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebsiteRealTimeSync');
      clearInterval(syncInterval);
      isInitialized.current = false;
    };
  }, [initializeSync, performSafeSync]);

  // Force sync public with better error handling
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
