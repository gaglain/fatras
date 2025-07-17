
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
      console.log('🔄 Loading website config from storage...');
      
      // Charger de toutes les sources possibles
      const sources = [
        localStorage.getItem('websiteConfig'),
        localStorage.getItem('websiteSettings'),
        localStorage.getItem('websiteDesign')
      ].filter(Boolean);

      let mergedConfig = { ...defaultConfig };
      
      // Fusionner tous les configs trouvés
      sources.forEach((source) => {
        if (source) {
          try {
            const parsed = JSON.parse(source);
            mergedConfig = { ...mergedConfig, ...parsed };
          } catch (e) {
            console.warn('Failed to parse config:', e);
          }
        }
      });
      
      console.log('✅ Config loaded successfully:', mergedConfig.siteName);
      setConfig(mergedConfig);
      
      // Mettre à jour le titre immédiatement
      if (mergedConfig.siteName && mergedConfig.siteName !== document.title) {
        document.title = mergedConfig.siteName;
        console.log('📄 Page title updated to:', mergedConfig.siteName);
      }
      
    } catch (error) {
      console.error('❌ Error loading config:', error);
      setConfig(defaultConfig);
      document.title = defaultConfig.siteName;
    }
  }, []);

  const updateConfig = useCallback((newConfig: Partial<WebsiteConfig>) => {
    console.log('💾 Updating config with:', newConfig);
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Sauvegarder dans toutes les clés pour compatibilité
    const configData = JSON.stringify(updatedConfig);
    localStorage.setItem('websiteConfig', configData);
    localStorage.setItem('websiteSettings', configData);
    localStorage.setItem('websiteDesign', configData);
    
    // Mettre à jour le titre immédiatement
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
      console.log('📄 Page title updated to:', newConfig.siteName);
    }
    
    // Déclencher les événements de synchronisation après un court délai
    setTimeout(() => {
      // Événement de storage
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteConfig',
        newValue: configData,
        storageArea: localStorage
      }));
      
      // Événements personnalisés
      window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: updatedConfig }));
      window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: updatedConfig }));
      
      console.log('🚀 Config events dispatched');
    }, 100);
    
  }, [config]);

  const reloadConfig = useCallback(() => {
    console.log('🔄 Reloading config requested');
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
