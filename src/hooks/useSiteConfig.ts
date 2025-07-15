
import { useState, useEffect } from 'react';

interface SiteConfig {
  siteName: string;
  logo: string;
}

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'MusiConnect',
    logo: ''
  });

  const loadConfig = () => {
    try {
      // PRIORITÉ 1 : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        if (design.siteName) {
          const newConfig = {
            siteName: design.siteName,
            logo: design.logo || ''
          };
          console.log('✅ useSiteConfig - CONFIG LOADED FROM DESIGN:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return newConfig;
        }
      }

      // PRIORITÉ 2 : websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.siteName) {
          const newConfig = {
            siteName: settings.siteName,
            logo: settings.logo || ''
          };
          console.log('✅ useSiteConfig - CONFIG LOADED FROM SETTINGS:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return newConfig;
        }
      }

      console.log('⚠️ useSiteConfig - NO CONFIG FOUND, keeping default');
      return null;

    } catch (error) {
      console.error('❌ useSiteConfig - Error loading config:', error);
      return null;
    }
  };

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les événements storage
    const handleStorageChange = () => {
      console.log('📡 useSiteConfig - Storage event received');
      setTimeout(loadConfig, 50);
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = () => {
      console.log('📡 useSiteConfig - Custom event received');
      setTimeout(loadConfig, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvent);
    window.addEventListener('websiteDesignSaved', handleCustomEvent);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvent);
    window.addEventListener('siteConfigChanged', handleCustomEvent);

    // Polling pour sécurité
    const interval = setInterval(loadConfig, 3000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvent);
      window.removeEventListener('websiteDesignSaved', handleCustomEvent);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvent);
      window.removeEventListener('siteConfigChanged', handleCustomEvent);
      clearInterval(interval);
    };
  }, []);

  return config;
};
