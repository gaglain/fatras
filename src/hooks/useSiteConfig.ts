
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
    console.log('🔍 useSiteConfig - CHARGEMENT CONFIG...');
    
    try {
      // PRIORITÉ 1 : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      console.log('🎨 useSiteConfig - websiteDesign raw:', savedDesign);
      
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('🎨 useSiteConfig - websiteDesign parsed:', design);
        
        if (design.siteName) {
          const newConfig = {
            siteName: design.siteName,
            logo: design.logo || ''
          };
          console.log('✅ useSiteConfig - CONFIG DEPUIS DESIGN:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return newConfig;
        }
      }

      // PRIORITÉ 2 : websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      console.log('⚙️ useSiteConfig - websiteSettings raw:', savedSettings);
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('⚙️ useSiteConfig - websiteSettings parsed:', settings);
        
        if (settings.siteName) {
          const newConfig = {
            siteName: settings.siteName,
            logo: settings.logo || ''
          };
          console.log('✅ useSiteConfig - CONFIG DEPUIS SETTINGS:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return newConfig;
        }
      }

      console.log('⚠️ useSiteConfig - AUCUNE CONFIG TROUVÉE, garde MusiConnect par défaut');
      return null;

    } catch (error) {
      console.error('❌ useSiteConfig - Erreur:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('🚀 useSiteConfig - INITIALISATION...');
    
    // Chargement immédiat
    loadConfig();

    // Écouter les événements
    const handleUpdate = (e?: any) => {
      console.log('📡 useSiteConfig - Événement reçu:', e?.type || 'manual');
      setTimeout(() => {
        const result = loadConfig();
        if (result) {
          console.log('✅ useSiteConfig - Config mise à jour:', result);
        }
      }, 10);
    };

    // Tous les événements possibles
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('websiteSettingsUpdated', handleUpdate);
    window.addEventListener('siteConfigChanged', handleUpdate);

    // Polling toutes les 2 secondes (plus agressif)
    const interval = setInterval(() => {
      const currentDesign = localStorage.getItem('websiteDesign');
      const currentSettings = localStorage.getItem('websiteSettings');
      
      if (currentDesign || currentSettings) {
        loadConfig();
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteSettingsUpdated', handleUpdate);
      window.removeEventListener('siteConfigChanged', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  console.log('🎯 useSiteConfig - Config actuelle:', config);
  return config;
};
