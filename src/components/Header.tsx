
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User, LogOut, MessageSquare, ChevronDown } from 'lucide-react';
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
        } catch (error) {
          console.error('Erreur lors du chargement des paramètres de l\'entreprise:', error);
        }
      }
    };

    loadCompanySettings();

    const handleCompanySettingsChange = (event: CustomEvent) => {
      setCompanySettings(event.detail);
    };

    window.addEventListener('companySettingsChanged', handleCompanySettingsChange as EventListener);

    return () => {
      window.removeEventListener('companySettingsChanged', handleCompanySettingsChange as EventListener);
    };
  }, []);

  const handleNotificationClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowNotifications(prev => !prev);
    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showNotifications && !target.closest('.notification-popup') && !target.closest('.notification-button')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <>
      <div className="border-b shadow-sm bg-background relative">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-2 lg:space-x-4 min-w-0">
            <SidebarTrigger />
            {companySettings.logo ? (
              <img 
                src={companySettings.logo} 
                alt="Logo entreprise" 
                className="h-6 w-auto max-w-[80px] lg:h-8 lg:max-w-[120px] object-contain hidden sm:block"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="h-6 w-6 lg:h-8 lg:w-8 flex items-center justify-center hidden sm:flex text-foreground">
                <span className="font-bold text-xs lg:text-sm">
                  {companySettings.name.charAt(0)}
                </span>
              </div>
            )}
            <h1 className="text-base lg:text-xl font-semibold truncate text-foreground">
              {companySettings.name}
            </h1>
          </div>

          <div className="flex items-center space-x-2 lg:space-x-4">
            <div className="flex items-center space-x-1 lg:space-x-2">
              <ThemeToggle />
              
              {/* NOTIFICATION BUTTON */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNotificationClick}
                  className="relative notification-button text-foreground"
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs p-0 bg-red-500 text-white"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>

                {/* NOTIFICATION POPUP - POSITION ABSOLUE */}
                {showNotifications && (
                  <div 
                    className="notification-popup absolute top-full right-0 mt-2 z-[9999] w-96 max-w-[90vw]"
                  >
                    <NotificationCenter onClose={() => setShowNotifications(false)} />
                  </div>
                )}
              </div>
            </div>

            {/* USER DROPDOWN */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2 lg:px-3 text-foreground">
                  <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                    <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:block text-sm font-medium truncate max-w-[100px] lg:max-w-[150px]">
                    {currentUser?.name || 'Utilisateur'}
                  </span>
                  <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">
                    {currentUser?.name || 'Utilisateur'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser?.email || 'email@exemple.com'}
                  </p>
                </div>
                <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil & Préférences</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/messagerie">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
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
    </>
  );
};
