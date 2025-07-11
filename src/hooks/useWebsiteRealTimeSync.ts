
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
  const SYNC_THROTTLE = 1000; // 1 second throttle

  const performSafeSync = useCallback(() => {
    const now = Date.now();
    
    // Prevent rapid successive syncs
    if (syncInProgress.current || (now - lastSyncTime.current) < SYNC_THROTTLE) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🔄 Performing throttled sync');
      syncSettingsChanges();
      syncDesignChanges();
    } catch (error) {
      console.error('❌ Sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [syncSettingsChanges, syncDesignChanges]);

  useEffect(() => {
    console.log('🔄 Initializing optimized real-time website sync');

    // Initial sync only once
    if (!syncInProgress.current) {
      console.log('🚀 Performing initial sync');
      syncInProgress.current = true;
      try {
        syncSettingsChanges();
        syncDesignChanges();
        refreshPages();
        refreshMenu();
      } finally {
        syncInProgress.current = false;
      }
    }

    // Debounced event handler
    let syncTimeout: NodeJS.Timeout;
    const handleSync = () => {
      clearTimeout(syncTimeout);
      syncTimeout = setTimeout(performSafeSync, 300);
    };

    // Only essential events
    window.addEventListener('websiteSettingsUpdated', handleSync);
    window.addEventListener('websiteDesignUpdated', handleSync);

    // Reduced frequency periodic sync (30 seconds instead of 10)
    const syncInterval = setInterval(() => {
      if (!syncInProgress.current) {
        console.log('⏰ Periodic sync check');
        performSafeSync();
      }
    }, 30000);

    // Focus sync with throttling
    const handleFocus = () => {
      if (!document.hidden && !syncInProgress.current) {
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
  }, [performSafeSync, refreshPages, refreshMenu]);

  return {
    forceSync: () => {
      if (!syncInProgress.current) {
        console.log('🔄 Force sync requested');
        performSafeSync();
        refreshPages();
        refreshMenu();
      }
    }
  };
};
