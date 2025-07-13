
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();
  
  // Vérifier si on est sur une page frontend
  const isFrontendPage = location.pathname.startsWith('/front');

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
    // NE PAS appliquer les styles si on n'est pas sur une page frontend
    if (!isFrontendPage) {
      console.log('🚫 Styles not applied - not on frontend page');
      return;
    }

    // Supprimer les anciens styles
    if (styleElementRef.current) {
      styleElementRef.current.remove();
    }
    document.querySelectorAll('#website-sync-styles').forEach(el => el.remove());

    // Créer les nouveaux styles SEULEMENT pour les pages frontend
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
      
      /* SEULEMENT pour les éléments frontend avec classes spécifiques */
      .front-header, [data-theme-element="header"] {
        background: ${design.headerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .front-footer, [data-theme-element="footer"] {
        background: ${design.footerBg} !important;
        color: ${design.textColor} !important;
      }
      
      .site-name, [data-site-name] {
        color: ${design.textColor} !important;
        font-weight: bold !important;
      }
      
      .front-link, [data-theme-element="link"] {
        color: ${design.linkColor} !important;
      }
      
      .site-logo {
        max-height: 40px !important;
        width: auto !important;
        display: ${design.logo ? 'block' : 'none'} !important;
      }
    `;

    document.head.appendChild(style);
    console.log('✅ Frontend styles applied:', design.siteName);
  }, [isFrontendPage]);

  const updateDOM = useCallback((siteName: string, logo?: string) => {
    // NE PAS modifier le DOM si on n'est pas sur une page frontend
    if (!isFrontendPage) {
      console.log('🚫 DOM not updated - not on frontend page');
      return;
    }

    // Mettre à jour le titre SEULEMENT pour les pages frontend
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
  }, [isFrontendPage]);

  const sync = useCallback(() => {
    // NE synchroniser QUE si on est sur une page frontend
    if (!isFrontendPage) {
      console.log('🚫 Sync skipped - not on frontend page');
      return;
    }

    console.log('🔄 Starting frontend website sync');
    const { settings, design } = loadData();
    
    const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
    
    // Appliquer les styles
    if (design) {
      applyStyles(design);
    }
    
    // Mettre à jour le DOM
    updateDOM(finalSiteName, design?.logo);
    
    console.log('✅ Frontend sync completed for:', finalSiteName);
  }, [isFrontendPage, loadData, applyStyles, updateDOM]);

  const cleanup = useCallback(() => {
    if (styleElementRef.current) {
      styleElementRef.current.remove();
      styleElementRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Nettoyer les styles existants si on quitte une page frontend
    if (!isFrontendPage) {
      cleanup();
      return;
    }

    // Sync initial seulement si on est sur une page frontend
    sync();

    // Écouter les changements seulement si on est sur une page frontend
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

    if (isFrontendPage) {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('websiteDesignUpdated', handleCustomEvents);
      window.addEventListener('websiteDesignSaved', handleCustomEvents);
      window.addEventListener('websiteSettingsUpdated', handleCustomEvents);
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvents);
      window.removeEventListener('websiteDesignSaved', handleCustomEvents);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvents);
      cleanup();
    };
  }, [sync, cleanup, isFrontendPage]);

  return { sync };
};
