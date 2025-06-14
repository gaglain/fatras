
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { ChatWidget } from './ChatWidget';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`} style={{ background: 'hsl(var(--arc-content))' }}>
      <MessagingProvider>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <SidebarInset className="flex-1 min-w-0">
              <div className="arc-content h-full">
                <Header />
                <main className="flex-1 p-6 overflow-auto">
                  <div className="max-w-full">
                    {children}
                  </div>
                </main>
              </div>
            </SidebarInset>
          </div>
          <ChatWidget />
        </SidebarProvider>
      </MessagingProvider>
    </div>
  );
};
