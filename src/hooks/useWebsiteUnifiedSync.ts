
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
  const THROTTLE_DELAY = 500;

  const applyAllChanges = useCallback(async () => {
    const now = Date.now();
    
    // Éviter la boucle infinie avec un throttle plus strict
    if (syncInProgress.current || (now - lastSyncTime.current) < THROTTLE_DELAY) {
      console.log('🔄 Sync skipped - throttled or in progress');
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🚀 Starting unified website sync');
      
      // Charger les paramètres
      const savedSettings = localStorage.getItem('websiteSettings');
      const savedDesign = localStorage.getItem('websiteDesign');
      
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
      
      // Mettre à jour le titre de la page
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
      
      // Appliquer les styles CSS
      if (design) {
        // Nettoyer les anciens styles
        if (styleElementRef.current) {
          styleElementRef.current.remove();
        }
        
        const existingStyles = document.querySelectorAll('#unified-website-styles');
        existingStyles.forEach(style => style.remove());
        
        // Créer le nouveau style
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

          .site-logo {
            max-height: 40px !important;
            width: auto !important;
            display: ${design.logo ? 'block' : 'none'} !important;
          }
          
          .site-name, [data-site-name] {
            color: ${design.textColor} !important;
            font-weight: bold !important;
            font-size: 1.25rem !important;
          }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 CSS styles applied');
      }
      
      // Mettre à jour les éléments du nom du site
      const updateSiteNameElements = () => {
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
        siteNameElements.forEach((el) => {
          if (el.textContent !== finalSiteName) {
            el.textContent = finalSiteName;
            console.log('📝 Site name element updated to:', finalSiteName);
          }
        });
      };
      
      // Mettre à jour les logos
      const updateLogoElements = () => {
        if (design?.logo) {
          const logoElements = document.querySelectorAll('.site-logo');
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
      
      updateSiteNameElements();
      updateLogoElements();
      
      console.log('✅ Unified sync completed successfully');
      
    } catch (error) {
      console.error('❌ Unified sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 Unified website sync hook initialized');
    
    // Sync initial
    applyAllChanges();

    // Écouter les changements de localStorage seulement
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected for:', event.key);
        setTimeout(() => {
          if (!syncInProgress.current) {
            applyAllChanges();
          }
        }, 100);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Polling de sécurité moins fréquent
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        applyAllChanges();
      }
    }, 5000); // Toutes les 5 secondes seulement
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      
      // Nettoyer les styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [applyAllChanges]);

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    syncInProgress.current = false;
    lastSyncTime.current = 0;
    return applyAllChanges();
  }, [applyAllChanges]);

  return {
    forceSync,
    isActiveSyncing: syncInProgress.current
  };
};
