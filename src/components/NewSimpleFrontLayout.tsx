
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontHeader } from './SimpleFrontHeader';
import { SimpleFrontFooter } from './SimpleFrontFooter';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useWebsiteConfigSync } from '@/hooks/useWebsiteConfigSync';

export const NewSimpleFrontLayout: React.FC = () => {
  const { config, reloadConfig } = useWebsiteConfig();
  const { forceSync } = useWebsiteConfigSync();

  console.log('🏗️ Layout rendering with config:', config.siteName);

  // Force reload when component mounts
  useEffect(() => {
    console.log('🔄 Layout mounted - forcing config reload');
    forceSync();
  }, [forceSync]);

  // Listen for configuration changes
  useEffect(() => {
    const handleConfigUpdate = () => {
      console.log('🔄 Config update event received in layout');
      reloadConfig();
    };

    window.addEventListener('websiteConfigChanged', handleConfigUpdate);
    window.addEventListener('websiteConfigReload', handleConfigUpdate);
    window.addEventListener('websiteConfigForceReload', handleConfigUpdate);
    
    return () => {
      window.removeEventListener('websiteConfigChanged', handleConfigUpdate);
      window.removeEventListener('websiteConfigReload', handleConfigUpdate);
      window.removeEventListener('websiteConfigForceReload', handleConfigUpdate);
    };
  }, [reloadConfig]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SimpleFrontHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <SimpleFrontFooter />
    </div>
  );
};
