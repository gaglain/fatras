
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
        
        console.log('⚙️ Applying website settings:', settings);
        
        // Mettre à jour le titre immédiatement
        if (settings.siteName) {
          document.title = settings.siteName;
        }
        
        // Mettre à jour les meta tags
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.getElementsByTagName('head')[0].appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', settings.siteDescription || '');
        
        // Forcer la mise à jour du nom du site dans tous les éléments
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
        siteNameElements.forEach(el => {
          el.textContent = settings.siteName;
        });
        
        // Déclencher l'événement de mise à jour
        const event = new CustomEvent('websiteSettingsUpdated', { detail: settings });
        window.dispatchEvent(event);
        
        console.log('⚙️ Paramètres synchronisés avec succès');
      } catch (error) {
        console.error('Erreur sync paramètres:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Synchronisation immédiate
    syncSettingsChanges();

    // Polling très fréquent
    const interval = setInterval(syncSettingsChanges, 100);

    // Écouter les changements
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteSettings') {
        setTimeout(syncSettingsChanges, 5);
      }
    };

    const handleSettingsSaved = () => {
      setTimeout(syncSettingsChanges, 5);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(syncSettingsChanges, 10);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);
    window.addEventListener('websiteSettingsUpdated', handleSettingsSaved);
    window.addEventListener('focus', () => setTimeout(syncSettingsChanges, 10));
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
      window.removeEventListener('websiteSettingsUpdated', handleSettingsSaved);
      window.removeEventListener('focus', () => setTimeout(syncSettingsChanges, 10));
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncSettingsChanges]);

  return { syncSettingsChanges };
};
