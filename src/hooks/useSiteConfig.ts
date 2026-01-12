import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

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
        const parsed = JSON.parse(configData) as Record<string, unknown>;
        const newConfig = {
          siteName: (typeof parsed.siteName === 'string' ? parsed.siteName : null) || DEFAULT_CONFIG.siteName,
          logo: (typeof parsed.logo === 'string' ? parsed.logo : null) || DEFAULT_CONFIG.logo
        };
        logger.debug('✅ useSiteConfig - Loaded from websiteConfig:', newConfig);
        setConfig(newConfig);
        document.title = newConfig.siteName;
        return;
      }

      // Fallback vers websiteDesign
      const designData = localStorage.getItem('websiteDesign');
      if (designData) {
        const design = JSON.parse(designData) as Record<string, unknown>;
        if (design.siteName && typeof design.siteName === 'string') {
          const newConfig = {
            siteName: design.siteName,
            logo: (typeof design.logo === 'string' ? design.logo : null) || ''
          };
          logger.debug('✅ useSiteConfig - Loaded from design:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      // Fallback vers websiteSettings
      const settingsData = localStorage.getItem('websiteSettings');
      if (settingsData) {
        const settings = JSON.parse(settingsData) as Record<string, unknown>;
        if (settings.siteName && typeof settings.siteName === 'string') {
          const newConfig = {
            siteName: settings.siteName,
            logo: (typeof settings.logo === 'string' ? settings.logo : null) || ''
          };
          logger.debug('✅ useSiteConfig - Loaded from settings:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      logger.debug('⚠️ useSiteConfig - Using default config');
    } catch (error) {
      logger.error('❌ useSiteConfig - Error:', error);
    }
  };

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les changements de storage
    const handleStorageChange = () => {
      logger.debug('🔄 useSiteConfig - Storage changed');
      setTimeout(loadConfig, 100);
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = (event: CustomEvent) => {
      logger.debug('🔄 useSiteConfig - Custom event received:', event.type, event.detail);
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
