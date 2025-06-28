
import { useEffect, useCallback } from 'react';

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

export const useWebsiteDesignSync = () => {
  const applyDesignStyles = useCallback((design: SiteDesign) => {
    const root = document.documentElement;
    const style = document.createElement('style');
    style.id = 'website-design-sync-styles';
    
    // Supprimer le style précédent s'il existe
    const existingStyle = document.getElementById('website-design-sync-styles');
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
      
      /* Appliquer aux boutons du front */
      .front-button {
        background-color: ${design.primaryColor} !important;
        color: white !important;
      }
      
      .front-button:hover {
        background-color: ${design.secondaryColor} !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Déclencher l'événement de mise à jour
    const event = new CustomEvent('websiteDesignUpdated', { detail: design });
    window.dispatchEvent(event);
    
    console.log('🎨 Design synchronisé et appliqué:', design);
  }, []);

  const syncDesignChanges = useCallback(() => {
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        const design: SiteDesign = JSON.parse(savedDesign);
        applyDesignStyles(design);
      } catch (error) {
        console.error('Erreur sync design:', error);
      }
    }
  }, [applyDesignStyles]);

  useEffect(() => {
    // Synchroniser immédiatement au démarrage
    syncDesignChanges();

    // Polling plus fréquent pour vérifier les changements
    const interval = setInterval(syncDesignChanges, 500);

    // Écouter les changements localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        setTimeout(syncDesignChanges, 10);
      }
    };

    // Écouter les événements personnalisés
    const handleDesignSaved = () => {
      setTimeout(syncDesignChanges, 10);
    };

    // Écouter les événements de focus/visibilité pour resynchroniser
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(syncDesignChanges, 50);
      }
    };

    const handleFocus = () => {
      setTimeout(syncDesignChanges, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
