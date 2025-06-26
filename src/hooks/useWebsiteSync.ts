
import { useEffect } from 'react';

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  textColor: string;
  linkColor: string;
}

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

export const useWebsiteSync = () => {
  useEffect(() => {
    const syncDesignChanges = () => {
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        try {
          const design: SiteDesign = JSON.parse(savedDesign);
          
          // Appliquer les couleurs CSS immédiatement
          const root = document.documentElement;
          root.style.setProperty('--site-primary-color', design.primaryColor);
          root.style.setProperty('--site-secondary-color', design.secondaryColor);
          root.style.setProperty('--site-accent-color', design.accentColor);
          root.style.setProperty('--site-text-color', design.textColor);
          root.style.setProperty('--site-link-color', design.linkColor);
          
          // Déclencher l'événement de mise à jour
          window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: design }));
          
          console.log('🎨 Design synchronisé:', design);
        } catch (error) {
          console.error('Erreur sync design:', error);
        }
      }
    };

    const syncSettingsChanges = () => {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        try {
          const settings: WebsiteSettings = JSON.parse(savedSettings);
          
          // Mettre à jour le titre
          document.title = settings.siteName || 'MusiConnect';
          
          // Déclencher l'événement de mise à jour
          window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: settings }));
          
          console.log('⚙️ Paramètres synchronisés:', settings);
        } catch (error) {
          console.error('Erreur sync paramètres:', error);
        }
      }
    };

    // Synchroniser au démarrage
    syncDesignChanges();
    syncSettingsChanges();

    // Écouter les changements localStorage (entre onglets)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        console.log('📡 Changement design détecté');
        syncDesignChanges();
      } else if (event.key === 'websiteSettings') {
        console.log('📡 Changement paramètres détecté');
        syncSettingsChanges();
      }
    };

    // Écouter les événements personnalisés (même onglet)
    const handleDesignSaved = () => {
      console.log('💾 Design sauvegardé - synchronisation...');
      setTimeout(syncDesignChanges, 100);
    };

    const handleSettingsSaved = () => {
      console.log('💾 Paramètres sauvegardés - synchronisation...');
      setTimeout(syncSettingsChanges, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
    };
  }, []);
};
