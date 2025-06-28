
import { useWebsiteDesignSync } from './useWebsiteDesignSync';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useLegalContentSync } from './useLegalContentSync';
import { useEffect } from 'react';

export const useWebsiteSync = () => {
  const { syncDesignChanges } = useWebsiteDesignSync();
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncLegalContent } = useLegalContentSync();

  useEffect(() => {
    // Forcer une synchronisation complète immédiatement
    console.log('🔄 Initialisation de la synchronisation globale');
    
    const performFullSync = () => {
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    };

    // Sync immédiate
    performFullSync();

    // Sync forcée toutes les secondes pour s'assurer que tout est à jour
    const forceSync = setInterval(performFullSync, 1000);

    // Sync ultra-rapide pendant les 10 premières secondes
    const rapidSync = setInterval(performFullSync, 50);
    setTimeout(() => clearInterval(rapidSync), 10000);

    return () => {
      clearInterval(forceSync);
      clearInterval(rapidSync);
    };
  }, [syncDesignChanges, syncSettingsChanges, syncLegalContent]);

  // Exposer les fonctions de synchronisation
  return {
    syncDesignChanges,
    syncSettingsChanges,
    syncLegalContent,
    forceFullSync: () => {
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    }
  };
};
