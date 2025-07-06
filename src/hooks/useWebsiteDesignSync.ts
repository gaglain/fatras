
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
    console.log('🎨 Applying website design styles:', design);
    
    // Supprimer l'ancien style
    const existingStyle = document.getElementById('website-design-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Créer et injecter les nouveaux styles
    const style = document.createElement('style');
    style.id = 'website-design-styles';
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
      
      /* Styles pour les pages publiques */
      .front-header, [data-theme-element="header"] {
        background: ${design.headerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .front-footer, [data-theme-element="footer"] {
        background: ${design.footerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .front-text, [data-theme-element="text"] {
        color: ${design.textColor} !important;
      }
      
      .front-link, [data-theme-element="link"], .front-navigation a {
        color: ${design.linkColor} !important;
      }
      
      .front-button, .front-primary {
        background-color: ${design.primaryColor} !important;
        color: white !important;
      }
      
      .front-button:hover {
        background-color: ${design.secondaryColor} !important;
      }

      /* Logo et nom du site */
      .site-logo {
        max-height: 40px !important;
        width: auto !important;
        display: block !important;
      }
      
      .site-name, [data-site-name] {
        color: ${design.textColor} !important;
        font-weight: bold !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Mettre à jour le titre
    if (design.siteName) {
      document.title = design.siteName;
    }
    
    // Mettre à jour les éléments du logo et nom
    const logoElements = document.querySelectorAll('.site-logo');
    logoElements.forEach(el => {
      const imgEl = el as HTMLImageElement;
      if (design.logo) {
        imgEl.src = design.logo;
        imgEl.style.display = 'block';
      }
    });
    
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
    siteNameElements.forEach(el => {
      el.textContent = design.siteName;
    });
    
    console.log('✅ Website design applied successfully');
  }, []);

  const syncDesignChanges = useCallback(() => {
    try {
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design: SiteDesign = JSON.parse(savedDesign);
        console.log('🔄 Syncing website design changes:', design);
        applyDesignStyles(design);
        return true;
      } else {
        console.log('📭 No website design found in localStorage');
      }
      return false;
    } catch (error) {
      console.error('❌ Error syncing website design:', error);
      return false;
    }
  }, [applyDesignStyles]);

  useEffect(() => {
    console.log('🚀 Website design sync hook initialized');
    
    // Synchronisation immédiate
    syncDesignChanges();

    // Écouter les changements
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign') {
        console.log('💾 Website design storage change detected');
        setTimeout(syncDesignChanges, 50);
      }
    };

    const handleDesignSaved = () => {
      console.log('🎨 Website design saved event detected');
      setTimeout(syncDesignChanges, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteDesignUpdated', handleDesignSaved);
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
