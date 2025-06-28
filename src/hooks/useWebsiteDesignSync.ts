
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
      
      /* Header fixe et styles forcés */
      .front-header, [data-theme-element="header"], header, nav {
        background: ${design.headerBg} !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        z-index: 50 !important;
        width: 100% !important;
      }
      
      /* Compensation pour le header fixe */
      body {
        padding-top: 80px !important;
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

      /* Logo forcé */
      .site-logo, img[alt="Logo"] {
        content: url('${design.logo}') !important;
        max-height: 40px !important;
        width: auto !important;
        display: block !important;
      }
      
      /* Nom du site forcé */
      .site-name, [data-site-name] {
        color: ${design.textColor} !important;
        font-weight: bold !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Mettre à jour le titre de la page immédiatement
    if (design.siteName) {
      document.title = design.siteName;
    }
    
    // Forcer le rafraîchissement des éléments existants
    const elementsToUpdate = document.querySelectorAll('[data-theme-element], .front-header, .front-footer, .front-text, .front-link, .site-logo, .site-name');
    elementsToUpdate.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = 'all 0.3s ease';
      // Forcer le repaint
      htmlEl.offsetHeight;
    });
    
    // Forcer les éléments du nom du site
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
    siteNameElements.forEach(el => {
      el.textContent = design.siteName;
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

    // Polling ultra-fréquent
    const interval = setInterval(syncDesignChanges, 50);

    // Écouter tous les événements possibles
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        setTimeout(syncDesignChanges, 1);
      }
    };

    const handleDesignSaved = () => {
      setTimeout(syncDesignChanges, 1);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setTimeout(syncDesignChanges, 1);
      }
    };

    const handleFocus = () => {
      setTimeout(syncDesignChanges, 1);
    };

    // Observer les mutations DOM agressivement
    const observer = new MutationObserver(() => {
      setTimeout(syncDesignChanges, 10);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme-element']
    });

    // Observer les changements sur le head aussi
    const headObserver = new MutationObserver(() => {
      setTimeout(syncDesignChanges, 10);
    });

    headObserver.observe(document.head, {
      childList: true,
      subtree: true
    });

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleFocus);
    window.addEventListener('DOMContentLoaded', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      observer.disconnect();
      headObserver.disconnect();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteDesignUpdated', handleDesignSaved);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('load', handleFocus);
      window.removeEventListener('DOMContentLoaded', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
