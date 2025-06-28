
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
        box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
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

      /* Logo forcé avec gestion d'erreur */
      .site-logo, img[alt="Logo"] {
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
      console.log('📝 Updated page title to:', design.siteName);
    }
    
    // Forcer la mise à jour du logo
    const logoElements = document.querySelectorAll('.site-logo, img[alt="Logo"]');
    logoElements.forEach(el => {
      const imgEl = el as HTMLImageElement;
      if (design.logo) {
        imgEl.src = design.logo;
        imgEl.style.display = 'block';
        console.log('🖼️ Updated logo to:', design.logo);
      }
    });
    
    // Forcer les éléments du nom du site
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
    siteNameElements.forEach(el => {
      el.textContent = design.siteName;
      (el as HTMLElement).style.color = design.textColor;
      console.log('🏷️ Updated site name to:', design.siteName);
    });
    
    // Forcer le rafraîchissement des éléments existants
    const elementsToUpdate = document.querySelectorAll('[data-theme-element], .front-header, .front-footer, .front-text, .front-link');
    elementsToUpdate.forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transition = 'all 0.3s ease';
      // Forcer le repaint
      htmlEl.offsetHeight;
    });
    
    // Déclencher l'événement de mise à jour
    const event = new CustomEvent('websiteDesignUpdated', { detail: design });
    window.dispatchEvent(event);
    
    console.log('✅ Design appliqué avec succès');
  }, []);

  const syncDesignChanges = useCallback(() => {
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        const design: SiteDesign = JSON.parse(savedDesign);
        console.log('🔄 Syncing design changes:', design);
        applyDesignStyles(design);
      } catch (error) {
        console.error('❌ Error sync design:', error);
      }
    } else {
      console.log('ℹ️ No saved design found in localStorage');
    }
  }, [applyDesignStyles]);

  useEffect(() => {
    console.log('🚀 Design sync hook initialized');
    
    // Synchronisation immédiate
    syncDesignChanges();

    // Polling très fréquent pour forcer la synchronisation
    const rapidSync = setInterval(syncDesignChanges, 100);

    // Écouter tous les événements possibles
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        console.log('💾 Storage change detected for websiteDesign');
        setTimeout(syncDesignChanges, 10);
      }
    };

    const handleDesignSaved = () => {
      console.log('🎨 Design saved event detected');
      setTimeout(syncDesignChanges, 10);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, syncing design');
        setTimeout(syncDesignChanges, 10);
      }
    };

    const handleFocus = () => {
      console.log('🔍 Window focused, syncing design');
      setTimeout(syncDesignChanges, 10);
    };

    // Observer les mutations DOM agressivement
    const observer = new MutationObserver((mutations) => {
      let shouldSync = false;
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.classList?.contains('site-logo') || 
                  element.classList?.contains('site-name') ||
                  element.hasAttribute('data-site-name') ||
                  element.hasAttribute('data-theme-element')) {
                shouldSync = true;
              }
            }
          });
        }
      });
      
      if (shouldSync) {
        console.log('🔄 DOM mutation detected, syncing design');
        setTimeout(syncDesignChanges, 50);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme-element', 'data-site-name']
    });

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('load', handleFocus);
    window.addEventListener('DOMContentLoaded', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Sync forcée après un délai initial
    setTimeout(syncDesignChanges, 500);
    setTimeout(syncDesignChanges, 1000);
    setTimeout(syncDesignChanges, 2000);

    return () => {
      clearInterval(rapidSync);
      observer.disconnect();
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
