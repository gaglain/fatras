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

  const loadConfig = useCallback(() => {
    try {
      const savedConfig = localStorage.getItem('websiteConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        console.log('✅ Config loaded:', parsed.siteName);
        setConfig({ ...defaultConfig, ...parsed });
        
        // Update page title immediately
        if (parsed.siteName) {
          document.title = parsed.siteName;
        }
      } else {
        console.log('📝 Using default config');
        setConfig(defaultConfig);
        document.title = defaultConfig.siteName;
      }
    } catch (error) {
      console.error('❌ Error loading config:', error);
      setConfig(defaultConfig);
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<WebsiteConfig>) => {
    console.log('💾 Updating config:', newConfig);
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Save to localStorage
    localStorage.setItem('websiteConfig', JSON.stringify(updatedConfig));
    
    // Update page title immediately if siteName changed
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
    }
    
    // Dispatch events for synchronization
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: updatedConfig }));
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'websiteConfig',
      newValue: JSON.stringify(updatedConfig),
      storageArea: localStorage
    }));
    
    console.log('🚀 Config updated and events dispatched');
  }, [config]);

  const reloadConfig = useCallback(() => {
    console.log('🔄 Reloading config');
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    console.log('🎯 Config state updated:', config.siteName);
  }, [config]);

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
