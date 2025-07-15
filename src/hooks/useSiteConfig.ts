
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
      // Priorité absolue : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        if (design.siteName || design.logo) {
          const newConfig = {
            siteName: design.siteName || 'MusiConnect',
            logo: design.logo || ''
          };
          setConfig(newConfig);
          document.title = newConfig.siteName;
          console.log('✅ useSiteConfig - Loaded from design:', newConfig.siteName);
          return;
        }
      }

      // Fallback : websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.siteName) {
          const newConfig = {
            siteName: settings.siteName,
            logo: config.logo
          };
          setConfig(newConfig);
          document.title = newConfig.siteName;
          console.log('✅ useSiteConfig - Loaded from settings:', newConfig.siteName);
        }
      }
    } catch (error) {
      console.error('❌ useSiteConfig - Error:', error);
    }
  };

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les changements
    const handleChange = () => {
      console.log('📡 useSiteConfig - Change detected, reloading...');
      setTimeout(loadConfig, 50);
    };

    window.addEventListener('storage', handleChange);
    window.addEventListener('websiteDesignUpdated', handleChange);
    window.addEventListener('websiteDesignSaved', handleChange);
    window.addEventListener('websiteSettingsUpdated', handleChange);

    // Vérification toutes les 5 secondes seulement
    const interval = setInterval(loadConfig, 5000);

    return () => {
      window.removeEventListener('storage', handleChange);
      window.removeEventListener('websiteDesignUpdated', handleChange);
      window.removeEventListener('websiteDesignSaved', handleChange);
      window.removeEventListener('websiteSettingsUpdated', handleChange);
      clearInterval(interval);
    };
  }, []);

  return config;
};
