
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { PublicChatWidget } from '@/components/PublicChatWidget';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'
];

export const Layout: React.FC = () => {
  const location = useLocation();
  
  console.log('🏗️ Layout - Rendering for path:', location.pathname);
  
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  console.log('🏗️ Layout - Is admin route:', isAdminRoute);
  
  if (!isAdminRoute) {
    console.log('🏗️ Layout - Not admin route, rendering outlet only');
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <BackOfficeHeader />
          <main className="flex-1 overflow-auto p-6 bg-white">
            <Outlet />
          </main>
        </div>
      </div>
      <PublicChatWidget />
    </SidebarProvider>
  );
};
