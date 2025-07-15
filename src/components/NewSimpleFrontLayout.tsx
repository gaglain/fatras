
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontHeader } from './SimpleFrontHeader';
import { SimpleFrontFooter } from './SimpleFrontFooter';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';

export const NewSimpleFrontLayout: React.FC = () => {
  const { config } = useWebsiteConfig();

  return (
    <div className="min-h-screen flex flex-col">
      <SimpleFrontHeader />
      <main className="flex-1 bg-white">
        <Outlet />
      </main>
      <SimpleFrontFooter />
    </div>
  );
};
