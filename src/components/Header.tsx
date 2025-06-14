
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Search, User, Settings, LogOut, MessageSquare, ChevronDown } from 'lucide-react';
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

    loadCompanySettings();

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
    <div className="border-b shadow-sm" style={{
      background: 'var(--custom-background, #ffffff)',
      borderColor: 'var(--custom-buttonBg, #1632f4)',
      borderOpacity: 0.2
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
                console.error('Erreur de chargement du logo:', e);
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="h-6 w-6 lg:h-8 lg:w-8 rounded flex items-center justify-center hidden sm:flex" style={{
              background: 'var(--custom-buttonBg, #1632f4)'
            }}>
              <span className="font-bold text-xs lg:text-sm" style={{
                color: 'var(--custom-buttonText, #ffffff)'
              }}>
                {companySettings.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-base lg:text-xl font-semibold truncate" style={{
            color: 'var(--custom-text, #18181b)'
          }}>
            {companySettings.name}
          </h1>
        </div>

        <div className="flex items-center space-x-2 lg:space-x-4">
          <div className="flex items-center space-x-1 lg:space-x-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-opacity-10" style={{
              color: 'var(--custom-text, #666666)'
            }}>
              <Search className="h-4 w-4" />
            </Button>
            
            <ThemeToggle />
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                className="relative hover:bg-opacity-10"
                style={{
                  color: 'var(--custom-text, #666666)'
                }}
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs p-0"
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
              <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2 lg:px-3 hover:bg-opacity-10" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                  <AvatarImage src={currentUser?.avatar} alt={currentUser?.name} />
                  <AvatarFallback className="text-xs" style={{
                    background: 'var(--custom-buttonBg, #1632f4)',
                    color: 'var(--custom-buttonText, #ffffff)'
                  }}>
                    {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium truncate max-w-[100px] lg:max-w-[150px]" style={{
                  color: 'var(--custom-text, #18181b)'
                }}>
                  {currentUser?.name || 'Utilisateur'}
                </span>
                <ChevronDown className="h-3 w-3 lg:h-4 lg:w-4" style={{
                  color: 'var(--custom-text, #666666)'
                }} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount style={{
              background: 'var(--custom-cardBg, #ffffff)',
              border: '1px solid rgba(0,0,0,0.1)'
            }}>
              <div className="px-3 py-2 border-b" style={{
                borderColor: 'rgba(0,0,0,0.1)'
              }}>
                <p className="text-sm font-medium" style={{
                  color: 'var(--custom-cardText, #18181b)'
                }}>
                  {currentUser?.name || 'Utilisateur'}
                </p>
                <p className="text-xs" style={{
                  color: 'var(--custom-text, #666666)'
                }}>
                  {currentUser?.email || 'email@exemple.com'}
                </p>
              </div>
              <DropdownMenuItem onClick={() => setShowUserProfile(true)} className="hover:bg-opacity-10" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <User className="mr-2 h-4 w-4" />
                <span>Profil & Préférences</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-opacity-10" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <Link to="/messagerie">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="hover:bg-opacity-10" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <Link to="/preferences">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Paramètres</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:bg-opacity-10" style={{
                color: 'var(--custom-text, #666666)'
              }}>
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
