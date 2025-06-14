
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { Toaster } from '@/components/ui/sonner';
import { ChatWidget } from '@/components/ChatWidget';

export const Layout: React.FC = () => {
  const location = useLocation();
  
  // Routes nécessitant l'auth admin (back-office)
  const adminRoutes = ['/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts', '/contact-lists', '/contracts', '/tasks', '/roadshow', '/email', '/email-campaigns', '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types', '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'];
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));

  // Redirection (liens historiques)
  if (location.pathname === '/website/backoffice') {
    return <Navigate to="/admin" replace />;
  }
  if (location.pathname.startsWith('/website/editor/')) {
    const pageId = location.pathname.split('/').pop();
    return <Navigate to={`/admin/editor/${pageId}`} replace />;
  }

  // Simuler auth admin (à adapter selon système réel !)
  if (isAdminRoute) {
    const isAuthenticated = true;
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {isAdminRoute ? (
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <BackOfficeHeader />
              <main className="flex-1 overflow-auto">
                <Outlet />
              </main>
              {/* Toaster notifications et Widget Chat dans tout le back-office */}
              <Toaster />
              <ChatWidget />
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <>
          <Outlet />
          {/* Toaster en front si nécessaire */}
        </>
      )}
    </div>
  );
};
