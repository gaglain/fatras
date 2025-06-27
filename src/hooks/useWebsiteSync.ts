
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
          
          // Appliquer les couleurs CSS immédiatement avec force
          const root = document.documentElement;
          root.style.setProperty('--site-primary-color', design.primaryColor, 'important');
          root.style.setProperty('--site-secondary-color', design.secondaryColor, 'important');
          root.style.setProperty('--site-accent-color', design.accentColor, 'important');
          root.style.setProperty('--site-text-color', design.textColor, 'important');
          root.style.setProperty('--site-link-color', design.linkColor, 'important');
          
          // Forcer un repaint de la page
          document.body.style.display = 'none';
          document.body.offsetHeight; // Trigger reflow
          document.body.style.display = '';
          
          // Déclencher l'événement de mise à jour
          const event = new CustomEvent('websiteDesignUpdated', { detail: design });
          window.dispatchEvent(event);
          
          console.log('🎨 Design synchronisé et appliqué avec force:', design);
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
          const event = new CustomEvent('websiteSettingsUpdated', { detail: settings });
          window.dispatchEvent(event);
          
          console.log('⚙️ Paramètres synchronisés:', settings);
        } catch (error) {
          console.error('Erreur sync paramètres:', error);
        }
      }
    };

    // Synchroniser au démarrage avec un délai
    setTimeout(() => {
      syncDesignChanges();
      syncSettingsChanges();
    }, 100);

    // Polling pour vérifier les changements
    const interval = setInterval(() => {
      syncDesignChanges();
      syncSettingsChanges();
    }, 1000);

    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        console.log('📡 Changement design détecté via storage');
        syncDesignChanges();
      } else if (event.key === 'websiteSettings') {
        console.log('📡 Changement paramètres détecté via storage');
        syncSettingsChanges();
      }
    };

    // Écouter les événements personnalisés
    const handleDesignSaved = () => {
      console.log('💾 Design sauvegardé - synchronisation forcée...');
      setTimeout(syncDesignChanges, 100);
    };

    const handleSettingsSaved = () => {
      console.log('💾 Paramètres sauvegardés - synchronisation forcée...');
      setTimeout(syncSettingsChanges, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);
    window.addEventListener('focus', syncDesignChanges);
    window.addEventListener('focus', syncSettingsChanges);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
      window.removeEventListener('focus', syncDesignChanges);
      window.removeEventListener('focus', syncSettingsChanges);
    };
  }, []);
};
