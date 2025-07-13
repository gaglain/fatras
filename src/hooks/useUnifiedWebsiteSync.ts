
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

export const useUnifiedWebsiteSync = () => {
  const location = useLocation();
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  const isFrontendPage = location.pathname.startsWith('/front');

  const applyStylesAndContent = useCallback(() => {
    // Ne s'exécuter QUE sur les pages frontend
    if (!isFrontendPage) {
      console.log('🚫 Not on frontend page, skipping sync');
      return;
    }

    console.log('🔄 Starting unified sync for frontend page');

    // Charger les données
    let settings: WebsiteSettings | null = null;
    let design: SiteDesign | null = null;

    try {
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
      }

      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        design = JSON.parse(savedDesign);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      return;
    }

    if (!design && !settings) {
      console.log('⚠️ No data found to sync');
      return;
    }

    const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
    const finalLogo = design?.logo || '';

    // 1. Appliquer les styles CSS
    if (design) {
      // Supprimer les anciens styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
      }
      document.querySelectorAll('#unified-sync-styles').forEach(el => el.remove());

      // Créer les nouveaux styles
      const style = document.createElement('style');
      style.id = 'unified-sync-styles';
      styleElementRef.current = style;

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
        
        /* Styles spécifiques aux pages frontend */
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
          font-size: 1.25rem !important;
        }
        
        .front-link, [data-theme-element="link"], .front-navigation a {
          color: ${design.linkColor} !important;
        }
        
        .site-logo {
          max-height: 40px !important;
          width: auto !important;
          display: ${design.logo ? 'block' : 'none'} !important;
        }
      `;

      document.head.appendChild(style);
      console.log('✅ Styles applied for:', finalSiteName);
    }

    // 2. Mettre à jour le titre de la page
    if (document.title !== finalSiteName) {
      document.title = finalSiteName;
      console.log('📄 Title updated to:', finalSiteName);
    }

    // 3. Mettre à jour tous les éléments du nom du site
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
    siteNameElements.forEach(el => {
      if (el.textContent !== finalSiteName) {
        el.textContent = finalSiteName;
        console.log('📝 Site name element updated');
      }
    });

    // 4. Mettre à jour tous les logos
    if (finalLogo) {
      const logoElements = document.querySelectorAll('.site-logo');
      logoElements.forEach(el => {
        const img = el as HTMLImageElement;
        if (img.src !== finalLogo) {
          img.src = finalLogo;
          img.style.display = 'block';
          console.log('🖼️ Logo updated');
        }
      });
    }

    console.log('✅ Unified sync completed');
  }, [isFrontendPage]);

  const cleanup = useCallback(() => {
    if (styleElementRef.current) {
      styleElementRef.current.remove();
      styleElementRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Si on n'est pas sur une page frontend, nettoyer et sortir
    if (!isFrontendPage) {
      cleanup();
      return;
    }

    // Sync initial
    applyStylesAndContent();

    // Écouter TOUS les événements possibles
    const handleChange = () => {
      console.log('📡 Change detected, resyncing...');
      setTimeout(applyStylesAndContent, 50);
    };

    // Storage events
    window.addEventListener('storage', handleChange);
    
    // Custom events
    window.addEventListener('websiteDesignUpdated', handleChange);
    window.addEventListener('websiteDesignSaved', handleChange);
    window.addEventListener('websiteSettingsUpdated', handleChange);
    window.addEventListener('websiteSettingsSaved', handleChange);

    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('websiteDesignUpdated', handleChange);
      window.removeEventListener('websiteDesignSaved', handleChange);
      window.removeEventListener('websiteSettingsUpdated', handleChange);
      window.removeEventListener('websiteSettingsSaved', handleChange);
      cleanup();
    };
  }, [applyStylesAndContent, cleanup, isFrontendPage]);

  return { sync: applyStylesAndContent };
};
