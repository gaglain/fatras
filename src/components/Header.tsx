
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, User, Settings, LogOut, MessageSquare } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';
import { UserProfile } from './UserProfile';
import { ThemeToggle } from './ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { Link } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';

export const Header: React.FC = () => {
  const { currentUser } = useUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [unreadCount, setUnreadCount] = useState(3);
  const [companySettings, setCompanySettings] = useState({
    name: 'Fatras Booking',
    logo: '',
    favicon: ''
  });

  useEffect(() => {
    const loadCompanySettings = () => {
      const saved = localStorage.getItem('companySettings');
      if (saved) {
        try {
          const settings = JSON.parse(saved);
          setCompanySettings(settings);
          console.log('Paramètres de l\'entreprise chargés dans Header:', settings);
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres de l\'entreprise:', error);
        }
      }
    };

    // Charger au montage
    loadCompanySettings();

    // Écouter les changements
    const handleCompanySettingsChange = (event: CustomEvent) => {
      console.log('Header: paramètres entreprise mis à jour', event.detail);
      setCompanySettings(event.detail);
    };

    window.addEventListener('companySettingsChanged', handleCompanySettingsChange as EventListener);

    return () => {
      window.removeEventListener('companySettingsChanged', handleCompanySettingsChange as EventListener);
    };
  }, []);

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <SidebarTrigger />
          {companySettings.logo ? (
            <img 
              src={companySettings.logo} 
              alt="Logo entreprise" 
              className="h-8 w-auto max-w-[120px] object-contain"
              onError={(e) => {
                console.error('Erreur de chargement du logo:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-8 w-8 bg-primary rounded flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {companySettings.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-xl font-semibold text-foreground">
            {companySettings.name}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            
            <ThemeToggle />
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 z-50">
                  <NotificationCenter onClose={() => setShowNotifications(false)} />
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback>
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/messagerie">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {showUserProfile && (
          <UserProfile onClose={() => setShowUserProfile(false)} />
        )}
      </div>
    </div>
  );
};
