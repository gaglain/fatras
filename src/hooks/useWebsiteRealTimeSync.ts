
import { useEffect } from 'react';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useWebsiteDesignSync } from './useWebsiteDesignSync';
import { useWebsitePagesSync } from './useWebsitePagesSync';
import { useWebsiteMenuSync } from './useWebsiteMenuSync';

export const useWebsiteRealTimeSync = () => {
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncDesignChanges } = useWebsiteDesignSync();
  const { refreshPages } = useWebsitePagesSync();
  const { refreshMenu } = useWebsiteMenuSync();

  useEffect(() => {
    console.log('🔄 Initializing real-time website sync');

    // Synchronisation initiale
    const performInitialSync = () => {
      console.log('🚀 Performing initial sync');
      syncSettingsChanges();
      syncDesignChanges();
      refreshPages();
      refreshMenu();
    };

    performInitialSync();

    // Écouter tous les événements de synchronisation
    const handleSync = () => {
      console.log('📡 Sync event received');
      setTimeout(() => {
        syncSettingsChanges();
        syncDesignChanges();
      }, 100);
    };

    // Événements de synchronisation
    window.addEventListener('websiteSettingsUpdated', handleSync);
    window.addEventListener('websiteDesignUpdated', handleSync);
    window.addEventListener('websitePagesUpdated', handleSync);
    window.addEventListener('websiteMenuUpdated', handleSync);
    window.addEventListener('storage', handleSync);

    // Synchronisation périodique pour s'assurer que tout reste à jour
    const syncInterval = setInterval(() => {
      console.log('⏰ Periodic sync check');
      syncSettingsChanges();
      syncDesignChanges();
    }, 10000); // Toutes les 10 secondes

    // Synchronisation au focus de la fenêtre
    const handleFocus = () => {
      console.log('👁️ Window focus - triggering sync');
      performInitialSync();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('websiteSettingsUpdated', handleSync);
      window.removeEventListener('websiteDesignUpdated', handleSync);
      window.removeEventListener('websitePagesUpdated', handleSync);
      window.removeEventListener('websiteMenuUpdated', handleSync);
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('focus', handleFocus);
      clearInterval(syncInterval);
    };
  }, [syncSettingsChanges, syncDesignChanges, refreshPages, refreshMenu]);

  return {
    forceSync: () => {
      console.log('🔄 Force sync requested');
      syncSettingsChanges();
      syncDesignChanges();
      refreshPages();
      refreshMenu();
    }
  };
};
