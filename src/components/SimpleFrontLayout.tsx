
import React from 'react';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

interface SimpleFrontLayoutProps {
  children: React.ReactNode;
}

export const SimpleFrontLayout: React.FC<SimpleFrontLayoutProps> = ({ children }) => {
  const { config } = useWebsiteConfig();

  console.log('🎯 SimpleFrontLayout - Current siteName:', config.siteName);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontNavigation />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};
