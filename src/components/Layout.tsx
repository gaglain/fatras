
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { Toaster } from '@/components/ui/toaster';
import { ChatWidget } from '@/components/ChatWidget';
import { useTheme } from '@/contexts/ThemeContext';

export const Layout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();
  
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

  // Fond dynamique : back office clair/sombre selon thème
  const backBg = theme === 'dark' ? "bg-[#1632f4]" : "bg-white";
  const backText = theme === 'dark' ? "text-white" : "text-[#1632f4]";

  return (
    <div className={`min-h-screen ${isAdminRoute ? `${backBg} ${backText}` : "bg-background"} transition-colors`}>
      {isAdminRoute ? (
        <SidebarProvider>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <BackOfficeHeader />
              {/* Ajouter du padding général sur les pages */}
              <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-10">
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
          <main className="flex-1 min-h-screen p-6 sm:p-10">
            <Outlet />
          </main>
          {/* Toaster en front si nécessaire */}
        </>
      )}
    </div>
  );
};
