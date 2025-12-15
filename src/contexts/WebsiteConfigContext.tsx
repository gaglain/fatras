
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { user } = useAuth();
  const loadConfig = useCallback(async () => {
    try {
      console.log('🔄 Loading website config...');
      
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

      // 1) Charger depuis localStorage (fallback immédiat)
      const parsedLocal = safeParse('websiteConfig');
      let mergedConfig: WebsiteConfig = { ...defaultConfig, ...parsedLocal };

      // 2) Si connecté, tenter de charger depuis Supabase (source de vérité)
      if (user) {
        const { data, error } = await supabase
          .from('app_settings')
          .select('setting_key, setting_value')
          .in('setting_key', ['websiteConfig', 'websiteSettings', 'websiteDesign', 'company_name', 'company_logo', 'favicon']);

        if (error) {
          console.warn('⚠️ Chargement Supabase (website config) échoué, fallback localStorage:', error.message);
        } else if (data && data.length > 0) {
          const map = Object.fromEntries(
            data.map((r) => [r.setting_key, r.setting_value])
          ) as Record<string, string>;

          // Préférence à websiteConfig s'il existe
          let dbConfig: Partial<WebsiteConfig> | null = null;
          if (map.websiteConfig) {
            try { 
              dbConfig = JSON.parse(map.websiteConfig);
              // Override avec company_name, company_logo, favicon s'ils existent
              if (map.company_name) dbConfig.siteName = map.company_name;
              if (map.company_logo) dbConfig.logo = map.company_logo;
              if (map.favicon) dbConfig.favicon = map.favicon;
            } catch { 
              dbConfig = null; 
            }
          } else {
            // Construire une config minimale à partir des anciens formats si présent
            try {
              const ws = map.websiteSettings ? JSON.parse(map.websiteSettings) : null;
              const wd = map.websiteDesign ? JSON.parse(map.websiteDesign) : null;
              if (ws || wd || map.company_name || map.company_logo || map.favicon) {
                dbConfig = {
                  siteName: map.company_name ?? ws?.siteName ?? wd?.siteName ?? mergedConfig.siteName,
                  logo: map.company_logo ?? ws?.logo ?? wd?.logo ?? mergedConfig.logo,
                  primaryColor: wd?.primaryColor ?? mergedConfig.primaryColor,
                  secondaryColor: wd?.secondaryColor ?? mergedConfig.secondaryColor,
                  accentColor: wd?.accentColor ?? mergedConfig.accentColor,
                  headerBg: wd?.headerBg ?? mergedConfig.headerBg,
                  footerBg: wd?.footerBg ?? mergedConfig.footerBg,
                  textColor: wd?.textColor ?? mergedConfig.textColor,
                  linkColor: wd?.linkColor ?? mergedConfig.linkColor,
                  siteDescription: mergedConfig.siteDescription,
                  metaKeywords: mergedConfig.metaKeywords,
                  favicon: map.favicon ?? mergedConfig.favicon,
                  contactEmail: mergedConfig.contactEmail,
                  contactPhone: mergedConfig.contactPhone,
                  address: mergedConfig.address,
                  socialLinks: mergedConfig.socialLinks,
                  googleAnalyticsId: mergedConfig.googleAnalyticsId,
                  facebookPixelId: mergedConfig.facebookPixelId,
                  enableCookieConsent: mergedConfig.enableCookieConsent,
                  cookieConsentText: mergedConfig.cookieConsentText,
                  enableMaintenanceMode: mergedConfig.enableMaintenanceMode,
                  maintenanceMessage: mergedConfig.maintenanceMessage,
                  menuItems: mergedConfig.menuItems,
                };
              }
            } catch {}
          }

          if (dbConfig) {
            mergedConfig = { ...mergedConfig, ...dbConfig } as WebsiteConfig;

            // Réécrire les clés locales pour compatibilité et permettre l'aperçu immédiat
            localStorage.setItem('websiteConfig', JSON.stringify(mergedConfig));
            const legacyDesign = {
              siteName: mergedConfig.siteName,
              logo: mergedConfig.logo,
              primaryColor: mergedConfig.primaryColor,
              secondaryColor: mergedConfig.secondaryColor,
              accentColor: mergedConfig.accentColor,
              headerBg: mergedConfig.headerBg,
              footerBg: mergedConfig.footerBg,
              textColor: mergedConfig.textColor,
              linkColor: mergedConfig.linkColor,
            };
            const legacySettings = { siteName: mergedConfig.siteName, logo: mergedConfig.logo };
            localStorage.setItem('websiteDesign', JSON.stringify(legacyDesign));
            localStorage.setItem('websiteSettings', JSON.stringify(legacySettings));

            // Notifier les écrans front
            window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: legacySettings }));
            window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: legacyDesign }));
          }
        }
      }

      // 3) Charger le menu depuis localStorage (le menu est déjà synchronisé via WebsiteMenuSyncBridge)
      const parsedMenu = safeParse('websiteMenu', defaultMenuItems);
      mergedConfig.menuItems = parsedMenu;

      setConfig(mergedConfig);
      document.title = mergedConfig.siteName;
      
      // Appliquer le favicon
      const faviconLink = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (faviconLink && mergedConfig.favicon) {
        faviconLink.href = mergedConfig.favicon;
      }

    } catch (error) {
      console.error('❌ Error loading config:', error);
      setConfig(defaultConfig);
    }
  }, [user]);

  const updateConfig = useCallback((newConfig: Partial<WebsiteConfig>) => {
    console.log('💾 Updating config:', newConfig);
    
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    // Sauvegarder côté client pour l'aperçu immédiat
    localStorage.setItem('websiteConfig', JSON.stringify(updatedConfig));

    const legacyDesign = {
      siteName: updatedConfig.siteName,
      logo: updatedConfig.logo,
      primaryColor: updatedConfig.primaryColor,
      secondaryColor: updatedConfig.secondaryColor,
      accentColor: updatedConfig.accentColor,
      headerBg: updatedConfig.headerBg,
      footerBg: updatedConfig.footerBg,
      textColor: updatedConfig.textColor,
      linkColor: updatedConfig.linkColor,
    };
    const legacySettings = { siteName: updatedConfig.siteName, logo: updatedConfig.logo };
    localStorage.setItem('websiteDesign', JSON.stringify(legacyDesign));
    localStorage.setItem('websiteSettings', JSON.stringify(legacySettings));
    
    // Mettre à jour le titre
    if (newConfig.siteName) {
      document.title = newConfig.siteName;
    }
    
    // Persister côté Supabase pour éviter toute perte après nettoyage du cache
    if (user) {
      (async () => {
        try {
          // 1) app_settings (source historique / config unifiée)
          const payload = [
            { user_id: user.id, setting_key: 'websiteConfig', setting_value: JSON.stringify(updatedConfig) },
            { user_id: user.id, setting_key: 'websiteDesign', setting_value: JSON.stringify(legacyDesign) },
            { user_id: user.id, setting_key: 'websiteSettings', setting_value: JSON.stringify(legacySettings) },
          ];
          const { error } = await supabase
            .from('app_settings')
            .upsert(payload, { onConflict: 'user_id,setting_key' });
          if (error) console.error('❌ Persist website config failed:', error);
          else console.log('✅ Website config persisted to Supabase');

          // 2) website_designs (consommé par plusieurs composants du front)
          const designRow = {
            user_id: user.id,
            site_name: updatedConfig.siteName,
            logo: updatedConfig.logo,
            primary_color: updatedConfig.primaryColor,
            secondary_color: updatedConfig.secondaryColor,
            accent_color: updatedConfig.accentColor,
            header_bg: updatedConfig.headerBg,
            footer_bg: updatedConfig.footerBg,
            text_color: updatedConfig.textColor,
            link_color: updatedConfig.linkColor,
          };
          const { error: designError } = await supabase
            .from('website_designs')
            .upsert([designRow], { onConflict: 'user_id' });
          if (designError) console.error('❌ Persist website_designs failed:', designError);
          else console.log('✅ website_designs updated');
        } catch (e) {
          console.error('❌ Persist website config exception:', e);
        }
      })();
    }
    
    // Déclencher les événements de sync
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('websiteConfigChanged'));
      window.dispatchEvent(new CustomEvent('websiteSettingsUpdated', { detail: legacySettings }));
      window.dispatchEvent(new CustomEvent('websiteDesignUpdated', { detail: legacyDesign }));
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'websiteConfig',
        newValue: JSON.stringify(updatedConfig),
        storageArea: localStorage
      }));
      console.log('🚀 Config events dispatched');
    }, 100);
    
  }, [config, user]);

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
