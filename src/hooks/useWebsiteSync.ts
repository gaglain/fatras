
import { useWebsiteDesignSync } from './useWebsiteDesignSync';
import { useWebsiteSettingsSync } from './useWebsiteSettingsSync';
import { useLegalContentSync } from './useLegalContentSync';

export const useWebsiteSync = () => {
  // Utiliser les hooks séparés pour une meilleure organisation
  const { syncDesignChanges } = useWebsiteDesignSync();
  const { syncSettingsChanges } = useWebsiteSettingsSync();
  const { syncLegalContent } = useLegalContentSync();

  // Exposer les fonctions de synchronisation si nécessaire
  return {
    syncDesignChanges,
    syncSettingsChanges,
    syncLegalContent
  };
};
