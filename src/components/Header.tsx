
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
    <div className="border-b shadow-sm" style={{
      background: 'var(--app-background)',
      borderColor: 'rgba(0,0,0,0.1)'
    }}>
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
            <div className="h-6 w-6 lg:h-8 lg:w-8 flex items-center justify-center hidden sm:flex" style={{
              color: 'var(--app-text)'
            }}>
              <span className="font-bold text-xs lg:text-sm">
                {companySettings.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-base lg:text-xl font-semibold truncate" style={{
            color: 'var(--app-text)'
          }}>
            {companySettings.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <ThemeToggle />
            
            {/* NOTIFICATION BUTTON - POPUP FIXE EN HAUT À DROITE */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative notification-button"
                style={{
                  color: 'var(--app-text)',
                  background: 'transparent'
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs p-0"
                    style={{
                      background: '#ec5f65',
                      color: '#ffffff'
                    }}
                  >
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* USER DROPDOWN */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2 lg:px-3" style={{
                color: 'var(--app-text)'
              }}>
                <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="text-xs" style={{
                    background: 'var(--app-button-bg)',
                    color: 'var(--app-button-text)'
                  }}>
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium truncate max-w-[100px] lg:max-w-[150px]">
                  {currentUser?.name || 'Utilisateur'}
                </span>
                <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount style={{
              background: 'var(--app-card-bg)',
              color: 'var(--app-card-text)',
              border: '1px solid rgba(0,0,0,0.1)',
              zIndex: 9999
            }}>
              <div className="px-3 py-2 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--app-card-text)' }}>
                  {currentUser?.name || 'Utilisateur'}
                </p>
                <p className="text-xs opacity-70" style={{ color: 'var(--app-card-text)' }}>
                  {currentUser?.email || 'email@exemple.com'}
                </p>
              </div>
              <DropdownMenuItem onClick={() => setShowUserProfile(true)} style={{
                color: 'var(--app-card-text)'
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil & Préférences</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/messagerie" style={{ color: 'var(--app-card-text)' }}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator style={{ borderColor: 'rgba(0,0,0,0.1)' }} />
              <DropdownMenuItem style={{ color: 'var(--app-card-text)' }}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Déconnexion</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* NOTIFICATION POPUP EN POSITION FIXE */}
        {showNotifications && (
          <div className="notification-popup">
            <NotificationCenter onClose={() => setShowNotifications(false)} />
          </div>
        )}

        {showUserProfile && (
          <UserProfile onClose={() => setShowUserProfile(false)} />
        )}
      </div>
    </div>
  );
};
