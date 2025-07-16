
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

  // Force reload when component mounts or config changes
  useEffect(() => {
    console.log('🔄 Layout effect - forcing config reload');
    forceSync();
  }, [forceSync]);

  // Listen for force reload events
  useEffect(() => {
    const handleForceReload = () => {
      console.log('🔄 Force reload event received in layout');
      reloadConfig();
    };

    window.addEventListener('websiteConfigForceReload', handleForceReload);
    
    return () => {
      window.removeEventListener('websiteConfigForceReload', handleForceReload);
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
