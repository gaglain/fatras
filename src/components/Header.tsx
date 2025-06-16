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

  const toggleNotifications = () => {
    console.log('🔔 NOTIFICATION CLICK - État actuel:', showNotifications);
    console.log('🔔 NOTIFICATION CLICK - DOM element exists:', document.querySelector('.notification-button'));
    console.log('🔔 NOTIFICATION CLICK - Popup element exists:', document.querySelector('.notification-popup'));
    
    const newState = !showNotifications;
    setShowNotifications(newState);
    
    console.log('🔔 NOTIFICATION CLICK - Nouvel état:', newState);
    
    if (newState) {
      setUnreadCount(0);
      console.log('🔔 NOTIFICATION OPENED - Compteur remis à zéro');
      
      // Vérifier que le popup apparaît après un délai
      setTimeout(() => {
        const popup = document.querySelector('.notification-popup');
        console.log('🔔 POPUP CHECK - Element trouvé:', popup);
        console.log('🔔 POPUP CHECK - Style display:', popup?.style?.display);
        console.log('🔔 POPUP CHECK - Computed style:', popup ? window.getComputedStyle(popup).display : 'not found');
      }, 100);
    }
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showNotifications && !target.closest('.notification-popup') && !target.closest('.notification-button')) {
        console.log('🔔 CLOSING - Click outside detected');
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      console.log('🔔 EVENT LISTENER - Adding click outside listener');
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      console.log('🔔 EVENT LISTENER - Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  // Debug: Log state changes
  useEffect(() => {
    console.log('🔔 STATE CHANGE - showNotifications:', showNotifications);
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
              
              {/* Notification Button avec debug */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🔔 BUTTON CLICKED - Direct click handler');
                    toggleNotifications();
                  }}
                  className="relative h-8 w-8 p-0 notification-button"
                  style={{ zIndex: 10 }}
                >
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      className="absolute -top-1 -right-1 h-4 w-4 lg:h-5 lg:w-5 flex items-center justify-center text-xs p-0 bg-red-500 text-white border-0"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
                
                {/* Debug info visible */}
                <div style={{ 
                  position: 'absolute', 
                  top: '40px', 
                  left: '0', 
                  fontSize: '10px', 
                  background: 'yellow', 
                  padding: '2px',
                  zIndex: 1000,
                  color: 'black'
                }}>
                  State: {showNotifications ? 'OPEN' : 'CLOSED'}
                </div>
              </div>
            </div>

            
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

      {/* Notification Popup avec debug maximum */}
      {showNotifications && (
        <div 
          className="notification-popup"
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            paddingTop: '70px',
            paddingRight: '20px'
          }}
        >
          <div style={{
            backgroundColor: 'white',
            border: '2px solid red',
            borderRadius: '8px',
            width: '400px',
            height: '500px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            color: 'black'
          }}>
            POPUP DE TEST VISIBLE
            <br />
            State: {showNotifications ? 'TRUE' : 'FALSE'}
          </div>
        </div>
      )}
    </>
  );
};
