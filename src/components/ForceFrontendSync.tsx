import React, { useEffect } from 'react';

export const ForceFrontendSync: React.FC = () => {
  useEffect(() => {
    console.log('🔧 FORCE SYNC - Starting IMMEDIATE sync');
    
    const applySyncNow = () => {
      try {
        // 1. Charger les données depuis localStorage
        const savedDesign = localStorage.getItem('websiteDesign');
        const savedSettings = localStorage.getItem('websiteSettings');
        
        let siteName = 'MusiConnect'; // valeur par défaut
        let design: any = null;
        
        // Priorité au design
        if (savedDesign) {
          try {
            design = JSON.parse(savedDesign);
            if (design?.siteName) {
              siteName = design.siteName;
              console.log('✅ FORCE SYNC - Design loaded, siteName:', siteName);
            }
          } catch (e) {
            console.error('❌ FORCE SYNC - Design parse error:', e);
          }
        }
        
        // Fallback vers settings
        if (!design?.siteName && savedSettings) {
          try {
            const settings = JSON.parse(savedSettings);
            if (settings?.siteName) {
              siteName = settings.siteName;
              console.log('✅ FORCE SYNC - Settings loaded, siteName:', siteName);
            }
          } catch (e) {
            console.error('❌ FORCE SYNC - Settings parse error:', e);
          }
        }
        
        console.log('🎯 FORCE SYNC - Final siteName:', siteName);
        
        // 2. FORCER le titre de la page
        if (document.title !== siteName) {
          document.title = siteName;
          console.log('📄 FORCE SYNC - Title updated to:', siteName);
        }
        
        // 3. FORCER la mise à jour de TOUS les éléments du nom du site
        const updateSiteNameElements = () => {
          const selectors = [
            '.site-name',
            '[data-site-name]',
            '[class*="site-name"]'
          ];
          
          selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            console.log(`🔍 FORCE SYNC - Found ${elements.length} elements for selector: ${selector}`);
            
            elements.forEach((el, index) => {
              if (el.textContent !== siteName) {
                el.textContent = siteName;
                console.log(`✅ FORCE SYNC - Updated element ${index + 1} to: ${siteName}`);
              }
            });
          });
        };
        
        // 4. Appliquer les styles si design disponible
        if (design) {
          const applyDesignStyles = () => {
            // Supprimer l'ancien style
            document.querySelectorAll('#force-frontend-styles').forEach(el => el.remove());
            
            const style = document.createElement('style');
            style.id = 'force-frontend-styles';
            style.innerHTML = `
              :root {
                --force-primary: ${design.primaryColor || '#1632f4'} !important;
                --force-secondary: ${design.secondaryColor || '#ec5f65'} !important;
                --force-header-bg: ${design.headerBg || '#ffffff'} !important;
                --force-text: ${design.textColor || '#1f2937'} !important;
                --force-link: ${design.linkColor || '#3b82f6'} !important;
              }
              
              /* FORCE application des styles */
              .front-header, header[data-theme-element="header"] {
                background: ${design.headerBg || '#ffffff'} !important;
                color: ${design.textColor || '#1f2937'} !important;
                border-color: ${design.borderColor || '#e5e7eb'} !important;
              }
              
              .front-link, a[data-theme-element="link"], nav a {
                color: ${design.linkColor || '#3b82f6'} !important;
              }
              
              .site-name, [data-site-name] {
                color: ${design.textColor || '#1f2937'} !important;
                font-weight: bold !important;
                font-size: 1.25rem !important;
              }
              
              /* FORCE hero section */
              .hero-section {
                background: linear-gradient(135deg, ${design.primaryColor || '#1632f4'}, ${design.secondaryColor || '#ec5f65'}) !important;
                color: white !important;
              }
            `;
            
            document.head.appendChild(style);
            console.log('🎨 FORCE SYNC - Styles applied with colors:', design.primaryColor, design.secondaryColor);
          };
          
          applyDesignStyles();
        }
        
        // 5. Appliquer les changements plusieurs fois pour être sûr
        updateSiteNameElements();
        setTimeout(updateSiteNameElements, 100);
        setTimeout(updateSiteNameElements, 500);
        setTimeout(updateSiteNameElements, 1000);
        
        console.log('✅ FORCE SYNC - All changes applied successfully');
        
      } catch (error) {
        console.error('❌ FORCE SYNC - Error:', error);
      }
    };
    
    // Application immédiate
    applySyncNow();
    
    // Écouter les changements
    const handleDataChange = (event?: any) => {
      console.log('📡 FORCE SYNC - Data change detected:', event?.type || 'manual');
      setTimeout(applySyncNow, 50);
    };
    
    // Écouter TOUS les événements possibles
    window.addEventListener('storage', handleDataChange);
    window.addEventListener('websiteDesignUpdated', handleDataChange);
    window.addEventListener('websiteDesignSaved', handleDataChange);
    window.addEventListener('websiteSettingsUpdated', handleDataChange);
    
    // Nettoyage
    return () => {
      console.log('🧹 FORCE SYNC - Cleanup');
      window.removeEventListener('storage', handleDataChange);
      window.removeEventListener('websiteDesignUpdated', handleDataChange);
      window.removeEventListener('websiteDesignSaved', handleDataChange);
      window.removeEventListener('websiteSettingsUpdated', handleDataChange);
    };
  }, []);
  
  return null;
};