
import { useWebsiteDesignSync } from './useWebsiteDesignSync';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useLegalContentSync } from './useLegalContentSync';
import { useEffect } from 'react';

export const useWebsiteSync = () => {
  const { syncDesignChanges } = useWebsiteDesignSync();
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncLegalContent } = useLegalContentSync();

  useEffect(() => {
    console.log('🔄 Initialisation de la synchronisation globale du site web');
    
    const performFullSync = () => {
      console.log('🔄 Performing full sync...');
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    };

    // Sync immédiate
    performFullSync();

    // Sync régulière toutes les 5 secondes
    const regularSync = setInterval(performFullSync, 5000);

    // Écouter les événements de sauvegarde
    const handleWebsiteUpdate = () => {
      console.log('🔄 Website update detected, syncing...');
      setTimeout(performFullSync, 100);
    };

    window.addEventListener('websiteDesignSaved', handleWebsiteUpdate);
    window.addEventListener('websiteSettingsSaved', handleWebsiteUpdate);
    window.addEventListener('websiteDesignUpdated', handleWebsiteUpdate);
    window.addEventListener('websiteSettingsUpdated', handleWebsiteUpdate);

    return () => {
      clearInterval(regularSync);
      window.removeEventListener('websiteDesignSaved', handleWebsiteUpdate);
      window.removeEventListener('websiteSettingsSaved', handleWebsiteUpdate);
      window.removeEventListener('websiteDesignUpdated', handleWebsiteUpdate);
      window.removeEventListener('websiteSettingsUpdated', handleWebsiteUpdate);
    };
  }, [syncDesignChanges, syncSettingsChanges, syncLegalContent]);

  return {
    syncDesignChanges,
    syncSettingsChanges,
    syncLegalContent,
    forceFullSync: () => {
      console.log('🔄 Force sync triggered');
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    }
  };
};
