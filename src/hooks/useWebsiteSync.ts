
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
          
          // Appliquer les couleurs CSS avec force et priorité maximale
          const root = document.documentElement;
          const style = document.createElement('style');
          style.id = 'website-sync-styles';
          
          // Supprimer le style précédent s'il existe
          const existingStyle = document.getElementById('website-sync-styles');
          if (existingStyle) {
            existingStyle.remove();
          }
          
          // Créer des styles avec !important pour forcer l'application
          style.innerHTML = `
            :root {
              --site-primary-color: ${design.primaryColor} !important;
              --site-secondary-color: ${design.secondaryColor} !important;
              --site-accent-color: ${design.accentColor} !important;
              --site-text-color: ${design.textColor} !important;
              --site-link-color: ${design.linkColor} !important;
              --site-header-bg: ${design.headerBg} !important;
              --site-footer-bg: ${design.footerBg} !important;
            }
            
            /* Forcer l'application sur les éléments spécifiques */
            .front-header, [data-theme-element="header"] {
              background-color: ${design.headerBg} !important;
            }
            
            .front-footer, [data-theme-element="footer"] {
              background-color: ${design.footerBg} !important;
            }
            
            .front-text, [data-theme-element="text"] {
              color: ${design.textColor} !important;
            }
            
            .front-link, [data-theme-element="link"] {
              color: ${design.linkColor} !important;
            }
            
            .front-primary, [data-theme-element="primary"] {
              background-color: ${design.primaryColor} !important;
            }
            
            .front-secondary, [data-theme-element="secondary"] {
              background-color: ${design.secondaryColor} !important;
            }
          `;
          
          document.head.appendChild(style);
          
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

    const syncLegalContent = () => {
      const savedContent = localStorage.getItem('legalContent');
      if (savedContent) {
        try {
          const content = JSON.parse(savedContent);
          const event = new CustomEvent('legalContentUpdated', { detail: content });
          window.dispatchEvent(event);
          console.log('📄 Contenu légal synchronisé:', content);
        } catch (error) {
          console.error('Erreur sync contenu légal:', error);
        }
      }
    };

    // Fonction de synchronisation complète
    const performFullSync = () => {
      syncDesignChanges();
      syncSettingsChanges();
      syncLegalContent();
    };

    // Synchroniser immédiatement au démarrage
    setTimeout(performFullSync, 100);

    // Polling plus fréquent pour vérifier les changements
    const interval = setInterval(performFullSync, 1000);

    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      console.log('📡 Changement localStorage détecté:', event.key);
      if (event.key === 'websiteDesign') {
        setTimeout(syncDesignChanges, 50);
      } else if (event.key === 'websiteSettings') {
        setTimeout(syncSettingsChanges, 50);
      } else if (event.key === 'legalContent') {
        setTimeout(syncLegalContent, 50);
      }
    };

    // Écouter les événements personnalisés
    const handleDesignSaved = () => {
      console.log('💾 Design sauvegardé - synchronisation forcée...');
      setTimeout(syncDesignChanges, 50);
    };

    const handleSettingsSaved = () => {
      console.log('💾 Paramètres sauvegardés - synchronisation forcée...');
      setTimeout(syncSettingsChanges, 50);
    };

    const handleLegalSaved = () => {
      console.log('💾 Contenu légal sauvegardé - synchronisation forcée...');
      setTimeout(syncLegalContent, 50);
    };

    // Écouter les événements de focus/visibilité pour resynchroniser
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(performFullSync, 100);
      }
    };

    const handleFocus = () => {
      setTimeout(performFullSync, 100);
    };

    // Écouter les événements de navigation
    const handleHashChange = () => {
      setTimeout(performFullSync, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteSettingsSaved', handleSettingsSaved);
    window.addEventListener('legalContentSaved', handleLegalSaved);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('hashchange', handleHashChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteSettingsSaved', handleSettingsSaved);
      window.removeEventListener('legalContentSaved', handleLegalSaved);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('hashchange', handleHashChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
};
