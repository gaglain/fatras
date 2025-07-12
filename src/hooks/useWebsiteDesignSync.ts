
import { useEffect, useCallback, useRef } from 'react';

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
  const lastDesignHash = useRef<string>('');
  const syncInProgress = useRef(false);
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  const applyDesignStyles = useCallback((design: SiteDesign) => {
    console.log('🎨 Applying website design styles:', design.siteName);
    
    try {
      // Nettoyer l'ancien style plus efficacement
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
      
      // Créer et référencer le nouveau style
      const style = document.createElement('style');
      style.id = 'website-design-styles';
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
      
      // Mise à jour du titre si nécessaire
      if (design.siteName && document.title !== design.siteName) {
        document.title = design.siteName;
        console.log('📄 Page title updated to:', design.siteName);
      }
      
      // Mise à jour des logos avec gestion d'erreur
      const logoElements = document.querySelectorAll('.site-logo');
      logoElements.forEach(el => {
        const imgEl = el as HTMLImageElement;
        if (design.logo && imgEl.src !== design.logo) {
          imgEl.src = design.logo;
          imgEl.style.display = 'block';
          imgEl.onerror = () => {
            console.warn('⚠️ Logo failed to load:', design.logo);
            imgEl.style.display = 'none';
          };
        }
      });
      
      // Mise à jour des noms de site
      const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
      siteNameElements.forEach(el => {
        if (el.textContent !== design.siteName) {
          el.textContent = design.siteName;
        }
      });
      
      console.log('✅ Website design applied successfully');
    } catch (error) {
      console.error('❌ Error applying design styles:', error);
    }
  }, []);

  const syncDesignChanges = useCallback(() => {
    if (syncInProgress.current) {
      console.log('🎨 Design sync already in progress');
      return;
    }
    
    const savedDesign = localStorage.getItem('websiteDesign');
    if (!savedDesign) {
      console.log('🎨 No saved design found');
      return;
    }
    
    // Prévenir les synchronisations redondantes
    if (lastDesignHash.current === savedDesign) {
      console.log('🎨 Design unchanged, skipping sync');
      return;
    }
    
    syncInProgress.current = true;
    
    try {
      const design: SiteDesign = JSON.parse(savedDesign);
      applyDesignStyles(design);
      lastDesignHash.current = savedDesign;
      console.log('✅ Design sync completed');
    } catch (error) {
      console.error('❌ Design sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [applyDesignStyles]);

  useEffect(() => {
    console.log('🚀 Website design sync hook initialized');
    
    // Synchronisation initiale immédiate
    syncDesignChanges();

    // Gestionnaires d'événements optimisés
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign' && !syncInProgress.current) {
        console.log('💾 Storage change detected for websiteDesign');
        setTimeout(syncDesignChanges, 100);
      }
    };

    const handleDesignSaved = () => {
      if (!syncInProgress.current) {
        console.log('🎨 Design saved event received');
        setTimeout(syncDesignChanges, 100);
      }
    };

    // Ajout des listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);

    // Nettoyage
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteDesignUpdated', handleDesignSaved);
      
      // Nettoyer le style à la désinscription
      if (styleElementRef.current) {
        styleElementRef.current.remove();
        styleElementRef.current = null;
      }
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
