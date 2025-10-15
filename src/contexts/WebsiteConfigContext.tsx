
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  visible: boolean;
  order: number;
  isCustom?: boolean;
}

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
  
  // Menu
  menuItems?: MenuItem[];
}

const defaultMenuItems: MenuItem[] = [
  { id: '1', label: 'Accueil', path: '/front', visible: true, order: 1, isCustom: false },
  { id: '2', label: 'Artistes', path: '/front/artists', visible: true, order: 2, isCustom: false },
  { id: '3', label: 'Événements', path: '/front/events', visible: true, order: 3, isCustom: false },
  { id: '4', label: 'Boutique', path: '/front/shop', visible: true, order: 4, isCustom: false },
  { id: '5', label: 'Contact', path: '/front/contact', visible: true, order: 5, isCustom: false }
];

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
  maintenanceMessage: 'Site en maintenance. Nous reviendrons bientôt !',
  menuItems: defaultMenuItems
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
      
      // Helper de parse sécurisé
      const safeParse = (key: string, fallback: any = null) => {
        try {
          const raw = localStorage.getItem(key);
          if (!raw) return fallback;
          return JSON.parse(raw);
        } catch (err) {
          console.error(`❌ WebsiteConfig - Parse error for ${key}, auto-clearing:`, err);
          localStorage.removeItem(key);
          return fallback;
        }
      };

      // Charger la config avec parse sécurisé
      const parsed = safeParse('websiteConfig');
      let mergedConfig = { ...defaultConfig, ...parsed };
      
      if (parsed) {
        console.log('✅ Config loaded:', mergedConfig.siteName);
      }

      // Charger le menu avec parse sécurisé
      const parsedMenu = safeParse('websiteMenu', defaultMenuItems);
      mergedConfig.menuItems = parsedMenu;
      
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
