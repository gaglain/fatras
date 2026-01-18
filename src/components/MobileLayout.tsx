import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sidebar, SidebarContent, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import { PanelLeft, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface MobileLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, className }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Fermer la sidebar sur mobile quand on change de route
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  if (!isMobile) {
    // Version desktop normale
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className={cn("flex-1 p-4", className)}>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // Version mobile optimisée
  return (
    <div className="flex min-h-screen w-full relative">
      {/* Sidebar mobile en overlay */}
      {sidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r z-50 transform transition-transform duration-300">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-semibold">Menu</h2>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto h-[calc(100vh-65px)]">
              <AppSidebar />
            </div>
          </div>
        </>
      )}

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Header mobile */}
        <div className="border-b bg-background px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="shrink-0"
            >
              <PanelLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <img 
                src="/logo.svg" 
                alt="Fatras Booking" 
                className="h-6 w-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h1 className="font-semibold text-sm truncate">
                Fatras Booking
              </h1>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <span className="text-xs">🔔</span>
              <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-red-500">
                3
              </Badge>
            </Button>
          </div>
        </div>

        {/* Contenu principal mobile */}
        <main className={cn("flex-1 p-3 overflow-y-auto", className)}>
          {children}
        </main>
      </div>
    </div>
  );
};