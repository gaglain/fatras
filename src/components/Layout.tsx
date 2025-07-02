
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { PublicChatWidget } from '@/components/PublicChatWidget';
import { ChatWidget } from '@/components/ChatWidget';
import { useCustomColors } from '@/hooks/useCustomColors';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'
];

export const Layout: React.FC = () => {
  const location = useLocation();
  
  // Appliquer les couleurs personnalisées
  useCustomColors();
  
  console.log('🏗️ Layout - Rendering for path:', location.pathname);
  
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  console.log('🏗️ Layout - Is admin route:', isAdminRoute);
  
  if (!isAdminRoute) {
    console.log('🏗️ Layout - Not admin route, rendering outlet only');
    return (
      <>
        <Outlet />
        <PublicChatWidget />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div 
        className="flex h-screen w-full"
        style={{ 
          backgroundColor: 'var(--app-background, #ffffff)',
          color: 'var(--app-text, #18181b)'
        }}
      >
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <BackOfficeHeader />
          <main 
            className="flex-1 overflow-auto p-6"
            style={{ 
              backgroundColor: 'var(--app-background, #ffffff)'
            }}
          >
            <Outlet />
          </main>
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};
