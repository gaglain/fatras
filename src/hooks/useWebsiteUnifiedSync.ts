
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

export const useWebsiteUnifiedSync = () => {
  const lastSyncTime = useRef(0);
  const syncInProgress = useRef(false);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);
  const lastDataHash = useRef<string>('');

  const applyAllChanges = useCallback(async () => {
    const now = Date.now();
    
    // Throttle plus agressif pour les changements rapides
    if (syncInProgress.current || (now - lastSyncTime.current) < 100) {
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🚀 Starting unified website sync');
      
      // Charger les paramètres et design
      const savedSettings = localStorage.getItem('websiteSettings');
      const savedDesign = localStorage.getItem('websiteDesign');
      
      // Créer un hash pour détecter les vrais changements
      const currentDataHash = `${savedSettings || ''}-${savedDesign || ''}`;
      
      // Si les données n'ont pas changé, ne pas refaire la sync
      if (currentDataHash === lastDataHash.current && lastDataHash.current !== '') {
        console.log('🔄 No data changes detected, skipping sync');
        return;
      }
      
      lastDataHash.current = currentDataHash;
      
      let settings: WebsiteSettings | null = null;
      let design: SiteDesign | null = null;
      
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
        console.log('⚙️ Settings loaded:', settings?.siteName);
      }
      
      if (savedDesign) {
        design = JSON.parse(savedDesign);
        console.log('🎨 Design loaded:', design?.siteName, design?.logo ? 'with logo' : 'no logo');
      }
      
      // Déterminer le nom du site (priorité au design)
      const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
      console.log('🏷️ Final site name:', finalSiteName);
      
      // Mettre à jour le titre de la page immédiatement
      if (document.title !== finalSiteName) {
        document.title = finalSiteName;
        console.log('📄 Page title updated to:', finalSiteName);
      }
      
      // Mettre à jour la description meta
      if (settings?.siteDescription) {
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
          metaDescription = document.createElement('meta');
          metaDescription.setAttribute('name', 'description');
          document.head.appendChild(metaDescription);
        }
        metaDescription.setAttribute('content', settings.siteDescription);
        console.log('📝 Meta description updated');
      }
      
      // Appliquer les styles CSS avec force
      if (design) {
        // Nettoyer TOUS les anciens styles
        if (styleElementRef.current) {
          styleElementRef.current.remove();
          styleElementRef.current = null;
        }
        
        // Supprimer tous les styles existants avec cet ID
        document.querySelectorAll('#unified-website-styles').forEach(style => style.remove());
        
        // Créer le nouveau style avec !important partout
        const style = document.createElement('style');
        style.id = 'unified-website-styles';
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
          
          .front-header, [data-theme-element="header"], header {
            background: ${design.headerBg} !important;
            color: ${design.textColor} !important;
          }
          
          .front-footer, [data-theme-element="footer"], footer {
            background: ${design.footerBg} !important;
            color: ${design.textColor} !important;
          }
          
          .front-text, [data-theme-element="text"] {
            color: ${design.textColor} !important;
          }
          
          .front-link, [data-theme-element="link"], .front-navigation a, nav a {
            color: ${design.linkColor} !important;
          }
          
          .front-button, .front-primary, button[class*="primary"] {
            background-color: ${design.primaryColor} !important;
            color: white !important;
          }
          
          .front-button:hover, button[class*="primary"]:hover {
            background-color: ${design.secondaryColor} !important;
          }

          .site-logo, img[class*="logo"] {
            max-height: 40px !important;
            width: auto !important;
            display: ${design.logo ? 'block' : 'none'} !important;
          }
          
          .site-name, [data-site-name], [class*="site-name"] {
            color: ${design.textColor} !important;
            font-weight: bold !important;
            font-size: 1.25rem !important;
          }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 CSS styles applied with force');
      }
      
      // Forcer la mise à jour des éléments DOM
      const updateAllElements = () => {
        // Mettre à jour tous les éléments du nom du site
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name], [class*="site-name"]');
        siteNameElements.forEach((el) => {
          if (el.textContent !== finalSiteName) {
            el.textContent = finalSiteName;
            console.log('📝 Site name element updated');
          }
        });
        
        // Mettre à jour tous les logos
        if (design?.logo) {
          const logoElements = document.querySelectorAll('.site-logo, img[class*="logo"]');
          logoElements.forEach((el) => {
            const imgEl = el as HTMLImageElement;
            if (imgEl.src !== design.logo) {
              imgEl.src = design.logo;
              imgEl.style.display = 'block';
              console.log('🖼️ Logo element updated');
            }
          });
        }
      };
      
      // Appliquer immédiatement
      updateAllElements();
      
      // Réappliquer après un court délai pour les éléments qui se chargent tard
      setTimeout(updateAllElements, 100);
      setTimeout(updateAllElements, 500);
      
      console.log('✅ Unified sync completed successfully');
      
    } catch (error) {
      console.error('❌ Unified sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 Unified website sync hook initialized');
    
    // Sync initial immédiat
    applyAllChanges();

    // Écouter TOUS les événements possibles de changement
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected for:', event.key);
        setTimeout(applyAllChanges, 50);
      }
    };

    const handleCustomEvents = () => {
      console.log('🎉 Custom event detected, forcing sync');
      setTimeout(applyAllChanges, 50);
    };

    // Écouter les événements de storage
    window.addEventListener('storage', handleStorageChange);
    
    // Écouter les événements personnalisés
    window.addEventListener('websiteDesignUpdated', handleCustomEvents);
    window.addEventListener('websiteDesignSaved', handleCustomEvents);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvents);
    
    // Polling de sécurité plus fréquent pour capturer les changements
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        applyAllChanges();
      }
    }, 2000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvents);
      window.removeEventListener('websiteDesignSaved', handleCustomEvents);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvents);
      
      // Nettoyer les styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [applyAllChanges]);

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    lastDataHash.current = ''; // Reset hash pour forcer la sync
    syncInProgress.current = false;
    lastSyncTime.current = 0;
    return applyAllChanges();
  }, [applyAllChanges]);

  return {
    forceSync,
    isActiveSyncing: syncInProgress.current
  };
};
