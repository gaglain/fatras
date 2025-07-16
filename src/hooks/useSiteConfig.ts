
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
      // Utiliser websiteConfig comme source principale
      const configData = localStorage.getItem('websiteConfig');
      if (configData) {
        const parsed = JSON.parse(configData);
        const newConfig = {
          siteName: parsed.siteName || DEFAULT_CONFIG.siteName,
          logo: parsed.logo || DEFAULT_CONFIG.logo
        };
        console.log('✅ useSiteConfig - Loaded from websiteConfig:', newConfig);
        setConfig(newConfig);
        document.title = newConfig.siteName;
        return;
      }

      // Fallback vers websiteDesign
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
    const handleCustomEvent = (event: CustomEvent) => {
      console.log('🔄 useSiteConfig - Custom event received:', event.type, event.detail);
      setTimeout(loadConfig, 100);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleCustomEvent as EventListener);
    window.addEventListener('siteConfigChanged', handleCustomEvent as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleCustomEvent as EventListener);
      window.removeEventListener('siteConfigChanged', handleCustomEvent as EventListener);
    };
  }, []);

  return config;
};
