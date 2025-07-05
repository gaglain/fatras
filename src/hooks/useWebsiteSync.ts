
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
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    };

    // Sync immédiate
    performFullSync();

    // Sync régulière toutes les 2 secondes pour assurer la mise à jour
    const regularSync = setInterval(performFullSync, 2000);

    // Sync ultra-rapide pendant les 15 premières secondes
    const rapidSync = setInterval(performFullSync, 100);
    setTimeout(() => clearInterval(rapidSync), 15000);

    return () => {
      clearInterval(regularSync);
      clearInterval(rapidSync);
    };
  }, [syncDesignChanges, syncSettingsChanges, syncLegalContent]);

  // Exposer les fonctions de synchronisation
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
