
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { ChatWidget } from '@/components/ChatWidget';
import { TaskNotificationBanner } from '@/components/TaskNotificationBanner';

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
  
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  console.log('🏗️ Layout - WITH CHAT - Path:', location.pathname, 'isAdmin:', isAdminRoute);
  
  if (!isAdminRoute) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <BackOfficeHeader />
          
          <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">
            <TaskNotificationBanner className="mb-2 sm:mb-4" />
            {children}
          </main>
        </div>
      </div>
      <ChatWidget />
    </SidebarProvider>
  );
};
