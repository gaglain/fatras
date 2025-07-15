
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';

export const SimpleFrontLayout: React.FC = () => {
  const [siteName, setSiteName] = useState('MusiConnect');

  // FONCTION DE CHARGEMENT UNIFIÉE ET AGRESSIVE POUR LE SITE NAME
  const loadSiteName = () => {
    console.log('🔍 SimpleFrontLayout - Loading site name...');
    
    try {
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('✅ SimpleFrontLayout - Design found:', design);
        
        if (design.siteName) {
          setSiteName(design.siteName);
          document.title = design.siteName;
          console.log('🎯 SimpleFrontLayout - Applied siteName:', design.siteName);
          return;
        }
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 SimpleFrontLayout - Settings fallback:', settings);
        
        if (settings.siteName) {
          setSiteName(settings.siteName);
          document.title = settings.siteName;
          console.log('🎯 SimpleFrontLayout - Applied siteName from settings:', settings.siteName);
        }
      }

    } catch (error) {
      console.error('❌ SimpleFrontLayout - Error loading site name:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 SimpleFrontLayout - Initializing...');
    
    // Chargement immédiat
    loadSiteName();

    const handleUpdate = () => {
      console.log('📡 SimpleFrontLayout - Event received, reloading...');
      setTimeout(loadSiteName, 10);
    };

    // Écouter TOUS les événements
    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('websiteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // Polling agressif toutes les secondes
    const interval = setInterval(loadSiteName, 1000);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontNavigation siteName={siteName} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
