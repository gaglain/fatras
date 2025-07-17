
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleFrontHeader } from './SimpleFrontHeader';
import { SimpleFrontFooter } from './SimpleFrontFooter';
import { useSimpleWebsiteSync } from '@/hooks/useSimpleWebsiteSync';

export const NewSimpleFrontLayout: React.FC = () => {
  useSimpleWebsiteSync();

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
