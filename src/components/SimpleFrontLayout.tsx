
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const SimpleFrontLayout: React.FC = () => {
  const { config } = useWebsiteConfig();

  console.log('🎯 SimpleFrontLayout - Current siteName:', config.siteName);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontNavigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
