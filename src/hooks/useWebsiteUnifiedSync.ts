
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
  const THROTTLE_DELAY = 1000; // 1 seconde

  const applyAllChanges = useCallback(async () => {
    const now = Date.now();
    
    // Throttle pour éviter trop de synchronisations
    if (syncInProgress.current || (now - lastSyncTime.current) < THROTTLE_DELAY) {
      console.log('🔄 Sync skipped - throttled');
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
        console.log('🎨 Design loaded:', design?.siteName);
      }
      
      // Déterminer le nom du site à utiliser (priorité au design puis aux settings)
      const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
      
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
      }
      
      // Appliquer les styles CSS si le design existe
      if (design) {
        // Nettoyer l'ancien style
        if (styleElementRef.current) {
          styleElementRef.current.remove();
          styleElementRef.current = null;
        }
        
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
            display: block !important;
          }
          
          .site-name, [data-site-name] {
            color: ${design.textColor} !important;
            font-weight: bold !important;
          }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 CSS styles applied');
      }
      
      // Mettre à jour tous les éléments du nom du site
      const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
      siteNameElements.forEach(el => {
        if (el.textContent !== finalSiteName) {
          el.textContent = finalSiteName;
          console.log('📝 Site name element updated');
        }
      });
      
      // Mettre à jour tous les logos
      if (design?.logo) {
        const logoElements = document.querySelectorAll('.site-logo');
        logoElements.forEach(el => {
          const imgEl = el as HTMLImageElement;
          if (imgEl.src !== design.logo) {
            imgEl.src = design.logo;
            imgEl.style.display = 'block';
            imgEl.onload = () => console.log('🖼️ Logo loaded successfully');
            imgEl.onerror = () => {
              console.warn('⚠️ Logo failed to load:', design.logo);
              imgEl.style.display = 'none';
            };
          }
        });
      }
      
      // Déclencher des événements personnalisés pour notifier les autres composants
      window.dispatchEvent(new CustomEvent('websiteFullSync', { 
        detail: { settings, design, siteName: finalSiteName } 
      }));
      
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
    setTimeout(() => {
      applyAllChanges();
    }, 100);

    // Écouter les changements de localStorage
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected:', event.key);
        setTimeout(applyAllChanges, 200);
      }
    };

    // Écouter les événements personnalisés
    const handleCustomEvents = (event: CustomEvent) => {
      console.log('🔔 Custom event received:', event.type);
      setTimeout(applyAllChanges, 200);
    };

    // Ajouter les listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleCustomEvents as EventListener);
    window.addEventListener('websiteDesignUpdated', handleCustomEvents as EventListener);
    window.addEventListener('websiteSettingsSaved', handleCustomEvents as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvents as EventListener);

    // Sync périodique plus fréquent pour s'assurer que tout reste synchronisé
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        applyAllChanges();
      }
    }, 5000); // Toutes les 5 secondes

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleCustomEvents as EventListener);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvents as EventListener);
      window.removeEventListener('websiteSettingsSaved', handleCustomEvents as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvents as EventListener);
      
      // Nettoyer les styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [applyAllChanges]);

  const forceSync = useCallback(() => {
    console.log('🔄 Force sync requested');
    syncInProgress.current = false; // Reset le flag pour permettre le sync
    return applyAllChanges();
  }, [applyAllChanges]);

  return {
    forceSync,
    isActiveSyncing: syncInProgress.current
  };
};
