
import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { Toaster } from '@/components/ui/sonner';

export const Layout: React.FC = () => {
  const location = useLocation();
  
  // Routes qui nécessitent l'authentification admin
  const adminRoutes = ['/admin', '/website/backoffice'];
  const isAdminRoute = adminRoutes.some(route => location.pathname.startsWith(route));
  
  // Redirection pour les anciennes URLs du back-office
  if (location.pathname === '/website/backoffice') {
    return <Navigate to="/admin" replace />;
  }
  
  if (location.pathname.startsWith('/website/editor/')) {
    const pageId = location.pathname.split('/').pop();
    return <Navigate to={`/admin/editor/${pageId}`} replace />;
  }

  // Pour les routes admin, vérifier l'authentification (simulation)
  if (isAdminRoute) {
    // Ici vous pourriez ajouter une vraie vérification d'authentification
    // Pour l'instant, on simule un accès autorisé
    const isAuthenticated = true; // À remplacer par votre logique d'auth
    
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
            </div>
          </div>
        </SidebarProvider>
      ) : (
        <Outlet />
      )}
      <Toaster />
    </div>
  );
};
