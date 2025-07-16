
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontHeader } from './SimpleFrontHeader';
import { SimpleFrontFooter } from './SimpleFrontFooter';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useWebsiteConfigSync } from '@/hooks/useWebsiteConfigSync';

export const NewSimpleFrontLayout: React.FC = () => {
  const { config } = useWebsiteConfig();
  const { forceSync } = useWebsiteConfigSync();

  console.log('🏗️ Layout rendering with:', config.siteName);

  useEffect(() => {
    forceSync();
  }, [forceSync]);

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
