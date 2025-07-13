
import { useCallback } from 'react';

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

export const useWebsiteDataManager = () => {
  const loadSettings = useCallback((): WebsiteSettings | null => {
    const savedSettings = localStorage.getItem('websiteSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        console.error('❌ Error loading settings:', error);
      }
    }
    return null;
  }, []);

  const loadDesign = useCallback((): SiteDesign | null => {
    const savedDesign = localStorage.getItem('websiteDesign');
    if (savedDesign) {
      try {
        return JSON.parse(savedDesign);
      } catch (error) {
        console.error('❌ Error loading design:', error);
      }
    }
    return null;
  }, []);

  const updatePageTitle = useCallback((siteName: string) => {
    if (document.title !== siteName) {
      document.title = siteName;
      console.log('📄 Page title updated to:', siteName);
    }
  }, []);

  const updateMetaDescription = useCallback((description: string) => {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    console.log('📝 Meta description updated');
  }, []);

  const updateDOMElements = useCallback((siteName: string, logo?: string) => {
    // Mettre à jour tous les éléments du nom du site
    const siteNameElements = document.querySelectorAll('.site-name, [data-site-name], [class*="site-name"]');
    siteNameElements.forEach((el) => {
      if (el.textContent !== siteName) {
        el.textContent = siteName;
        console.log('📝 Site name element updated');
      }
    });
    
    // Mettre à jour tous les logos
    if (logo) {
      const logoElements = document.querySelectorAll('.site-logo, img[class*="logo"]');
      logoElements.forEach((el) => {
        const imgEl = el as HTMLImageElement;
        if (imgEl.src !== logo) {
          imgEl.src = logo;
          imgEl.style.display = 'block';
          console.log('🖼️ Logo element updated');
        }
      });
    }
  }, []);

  return {
    loadSettings,
    loadDesign,
    updatePageTitle,
    updateMetaDescription,
    updateDOMElements
  };
};
