
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { Toaster } from '@/components/ui/toaster';
import { ChatWidget } from '@/components/ChatWidget';
import { useTheme } from '@/contexts/ThemeContext';

// Définir les routes back-office nécessitant header + sidebar
const adminRoutes = [
  '/admin', '/dashboard', '/artists', '/events', '/agenda', '/contacts',
  '/contact-lists', '/contracts', '/tasks', '/roadshow', '/email', '/email-campaigns',
  '/messagerie', '/forms', '/merchandise', '/show-bible', '/opportunities', '/event-types',
  '/user-management', '/preferences', '/application', '/publication-calendar', '/website', '/website-editor'
];

export const Layout: React.FC = () => {
  const location = useLocation();
  const { theme } = useTheme();

  // Vérifier si on est sur une route back-office
  const isAdminRoute = adminRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));

  // Gère les redirections historiques
  if (location.pathname === '/website/backoffice') {
    return <Navigate to="/admin" replace />;
  }
  if (location.pathname.startsWith('/website/editor/')) {
    const pageId = location.pathname.split('/').pop();
    return <Navigate to={`/admin/editor/${pageId}`} replace />;
  }

  // Simuler une authentification back-office
  if (isAdminRoute) {
    const isAuthenticated = true;
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
  }

  // Styles selon les thèmes pour le back-office
  const backBg = theme === 'dark' ? "bg-[#1632f4]" : "bg-white";
  const backText = theme === 'dark' ? "text-white" : "text-[#1632f4]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isAdminRoute ? `${backBg} ${backText}` : "bg-background"
    }`}>
    {isAdminRoute ? (
      <SidebarProvider>
        <div className="flex h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <BackOfficeHeader />
            {/* Ajout de l'espace : padding plus important */}
            <main className="flex-1 overflow-auto p-6 sm:p-8 lg:p-12">
              <Outlet />
            </main>
            {/* Notifications Toaster et Widget Chat toujours présents */}
            <Toaster />
            <ChatWidget />
          </div>
        </div>
      </SidebarProvider>
    ) : (
      <>
        {/* Padding renforcé côté front aussi */}
        <main className="flex-1 min-h-screen p-6 sm:p-10">
          <Outlet />
        </main>
      </>
    )}
    </div>
  );
};
