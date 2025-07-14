import React, { useEffect } from 'react';

interface SiteDesign {
  logo: string;
  siteName: string;
  primaryColor: string;
  secondaryColor: string;
  headerBg: string;
  textColor: string;
  linkColor: string;
}

export const ForceFrontendSync: React.FC = () => {
  useEffect(() => {
    console.log('🔧 Force Frontend Sync - Activating IMMEDIATE sync');
    
    const forceUpdate = () => {
      // Charger les données
      const savedDesign = localStorage.getItem('websiteDesign');
      const savedSettings = localStorage.getItem('websiteSettings');
      
      let siteName = 'MusiConnect';
      let design: SiteDesign | null = null;
      
      if (savedDesign) {
        try {
          design = JSON.parse(savedDesign);
          if (design?.siteName) siteName = design.siteName;
        } catch (e) {
          console.error('Design parse error:', e);
        }
      } else if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings?.siteName) siteName = settings.siteName;
        } catch (e) {
          console.error('Settings parse error:', e);
        }
      }
      
      console.log('🔧 Force sync - Site name:', siteName);
      
      // FORCER la mise à jour du titre
      document.title = siteName;
      
      // FORCER la mise à jour des éléments DOM
      const updateElements = () => {
        // Mettre à jour TOUS les éléments du nom du site
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name], [class*="site-name"]');
        console.log('🔧 Found site name elements:', siteNameElements.length);
        siteNameElements.forEach((el) => {
          if (el.textContent !== siteName) {
            el.textContent = siteName;
            console.log('🔧 Updated site name element to:', siteName);
          }
        });
        
        // Mettre à jour le logo si disponible
        if (design?.logo) {
          const logoElements = document.querySelectorAll('.site-logo, img[class*="logo"]');
          console.log('🔧 Found logo elements:', logoElements.length);
          logoElements.forEach((el) => {
            const imgEl = el as HTMLImageElement;
            if (imgEl.src !== design.logo) {
              imgEl.src = design.logo;
              imgEl.style.display = 'block';
              console.log('🔧 Updated logo element');
            }
          });
        }
      };
      
      // Appliquer plusieurs fois pour être sûr
      updateElements();
      setTimeout(updateElements, 100);
      setTimeout(updateElements, 500);
      setTimeout(updateElements, 1000);
      
      // FORCER l'application des styles
      if (design) {
        // Supprimer l'ancien style
        document.querySelectorAll('#force-frontend-styles').forEach(style => style.remove());
        
        const style = document.createElement('style');
        style.id = 'force-frontend-styles';
        style.innerHTML = `
          :root {
            --frontend-primary: ${design.primaryColor} !important;
            --frontend-secondary: ${design.secondaryColor} !important;
            --frontend-header-bg: ${design.headerBg} !important;
            --frontend-text: ${design.textColor} !important;
            --frontend-link: ${design.linkColor} !important;
          }
          
          .front-header, [data-theme-element="header"], header {
            background: ${design.headerBg} !important;
            color: ${design.textColor} !important;
          }
          
          .front-link, [data-theme-element="link"], .front-navigation a, nav a {
            color: ${design.linkColor} !important;
          }
          
          .site-name, [data-site-name] {
            color: ${design.textColor} !important;
            font-weight: bold !important;
          }
        `;
        document.head.appendChild(style);
        console.log('🔧 Force styles applied');
      }
    };
    
    // Application immédiate
    forceUpdate();
    
    // Écouter les changements
    const handleDataChange = () => {
      console.log('🔧 Data change detected, forcing update');
      setTimeout(forceUpdate, 100);
    };
    
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('websiteDesignUpdated', handleDataChange);
    window.addEventListener('websiteDesignSaved', handleDataChange);
    window.addEventListener('websiteSettingsUpdated', handleDataChange);
    
    return () => {
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('websiteDesignUpdated', handleDataChange);
      window.removeEventListener('websiteDesignSaved', handleDataChange);
      window.removeEventListener('websiteSettingsUpdated', handleDataChange);
    };
  }, []);
  
  return null;
};