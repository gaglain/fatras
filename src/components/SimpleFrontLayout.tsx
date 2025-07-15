
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontNavigation } from './SimpleFrontNavigation';
import { useSiteConfig } from '@/hooks/useSiteConfig';

export const SimpleFrontLayout: React.FC = () => {
  const { siteName } = useSiteConfig();

  console.log('🎯 SimpleFrontLayout - Current siteName:', siteName);

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontNavigation />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
