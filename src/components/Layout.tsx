
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { ChatWidget } from '@/components/ChatWidget';
import { TaskNotificationBanner } from '@/components/TaskNotificationBanner';
import { UnifiedNotificationCenter } from '@/components/UnifiedNotificationCenter';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileBottomNav } from '@/components/mobile/MobileBottomNav';
import { MobileTopBar } from '@/components/mobile/MobileTopBar';
import { useNotifications } from '@/hooks/useNotifications';
import { usePWABadge } from '@/hooks/usePWABadge';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contact-types', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor', '/assignments'
];

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const { unreadCount } = useNotifications();
  
  // Mettre à jour le badge PWA avec le nombre de notifications non lues
  usePWABadge(unreadCount);
  
  const isAdminRoute = adminRoutes.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );
  
  console.log('🏗️ Layout - WITH CHAT - Path:', location.pathname, 'isAdmin:', isAdminRoute, 'isMobile:', isMobile);
  
  if (!isAdminRoute) {
    return (
      <>
        {children}
        <ChatWidget />
      </>
    );
  }

  // Mobile Admin Layout
  if (isMobile) {
    return (
      <div className="flex flex-col h-screen w-full pb-16 pt-14">
        <MobileTopBar />
        
        <main className="flex-1 overflow-auto p-3">
          <TaskNotificationBanner className="mb-3" />
          {children}
        </main>

        <MobileBottomNav />
        <ChatWidget />
      </div>
    );
  }

  // Desktop Admin Layout
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b">
            <BackOfficeHeader />
          </div>
          
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
