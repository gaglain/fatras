
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
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [companySettings, setCompanySettings] = useState({
    name: 'Fatras Booking',
    logo: ''
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
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || 'U'}
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
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {showNotifications && (
        <NotificationCenter onClose={() => setShowNotifications(false)} />
      )}

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}
    </header>
  );
};
