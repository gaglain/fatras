
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { CommandPalette } from '@/components/ui/command-palette';
import { useTheme } from 'next-themes';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useUser } from '@/contexts/UserContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserProfile } from './UserProfile';
import { UnifiedNotificationCenter } from './UnifiedNotificationCenter';
import { AppSidebar } from '@/components/AppSidebar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';

export const BackOfficeHeader: React.FC = () => {
  const { theme } = useTheme();
  const { name, logo } = useCompanySettings();
  
  // Protection contre l'erreur de contexte
  let currentUser = null;
  try {
    const userContext = useUser();
    currentUser = userContext?.currentUser;
  } catch (error) {
    console.warn('⚠️ UserContext not available yet, using fallback');
    currentUser = null;
  }
  
const [showUserProfile, setShowUserProfile] = useState(false);
const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

const isDark = theme === "dark";

  return (
    <>
      <header className="shadow-elegant relative z-30 border-b transition-all duration-300 bg-background border-border backdrop-blur-sm supports-[backdrop-filter]:bg-background/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              {/* Menu Hamburger UNIQUEMENT pour mobile (caché sur desktop avec lg:hidden) */}
              <div className="lg:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Menu className="h-5 w-5" />
                      <span>Menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-80 bg-sidebar text-sidebar-foreground">
                    <AppSidebar collapsible="none" className="h-full" />
                  </SheetContent>
                </Sheet>
              </div>

              <Link to="/dashboard" className="flex items-center space-x-2 group">
                <img
                  src={logo || "/placeholder.svg"}
                  alt={name || 'Logo'}
                  className="h-8 w-8 lg:h-9 lg:w-9 object-contain"
                  style={{ filter: "drop-shadow(0 2px 7px #1632f4)" }}
                  onError={(e) => {
                    const img = e.currentTarget as HTMLImageElement;
                    if (img.src.endsWith('/placeholder.svg')) return;
                    img.src = '/placeholder.svg';
                  }}
                />
                <span className="text-base lg:text-lg font-bold tracking-tight transition-colors duration-300 text-foreground">
                  <span className="hidden sm:inline">{name || "Fatras Booking"}</span>
                  <span className="sm:hidden">{(name || "Fatras Booking").split(' ')[0]}</span>
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Palette de commandes - Responsive */}
              <div className="hidden sm:block w-32 md:w-64">
                <CommandPalette />
              </div>
              <div className="sm:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    // Trigger command palette on mobile
                    document.dispatchEvent(new KeyboardEvent('keydown', {
                      key: 'k',
                      ctrlKey: true,
                      bubbles: true
                    }));
                  }}
                  className="text-foreground"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                </Button>
              </div>
              
              <UnifiedNotificationCenter />
              
              <ThemeToggle />
              
              <button
                className="flex items-center space-x-2 focus:outline-none group transition-all duration-300 hover:bg-accent rounded-lg p-2"
                onClick={() => setShowUserProfile(true)}
                aria-label="Voir le profil"
              >
                <Avatar className="h-8 w-8 border-2 border-border hover:border-primary transition-colors">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="text-base bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                    {currentUser?.name?.charAt(0) || 'U'}
                    {currentUser?.lastName?.charAt(0) || ''}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium transition-colors duration-300 text-foreground group-hover:text-primary">
                  {currentUser?.name || 'Utilisateur'}
                </span>
              </button>
            </div>
          </div>
          
        </div>
      </header>
      
      {showUserProfile && (
        <UserProfile onClose={() => setShowUserProfile(false)} />
      )}
    </>
  );
};
