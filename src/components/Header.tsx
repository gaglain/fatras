
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Bell, Search, Settings, User, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { NotificationCenter } from './NotificationCenter';
import { UserProfile } from './UserProfile';

export const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: 'Fatras Booking',
    logo: '',
    favicon: ''
  });

  // Charger les paramètres de l'entreprise
  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('companySettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setCompanySettings(settings);
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres:', error);
        }
      }
    };

    // Charger au démarrage
    loadSettings();

    // Écouter les changements de paramètres
    const handleSettingsChange = () => {
      loadSettings();
    };

    window.addEventListener('companySettingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('companySettingsChanged', handleSettingsChange);
    };
  }, []);

  // Mettre à jour le favicon quand les paramètres changent
  useEffect(() => {
    if (companySettings.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = companySettings.favicon;
      if (!document.querySelector("link[rel*='icon']")) {
        document.getElementsByTagName('head')[0].appendChild(link);
      }
    }
  }, [companySettings.favicon]);

  const getUserDisplayName = () => {
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.first_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name || ''}`.trim();
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserAvatar = () => {
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture || '';
  };

  return (
    <header className="bg-background border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            {companySettings.logo && (
              <img 
                src={companySettings.logo} 
                alt={companySettings.name}
                className="h-8 w-8 object-contain"
              />
            )}
            <h1 className="text-xl font-bold text-foreground">
              {companySettings.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 w-80"
            />
          </div>

          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={getUserAvatar()} alt={getUserDisplayName()} />
                  <AvatarFallback>
                    {getUserDisplayName().charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuItem onClick={() => setShowProfile(true)}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Paramètres</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showNotifications && (
        <NotificationCenter />
      )}

      {showProfile && (
        <UserProfile />
      )}
    </header>
  );
};
