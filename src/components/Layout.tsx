
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ChatWidget } from './ChatWidget';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <Header />
            <main className="flex-1 p-6 overflow-auto bg-background text-foreground">
              {children}
            </main>
          </SidebarInset>
        </div>
        <ChatWidget />
      </SidebarProvider>
    </div>
  );
};
