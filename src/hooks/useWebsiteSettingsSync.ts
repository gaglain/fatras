
import { useEffect, useCallback } from 'react';

interface WebsiteSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
}

export const useWebsiteSettingsSync = () => {
  const syncSettingsChanges = useCallback(() => {
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      try {
        const settings: WebsiteSettings = JSON.parse(savedSettings);
        
        // Mettre à jour le titre
        document.title = settings.siteName || 'MusiConnect';
        
        // Déclencher l'événement de mise à jour
        const event = new CustomEvent('websiteSettingsUpdated', { detail: settings });
        window.dispatchEvent(event);
        
        console.log('⚙️ Paramètres synchronisés:', settings);
      } catch (error) {
        console.error('Erreur sync paramètres:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Synchroniser immédiatement au démarrage
    syncSettingsChanges();

    // Polling plus fréquent pour vérifier les changements
    const interval = setInterval(syncSettingsChanges, 500);

    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings') {
        setTimeout(syncSettingsChanges, 10);
      }
    };

    // Écouter les événements personnalisés
    const handleSettingsSaved = () => {
      setTimeout(syncSettingsChanges, 10);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
    };
  }, [syncSettingsChanges]);

  return { syncSettingsChanges };
};
