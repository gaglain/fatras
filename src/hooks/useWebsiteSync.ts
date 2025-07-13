
import { useEffect, useCallback, useRef } from 'react';

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

export const useWebsiteSync = () => {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  const loadData = useCallback(() => {
    let settings: WebsiteSettings | null = null;
    let design: SiteDesign | null = null;

    // Charger les paramètres
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('❌ Error loading settings:', error);
      }
    }

    // Charger le design
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        design = JSON.parse(savedDesign);
      } catch (error) {
        console.error('❌ Error loading design:', error);
      }
    }

    return { settings, design };
  }, []);

  const applyStyles = useCallback((design: SiteDesign) => {
    // Supprimer les anciens styles
    if (styleElementRef.current) {
      styleElementRef.current.remove();
    }
    document.querySelectorAll('#website-sync-styles').forEach(el => el.remove());

    // Créer les nouveaux styles
    const style = document.createElement('style');
    style.id = 'website-sync-styles';
    styleElementRef.current = style;

    style.innerHTML = `
      :root {
        --site-primary-color: ${design.primaryColor} !important;
        --site-secondary-color: ${design.secondaryColor} !important;
        --site-text-color: ${design.textColor} !important;
        --site-link-color: ${design.linkColor} !important;
        --site-header-bg: ${design.headerBg} !important;
        --site-footer-bg: ${design.footerBg} !important;
      }
      
      .front-header, [data-theme-element="header"], header {
        background: ${design.headerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .site-name, [data-site-name] {
        color: ${design.textColor} !important;
        font-weight: bold !important;
      }
      
      .front-link, [data-theme-element="link"], nav a {
        color: ${design.linkColor} !important;
      }
      
      .site-logo {
        max-height: 40px !important;
        width: auto !important;
        display: ${design.logo ? 'block' : 'none'} !important;
      }
    `;

    document.head.appendChild(style);
    console.log('✅ Styles applied:', design.siteName);
  }, []);

  const updateDOM = useCallback((siteName: string, logo?: string) => {
    // Mettre à jour le titre
    if (document.title !== siteName) {
      document.title = siteName;
    }

    // Mettre à jour les éléments du nom du site
    document.querySelectorAll('.site-name, [data-site-name]').forEach(el => {
      if (el.textContent !== siteName) {
        el.textContent = siteName;
      }
    });

    // Mettre à jour les logos
    if (logo) {
      document.querySelectorAll('.site-logo').forEach(el => {
        const img = el as HTMLImageElement;
        if (img.src !== logo) {
          img.src = logo;
          img.style.display = 'block';
        }
      });
    }
  }, []);

  const sync = useCallback(() => {
    console.log('🔄 Starting website sync');
    const { settings, design } = loadData();
    
    const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
    
    // Appliquer les styles
    if (design) {
      applyStyles(design);
    }
    
    // Mettre à jour le DOM
    updateDOM(finalSiteName, design?.logo);
    
    console.log('✅ Sync completed for:', finalSiteName);
  }, [loadData, applyStyles, updateDOM]);

  useEffect(() => {
    // Sync initial
    sync();

    // Écouter les changements
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected:', event.key);
        setTimeout(sync, 100);
      }
    };

    const handleCustomEvents = () => {
      console.log('🎉 Custom event detected');
      setTimeout(sync, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvents);
    window.addEventListener('websiteDesignSaved', handleCustomEvents);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvents);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvents);
      window.removeEventListener('websiteDesignSaved', handleCustomEvents);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvents);
      if (styleElementRef.current) {
        styleElementRef.current.remove();
      }
    };
  }, [sync]);

  return { sync };
};
