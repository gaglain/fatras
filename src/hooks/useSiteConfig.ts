
import { useState, useEffect } from 'react';

interface SiteConfig {
  siteName: string;
  logo: string;
}

const DEFAULT_CONFIG: SiteConfig = {
  siteName: 'MusiConnect',
  logo: ''
};

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);

  const loadConfig = () => {
    try {
      // Essayer d'abord websiteDesign
      const designData = localStorage.getItem('websiteDesign');
      if (designData) {
        const design = JSON.parse(designData);
        if (design.siteName) {
          const newConfig = {
            siteName: design.siteName,
            logo: design.logo || ''
          };
          console.log('✅ useSiteConfig - Loaded from design:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      // Fallback vers websiteSettings
      const settingsData = localStorage.getItem('websiteSettings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        if (settings.siteName) {
          const newConfig = {
            siteName: settings.siteName,
            logo: settings.logo || ''
          };
          console.log('✅ useSiteConfig - Loaded from settings:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      console.log('⚠️ useSiteConfig - Using default config');
    } catch (error) {
      console.error('❌ useSiteConfig - Error:', error);
    }
  };

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les changements de storage
    const handleStorageChange = () => {
      console.log('🔄 useSiteConfig - Storage changed');
      setTimeout(loadConfig, 100);
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = () => {
      console.log('🔄 useSiteConfig - Custom event received');
      setTimeout(loadConfig, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('siteConfigChanged', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('siteConfigChanged', handleCustomEvent);
    };
  }, []);

  return config;
};
