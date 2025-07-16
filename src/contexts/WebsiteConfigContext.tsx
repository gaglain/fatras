import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface WebsiteConfig {
  // Branding
  siteName: string;
  logo: string;
  
  // Design
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headerBg: string;
  footerBg: string;
  textColor: string;
  linkColor: string;
  
  // SEO
  siteDescription: string;
  metaKeywords: string;
  favicon: string;
  
  // Contact
  contactEmail: string;
  contactPhone: string;
  address: string;
  
  // Social
  socialLinks: {
    facebook: string;
    instagram: string;
    twitter: string;
    youtube: string;
    linkedin: string;
  };
  
  // Analytics
  googleAnalyticsId: string;
  facebookPixelId: string;
  
  // Legal
  enableCookieConsent: boolean;
  cookieConsentText: string;
  
  // Maintenance
  enableMaintenanceMode: boolean;
  maintenanceMessage: string;
}

const defaultConfig: WebsiteConfig = {
  siteName: 'Mon Site Web',
  logo: '/logo.svg',
  primaryColor: '#1632f4',
  secondaryColor: '#ec5f65',
  accentColor: '#f19e9c',
  headerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  footerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  textColor: '#ffffff',
  linkColor: '#60a5fa',
  siteDescription: 'Votre site web professionnel',
  metaKeywords: 'site web, professionnel',
  favicon: '/favicon.ico',
  contactEmail: 'contact@monsite.com',
  contactPhone: '+33 1 23 45 67 89',
  address: '123 Rue Example, 75001 Paris',
  socialLinks: {
    facebook: '',
    instagram: '',
    twitter: '',
    youtube: '',
    linkedin: ''
  },
  googleAnalyticsId: '',
  facebookPixelId: '',
  enableCookieConsent: true,
  cookieConsentText: 'Nous utilisons des cookies pour améliorer votre expérience sur notre site.',
  enableMaintenanceMode: false,
  maintenanceMessage: 'Site en maintenance. Nous reviendrons bientôt !'
};

interface WebsiteConfigContextType {
  config: WebsiteConfig;
  updateConfig: (newConfig: Partial<WebsiteConfig>) => void;
  reloadConfig: () => void;
}

const WebsiteConfigContext = createContext<WebsiteConfigContextType | undefined>(undefined);

export const WebsiteConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<WebsiteConfig>(defaultConfig);
  const [lastLoadTime, setLastLoadTime] = useState<number>(Date.now());

  const loadConfig = useCallback(() => {
    try {
      console.log('🔄 Loading website config...');
      const savedConfig = localStorage.getItem('websiteConfig');
      
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        console.log('✅ Website config loaded from localStorage:', parsed.siteName);
        
        setConfig(prev => {
          const newConfig = { ...prev, ...parsed };
          console.log('🎯 Config updated in state:', newConfig.siteName);
          return newConfig;
        });
        
        // Mettre à jour le titre de la page immédiatement
        if (parsed.siteName) {
          document.title = parsed.siteName;
          console.log('📄 Page title updated to:', parsed.siteName);
        }
        
        setLastLoadTime(Date.now());
      } else {
        console.log('⚠️ No saved config found, using default');
        document.title = defaultConfig.siteName;
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('❌ Error loading website config:', error);
      setConfig(defaultConfig);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<WebsiteConfig>) => {
    console.log('💾 Updating website config:', newConfig);
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('websiteConfig', JSON.stringify(updatedConfig));
    
    // Mettre à jour le titre immédiatement
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
      console.log('📄 Page title updated immediately to:', newConfig.siteName);
    }
    
    // Synchroniser avec les anciens systèmes pour compatibilité
    if (newConfig.siteName || newConfig.logo) {
      const legacySettings = {
        siteName: updatedConfig.siteName,
        logo: updatedConfig.logo
      };
      localStorage.setItem('websiteSettings', JSON.stringify(legacySettings));
    }
    
    // Synchroniser le design
    const legacyDesign = {
      siteName: updatedConfig.siteName,
      logo: updatedConfig.logo,
      primaryColor: updatedConfig.primaryColor,
      secondaryColor: updatedConfig.secondaryColor,
      accentColor: updatedConfig.accentColor,
      headerBg: updatedConfig.headerBg,
      footerBg: updatedConfig.footerBg,
      textColor: updatedConfig.textColor,
      linkColor: updatedConfig.linkColor
    };
    localStorage.setItem('websiteDesign', JSON.stringify(legacyDesign));
    
    console.log('🔥 Dispatching sync events...');
    
    // Déclencher les événements pour synchronisation IMMÉDIATE
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: updatedConfig }));
    window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: legacyDesign }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'websiteConfig',
      newValue: JSON.stringify(updatedConfig),
      storageArea: localStorage
    }));
    
    // Forcer un re-render immédiat multiple fois
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigReload', { detail: updatedConfig }));
      window.dispatchEvent(new CustomEvent('websiteConfigForceReload', { detail: updatedConfig }));
    }, 10);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigForceReload', { detail: updatedConfig }));
    }, 50);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigForceReload', { detail: updatedConfig }));
    }, 100);
    
    setLastLoadTime(Date.now());
  }, [config]);

  const reloadConfig = useCallback(() => {
    console.log('🔄 Manual config reload requested');
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les changements externes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig' && Date.now() - lastLoadTime > 100) {
        console.log('📡 Storage change detected, reloading...');
        loadConfig();
      }
    };

    const handleConfigChange = (event: any) => {
      console.log('📡 Config change event received, reloading...', event.detail);
      loadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChange);
    window.addEventListener('websiteConfigReload', handleConfigChange);
    window.addEventListener('websiteConfigForceReload', handleConfigChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChange);
      window.removeEventListener('websiteConfigReload', handleConfigChange);
      window.removeEventListener('websiteConfigForceReload', handleConfigChange);
    };
  }, [loadConfig, lastLoadTime]);

  // Debug log pour voir les changements de config
  useEffect(() => {
    console.log('🎯 Config state changed:', config.siteName);
  }, [config.siteName]);

  return (
    <WebsiteConfigContext.Provider value={{ config, updateConfig, reloadConfig }}>
      {children}
    </WebsiteConfigContext.Provider>
  );
};

export const useWebsiteConfig = () => {
  const context = useContext(WebsiteConfigContext);
  if (context === undefined) {
    throw new Error('useWebsiteConfig must be used within a WebsiteConfigProvider');
  }
  return context;
};
