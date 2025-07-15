
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
    console.log('🔍 useSiteConfig - LOADING CONFIG...');
    
    try {
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      console.log('🎨 useSiteConfig - websiteDesign raw:', savedDesign);
      
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('🎨 useSiteConfig - websiteDesign parsed:', design);
        
        if (design.siteName && design.siteName !== 'MusiConnect') {
          const newConfig = {
            siteName: design.siteName,
            logo: design.logo || ''
          };
          console.log('✅ useSiteConfig - APPLYING DESIGN CONFIG:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      // Fallback : websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      console.log('⚙️ useSiteConfig - websiteSettings raw:', savedSettings);
      
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('⚙️ useSiteConfig - websiteSettings parsed:', settings);
        
        if (settings.siteName && settings.siteName !== 'MusiConnect') {
          const newConfig = {
            siteName: settings.siteName,
            logo: config.logo
          };
          console.log('✅ useSiteConfig - APPLYING SETTINGS CONFIG:', newConfig);
          setConfig(newConfig);
          document.title = newConfig.siteName;
          return;
        }
      }

      console.log('⚠️ useSiteConfig - NO VALID CONFIG FOUND, keeping default');
    } catch (error) {
      console.error('❌ useSiteConfig - Error loading config:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 useSiteConfig - INITIALIZING...');
    
    // Chargement immédiat
    loadConfig();

    // Écouter TOUS les événements possibles
    const handleStorageChange = (e: StorageEvent) => {
      console.log('📡 useSiteConfig - Storage event:', e.key, e.newValue);
      if (e.key === 'websiteDesign' || e.key === 'websiteSettings') {
        setTimeout(loadConfig, 10);
      }
    };

    const handleCustomEvent = (e: CustomEvent) => {
      console.log('📡 useSiteConfig - Custom event:', e.type, e.detail);
      setTimeout(loadConfig, 10);
    };

    // Ajouter tous les listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvent as EventListener);
    window.addEventListener('websiteDesignSaved', handleCustomEvent as EventListener);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvent as EventListener);

    // Polling très agressif au début, puis plus modéré
    const aggressiveInterval = setInterval(loadConfig, 1000);
    const moderateInterval = setTimeout(() => {
      clearInterval(aggressiveInterval);
      const normalInterval = setInterval(loadConfig, 5000);
      return () => clearInterval(normalInterval);
    }, 10000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvent as EventListener);
      window.removeEventListener('websiteDesignSaved', handleCustomEvent as EventListener);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvent as EventListener);
      clearInterval(aggressiveInterval);
      clearTimeout(moderateInterval);
    };
  }, []);

  console.log('🎯 useSiteConfig - Current config:', config);
  return config;
};
