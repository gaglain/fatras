
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const loadConfig = () => {
    try {
      // Charger depuis localStorage
      const savedConfig = localStorage.getItem('websiteConfig');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig(prev => ({ ...prev, ...parsed }));
        
        // Mettre à jour le titre de la page
        document.title = parsed.siteName || defaultConfig.siteName;
        
        console.log('✅ Website config loaded:', parsed.siteName);
      } else {
        // Si pas de config sauvée, utiliser la config par défaut
        document.title = defaultConfig.siteName;
      }
    } catch (error) {
      console.error('❌ Error loading website config:', error);
    }
  };

  const updateConfig = (newConfig: Partial<WebsiteConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('websiteConfig', JSON.stringify(updatedConfig));
    
    // Mettre à jour le titre
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
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
    
    console.log('💾 Website config updated:', updatedConfig.siteName);
    
    // Déclencher les événements pour synchronisation
    window.dispatchEvent(new CustomEvent('websiteConfigChanged', { detail: updatedConfig }));
    window.dispatchEvent(new CustomEvent('siteConfigChanged', { detail: legacyDesign }));
    
    // Forcer un re-render immédiat pour les composants
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigReload'));
    }, 100);
  };

  const reloadConfig = () => {
    loadConfig();
  };

  useEffect(() => {
    // Chargement initial
    loadConfig();

    // Écouter les changements
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'websiteConfig') {
        loadConfig();
      }
    };

    const handleConfigChange = () => {
      loadConfig();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteConfigChanged', handleConfigChange);
    window.addEventListener('websiteConfigReload', handleConfigChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteConfigChanged', handleConfigChange);
      window.removeEventListener('websiteConfigReload', handleConfigChange);
    };
  }, []);

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
