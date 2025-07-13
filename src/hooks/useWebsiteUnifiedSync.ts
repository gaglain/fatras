
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
  const THROTTLE_DELAY = 100; // Réduit encore plus pour une synchronisation quasi-instantanée

  const applyAllChanges = useCallback(async () => {
    const now = Date.now();
    
    // Throttle plus agressif mais permet la synchronisation
    if (syncInProgress.current && (now - lastSyncTime.current) < THROTTLE_DELAY) {
      console.log('🔄 Sync skipped - throttled');
      return;
    }
    
    syncInProgress.current = true;
    lastSyncTime.current = now;
    
    try {
      console.log('🚀 Starting AGGRESSIVE unified website sync');
      
      // Charger les paramètres avec détection des changements
      const savedSettings = localStorage.getItem('websiteSettings');
      const savedDesign = localStorage.getItem('websiteDesign');
      
      let settings: WebsiteSettings | null = null;
      let design: SiteDesign | null = null;
      
      if (savedSettings) {
        settings = JSON.parse(savedSettings);
        console.log('⚙️ Settings loaded from localStorage:', settings?.siteName);
      }
      
      if (savedDesign) {
        design = JSON.parse(savedDesign);
        console.log('🎨 Design loaded from localStorage:', design?.siteName, design?.logo ? 'with logo' : 'no logo');
      }
      
      // Déterminer le nom du site à utiliser (priorité absolue au design)
      const finalSiteName = design?.siteName || settings?.siteName || 'MusiConnect';
      console.log('🏷️ Final site name determined:', finalSiteName);
      
      // FORCER la mise à jour du titre de la page
      document.title = finalSiteName;
      console.log('📄 Page title FORCED to:', finalSiteName);
      
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
      
      // Appliquer les styles CSS de façon plus agressive
      if (design) {
        // Nettoyer TOUS les anciens styles
        const existingStyles = document.querySelectorAll('#unified-website-styles, #website-design-styles');
        existingStyles.forEach(style => style.remove());
        
        if (styleElementRef.current) {
          styleElementRef.current.remove();
          styleElementRef.current = null;
        }
        
        // Créer le nouveau style avec une priorité maximale
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
        console.log('🎨 CSS styles applied with maximum priority');
      }
      
      // FORCER la mise à jour de TOUS les éléments du nom du site de façon AGRESSIVE
      const updateSiteNameElements = () => {
        const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
        console.log('📝 FORCING update of', siteNameElements.length, 'site name elements');
        
        siteNameElements.forEach((el, index) => {
          const oldText = el.textContent;
          el.textContent = finalSiteName;
          console.log(`📝 Site name element ${index + 1} FORCED from "${oldText}" to "${finalSiteName}"`);
          
          // Force re-render
          if (el instanceof HTMLElement) {
            el.style.display = 'none';
            el.offsetHeight; // Force reflow
            el.style.display = '';
          }
        });
      };
      
      // FORCER la mise à jour de TOUS les logos de façon AGRESSIVE
      const updateLogoElements = () => {
        if (design?.logo) {
          const logoElements = document.querySelectorAll('.site-logo');
          console.log('🖼️ FORCING update of', logoElements.length, 'logo elements');
          
          logoElements.forEach((el, index) => {
            const imgEl = el as HTMLImageElement;
            const oldSrc = imgEl.src;
            
            if (imgEl.src !== design.logo) {
              imgEl.src = design.logo;
              imgEl.style.display = 'block';
              imgEl.style.maxHeight = '40px';
              imgEl.style.width = 'auto';
              
              console.log(`🖼️ Logo element ${index + 1} FORCED from "${oldSrc}" to "${design.logo}"`);
              
              imgEl.onload = () => {
                console.log(`🖼️ Logo ${index + 1} loaded successfully`);
                imgEl.style.display = 'block';
              };
              
              imgEl.onerror = () => {
                console.warn(`⚠️ Logo ${index + 1} failed to load:`, design.logo);
                imgEl.style.display = 'none';
              };
            }
          });
        } else {
          // Masquer tous les logos si pas de logo défini
          const logoElements = document.querySelectorAll('.site-logo');
          logoElements.forEach(el => {
            (el as HTMLElement).style.display = 'none';
          });
        }
      };
      
      // Appliquer les changements immédiatement
      updateSiteNameElements();
      updateLogoElements();
      
      // Répéter après un délai pour s'assurer que les éléments dynamiques sont mis à jour
      setTimeout(() => {
        updateSiteNameElements();
        updateLogoElements();
        console.log('🔄 Secondary update applied');
      }, 100);
      
      // Déclencher TOUS les événements personnalisés
      const events = [
        'websiteFullSync',
        'websiteDesignUpdated',
        'websiteSettingsUpdated',
        'websiteDesignSaved',
        'websiteSettingsSaved'
      ];
      
      events.forEach(eventName => {
        const syncEvent = new CustomEvent(eventName, { 
          detail: { settings, design, siteName: finalSiteName, forceUpdate: true } 
        });
        window.dispatchEvent(syncEvent);
        console.log(`✅ Event ${eventName} dispatched with force update`);
      });
      
      console.log('✅ AGGRESSIVE unified sync completed successfully');
      
    } catch (error) {
      console.error('❌ Unified sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, []);

  useEffect(() => {
    console.log('🚀 AGGRESSIVE unified website sync hook initialized');
    
    // Sync initial IMMÉDIAT
    applyAllChanges();

    // Écouter les changements de localStorage avec une fréquence élevée
    const handleStorageChange = (event: StorageEvent) => {
      if (['websiteSettings', 'websiteDesign'].includes(event.key || '')) {
        console.log('💾 Storage change detected for:', event.key);
        // Sync immédiat sans délai
        setTimeout(applyAllChanges, 10);
      }
    };

    // Écouter TOUS les événements personnalisés possibles
    const eventTypes = [
      'websiteDesignSaved',
      'websiteDesignUpdated', 
      'websiteSettingsSaved',
      'websiteSettingsUpdated',
      'websiteFullSync'
    ];

    const handleCustomEvents = (event: Event) => {
      console.log('🔔 Custom event received:', event.type);
      setTimeout(applyAllChanges, 10);
    };

    // Ajouter TOUS les listeners
    window.addEventListener('storage', handleStorageChange);
    eventTypes.forEach(eventType => {
      window.addEventListener(eventType, handleCustomEvents);
    });

    // Sync périodique très fréquent pour s'assurer que tout reste synchronisé
    const interval = setInterval(() => {
      if (!syncInProgress.current) {
        applyAllChanges();
      }
    }, 1000); // Toutes les secondes

    // Sync lors des changements de visibilité
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page became visible, forcing sync');
        setTimeout(applyAllChanges, 50);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      eventTypes.forEach(eventType => {
        window.removeEventListener(eventType, handleCustomEvents);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Nettoyer les styles
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [applyAllChanges]);

  const forceSync = useCallback(() => {
    console.log('🔄 FORCE sync requested - resetting all flags');
    syncInProgress.current = false; // Reset le flag pour permettre le sync
    lastSyncTime.current = 0; // Reset le timestamp
    return applyAllChanges();
  }, [applyAllChanges]);

  return {
    forceSync,
    isActiveSyncing: syncInProgress.current
  };
};
