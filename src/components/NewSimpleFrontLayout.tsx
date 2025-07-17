
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontHeader } from './SimpleFrontHeader';
import { SimpleFrontFooter } from './SimpleFrontFooter';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { useUnifiedWebsiteSync } from '@/hooks/useUnifiedWebsiteSync';

export const NewSimpleFrontLayout: React.FC = () => {
  const { config } = useWebsiteConfig();
  const { forceSync } = useUnifiedWebsiteSync();

  console.log('🏗️ Layout rendering with:', config.siteName);

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
