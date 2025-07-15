
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';

export const SimpleFrontLayout: React.FC = () => {
  const [siteName, setSiteName] = useState('MusiConnect');

  const loadSiteName = () => {
    try {
      // Charger depuis websiteDesign en priorité
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        if (design.siteName && design.siteName !== siteName) {
          console.log('✅ SimpleFrontLayout - Loading siteName from design:', design.siteName);
          setSiteName(design.siteName);
          document.title = design.siteName;
          return design.siteName;
        }
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.siteName && settings.siteName !== siteName) {
          console.log('✅ SimpleFrontLayout - Loading siteName from settings:', settings.siteName);
          setSiteName(settings.siteName);
          document.title = settings.siteName;
          return settings.siteName;
        }
      }
    } catch (error) {
      console.error('❌ SimpleFrontLayout - Error:', error);
    }
    return null;
  };

  useEffect(() => {
    // Chargement initial
    const loadedName = loadSiteName();
    console.log('🚀 SimpleFrontLayout - Initial load result:', loadedName);

    // Écouter les événements de stockage
    const handleStorageChange = () => {
      console.log('📡 SimpleFrontLayout - Storage change detected');
      setTimeout(loadSiteName, 50);
    };

    // Écouter les événements personnalisés
    const handleCustomEvent = () => {
      console.log('📡 SimpleFrontLayout - Custom event detected');
      setTimeout(loadSiteName, 50);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('websiteDesignUpdated', handleCustomEvent);
    window.addEventListener('websiteDesignSaved', handleCustomEvent);
    window.addEventListener('websiteSettingsUpdated', handleCustomEvent);

    // Vérification toutes les 2 secondes
    const interval = setInterval(() => {
      const currentName = loadSiteName();
      if (currentName) {
        console.log('🔄 SimpleFrontLayout - Interval check found update:', currentName);
      }
    }, 2000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('websiteDesignUpdated', handleCustomEvent);
      window.removeEventListener('websiteDesignSaved', handleCustomEvent);
      window.removeEventListener('websiteSettingsUpdated', handleCustomEvent);
      clearInterval(interval);
    };
  }, [siteName]);

  console.log('🎯 SimpleFrontLayout - Current siteName:', siteName);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontNavigation siteName={siteName} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
