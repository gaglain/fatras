
import { useEffect, useRef, useCallback } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteDesignSync } from './useWebsiteDesignSync';

export const useWebsiteRealTimeSync = () => {
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncDesignChanges } = useWebsiteDesignSync();
  
  const syncInProgress = useRef(false);
  const lastSyncTime = useRef(0);
  const isInitialized = useRef(false);
  const SYNC_THROTTLE = 5000; // 5 seconds throttling

  const performSafeSync = useCallback(async () => {
    const now = Date.now();
    
    // Prevent overlapping syncs and throttle
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_THROTTLE) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🔄 Performing website sync');
      await Promise.allSettled([
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
    console.log('🚀 Initializing website sync system');
    await performSafeSync();
  }, [performSafeSync]);

  useEffect(() => {
    // Initialize once
    initializeSync();

    // Reduced frequency sync (every 2 minutes instead of 1)
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('⏰ Periodic sync check');
        performSafeSync();
      }
    }, 120000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [initializeSync, performSafeSync]);

  return {
    forceSync: async () => {
      if (!syncInProgress.current && isInitialized.current) {
        console.log('🔄 Force sync requested');
        await performSafeSync();
      }
    }
  };
};
