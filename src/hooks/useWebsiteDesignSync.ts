
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

  const applyDesignStyles = useCallback((design: SiteDesign) => {
    console.log('🎨 Applying website design styles');
    
    // Remove old style efficiently
    const existingStyle = document.getElementById('website-design-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create new styles
    const style = document.createElement('style');
    style.id = 'website-design-styles';
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
    
    // Update title if needed
    if (design.siteName && document.title !== design.siteName) {
      document.title = design.siteName;
    }
    
    // Update logos and names efficiently
    const logoElements = document.querySelectorAll('.site-logo');
    logoElements.forEach(el => {
      const imgEl = el as HTMLImageElement;
      if (design.logo && imgEl.src !== design.logo) {
        imgEl.src = design.logo;
        imgEl.style.display = 'block';
      }
    });
    
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name]');
    siteNameElements.forEach(el => {
      if (el.textContent !== design.siteName) {
        el.textContent = design.siteName;
      }
    });
    
    console.log('✅ Website design applied successfully');
  }, []);

  const syncDesignChanges = useCallback(() => {
    if (syncInProgress.current) return;
    
    const savedDesign = localStorage.getItem('websiteDesign');
    if (!savedDesign) return;
    
    // Prevent redundant syncs
    if (lastDesignHash.current === savedDesign) return;
    
    syncInProgress.current = true;
    
    try {
      const design: SiteDesign = JSON.parse(savedDesign);
      applyDesignStyles(design);
      lastDesignHash.current = savedDesign;
    } catch (error) {
      console.error('❌ Design sync error:', error);
    } finally {
      syncInProgress.current = false;
    }
  }, [applyDesignStyles]);

  useEffect(() => {
    console.log('🚀 Website design sync hook initialized');
    
    // Initial sync
    syncDesignChanges();

    // Reduced frequency storage checks
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteDesign' && !syncInProgress.current) {
        setTimeout(syncDesignChanges, 200);
      }
    };

    const handleDesignSaved = () => {
      if (!syncInProgress.current) {
        setTimeout(syncDesignChanges, 200);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignSaved', handleDesignSaved);
    window.addEventListener('websiteDesignUpdated', handleDesignSaved);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignSaved', handleDesignSaved);
      window.removeEventListener('websiteDesignUpdated', handleDesignSaved);
    };
  }, [syncDesignChanges]);

  return { syncDesignChanges };
};
