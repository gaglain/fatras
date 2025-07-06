
import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { PublicChatWidget } from '@/components/PublicChatWidget';
import { ChatWidget } from '@/components/ChatWidget';
import { useCustomColors } from '@/hooks/useCustomColors';
import { useWebsiteSync } from '@/hooks/useWebsiteSync';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contracts', '/tasks', '/roadshow', '/road-show', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Appliquer les couleurs personnalisées
  useCustomColors();
  
  // Activer la synchronisation du site web
  useWebsiteSync();
  
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
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-80">
            <AppSidebar />
          </SheetContent>
        </Sheet>

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header with Burger Menu */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="flex items-center space-x-2"
            >
              <Menu className="h-5 w-5" />
              <span>Menu</span>
            </Button>
            <BackOfficeHeader />
          </div>

          {/* Desktop Header */}
          <div className="hidden lg:block">
            <BackOfficeHeader />
          </div>

          <main 
            className="flex-1 overflow-auto p-4 lg:p-6"
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
