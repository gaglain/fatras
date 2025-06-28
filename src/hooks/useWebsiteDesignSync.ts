
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
    console.log('🎨 Applying design styles:', design);
    
    const root = document.documentElement;
    
    // Supprimer les anciens styles
    const existingStyle = document.getElementById('website-design-sync-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Créer et injecter les nouveaux styles
    const style = document.createElement('style');
    style.id = 'website-design-sync-styles';
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
      
      /* Application immédiate des styles */
      .front-header, [data-theme-element="header"], header {
        background: ${design.headerBg} !important;
      }
      
      .front-footer, [data-theme-element="footer"], footer {
        background: ${design.footerBg} !important;
      }
      
      .front-text, [data-theme-element="text"], body {
        color: ${design.textColor} !important;
      }
      
      .front-link, [data-theme-element="link"], a {
        color: ${design.linkColor} !important;
      }
      
      .front-primary, [data-theme-element="primary"] {
        background-color: ${design.primaryColor} !important;
      }
      
      .front-secondary, [data-theme-element="secondary"] {
        background-color: ${design.secondaryColor} !important;
      }
      
      /* Boutons */
      .front-button, button[class*="bg-"] {
        background-color: ${design.primaryColor} !important;
        color: white !important;
      }
      
      .front-button:hover, button[class*="bg-"]:hover {
        background-color: ${design.secondaryColor} !important;
      }

      /* Logo dans le header */
      .site-logo {
        content: url('${design.logo}') !important;
        max-height: 40px !important;
        width: auto !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Mettre à jour le titre de la page
    if (design.siteName) {
      document.title = design.siteName;
    }
    
    // Forcer le rafraîchissement des éléments
    const elementsToUpdate = document.querySelectorAll('[data-theme-element], .front-header, .front-footer, .front-text, .front-link, .site-logo');
    elementsToUpdate.forEach(el => {
      (el as HTMLElement).style.transition = 'all 0.3s ease';
    });
    
    // Déclencher l'événement de mise à jour
    const event = new CustomEvent('websiteDesignUpdated', { detail: design });
    window.dispatchEvent(event);
    
    console.log('🎨 Design appliqué avec succès');
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
    // Synchronisation immédiate
    syncDesignChanges();

    // Polling très fréquent
    const interval = setInterval(syncDesignChanges, 100);

    // Écouter tous les événements possibles
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        setTimeout(syncDesignChanges, 5);
      }
    };

    const handleDesignSaved = () => {
      setTimeout(syncDesignChanges, 5);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(syncDesignChanges, 10);
      }
    };

    const handleFocus = () => {
      setTimeout(syncDesignChanges, 10);
    };

    // Observer les mutations DOM pour détecter les changements
    const observer = new MutationObserver(() => {
      setTimeout(syncDesignChanges, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style']
    });

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteDesignUpdated', handleDesignSaved);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
