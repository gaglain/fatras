
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { PublicChatWidget } from '@/components/PublicChatWidget';
import { ChatWidget } from '@/components/ChatWidget';
import { useCustomColors } from '@/hooks/useCustomColors';
import { ForceFrontendSync } from '@/components/ForceFrontendSync';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  
  // Hook pour les couleurs personnalisées (dashboard uniquement)
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  // ISOLATION COMPLETE: Couleurs personnalisées UNIQUEMENT pour le dashboard
  if (isAdminRoute) {
    useCustomColors();
  }
  
  console.log('🏗️ Layout - Path:', location.pathname, 'isAdmin:', isAdminRoute);
  
  if (!isAdminRoute) {
    return (
      <>
        <ForceFrontendSync />
        {children}
        <PublicChatWidget />
      </>
    );
  }

  return (
    <SidebarProvider>
      <ForceFrontendSync />
      <div className="flex h-screen w-full">
        {/* Sidebar desktop seulement */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <BackOfficeHeader />
          
          <main className="flex-1 overflow-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};
