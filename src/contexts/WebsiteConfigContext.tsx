
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
  siteName: 'MusiConnect',
  logo: '/logo.svg',
  primaryColor: '#1632f4',
  secondaryColor: '#ec5f65',
  accentColor: '#f19e9c',
  headerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  footerBg: 'linear-gradient(to right, #1a1f2e, #222c45)',
  textColor: '#ffffff',
  linkColor: '#60a5fa',
  siteDescription: 'Votre plateforme musicale professionnelle',
  metaKeywords: 'musique, artistes, événements',
  favicon: '/favicon.ico',
  contactEmail: 'contact@musiconnect.com',
  contactPhone: '+33 1 23 45 67 89',
  address: '123 Rue de la Musique, 75001 Paris',
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
  cookieConsentText: 'Nous utilisons des cookies pour améliorer votre expérience.',
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

  const loadConfig = useCallback(() => {
    try {
      console.log('🔄 Loading website config...');
      
      // Charger la config depuis localStorage
      const savedConfig = localStorage.getItem('websiteConfig');
      let mergedConfig = { ...defaultConfig };
      
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig);
          mergedConfig = { ...defaultConfig, ...parsed };
          console.log('✅ Config loaded:', mergedConfig.siteName);
        } catch (e) {
          console.warn('⚠️ Failed to parse saved config');
        }
      }
      
      setConfig(mergedConfig);
      
      // Mettre à jour le titre immédiatement
      document.title = mergedConfig.siteName;
      
    } catch (error) {
      console.error('❌ Error loading config:', error);
      setConfig(defaultConfig);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<WebsiteConfig>) => {
    console.log('💾 Updating config:', newConfig);
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Sauvegarder
    localStorage.setItem('websiteConfig', JSON.stringify(updatedConfig));
    
    // Mettre à jour le titre
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
    }
    
    // Déclencher les événements de sync
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigChanged'));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteConfig',
        newValue: JSON.stringify(updatedConfig),
        storageArea: localStorage
      }));
      console.log('🚀 Config events dispatched');
    }, 100);
    
  }, [config]);

  const reloadConfig = useCallback(() => {
    console.log('🔄 Force reload config');
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

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
