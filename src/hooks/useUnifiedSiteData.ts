
import { useState, useEffect } from 'react';

interface SiteData {
  siteName: string;
  logo: string;
  primaryColor: string;
  headerBg: string;
  textColor: string;
  linkColor: string;
}

export const useUnifiedSiteData = () => {
  const [siteData, setSiteData] = useState<SiteData>({
    siteName: 'MusiConnect',
    logo: '',
    primaryColor: '#1632f4',
    headerBg: '#ffffff',
    textColor: '#1f2937',
    linkColor: '#3b82f6'
  });

  const loadSiteData = () => {
    try {
      console.log('🔍 UNIFIED - Loading site data...');
      
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('✅ UNIFIED - Design found:', design);
        
        const newSiteData = {
          siteName: design.siteName || 'MusiConnect',
          logo: design.logo || '',
          primaryColor: design.primaryColor || '#1632f4',
          headerBg: design.headerBg || '#ffffff',
          textColor: design.textColor || '#1f2937',
          linkColor: design.linkColor || '#3b82f6'
        };
        
        setSiteData(newSiteData);
        document.title = newSiteData.siteName;
        console.log('🎯 UNIFIED - Applied siteName:', newSiteData.siteName);
        return;
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 UNIFIED - Settings fallback:', settings);
        
        if (settings.siteName) {
          setSiteData(prev => ({ ...prev, siteName: settings.siteName }));
          document.title = settings.siteName;
          console.log('🎯 UNIFIED - Applied siteName from settings:', settings.siteName);
        }
      }

    } catch (error) {
      console.error('❌ UNIFIED - Error loading data:', error);
    }
  };

  useEffect(() => {
    // Chargement immédiat
    loadSiteData();
    
    // Écouter les événements
    const handleUpdate = () => {
      console.log('📡 UNIFIED - Event received, reloading...');
      setTimeout(loadSiteData, 10);
    };

    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    // Polling agressif
    const interval = setInterval(loadSiteData, 1000);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return siteData;
};
