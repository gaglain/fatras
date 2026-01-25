
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, User, LogOut, MessageSquare, ChevronDown, Mail } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { ThemeToggle } from './ThemeToggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { NotificationCenter } from '@/components/NotificationCenter';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';

export const Header: React.FC = () => {
  const { currentUser } = useUser();
  const { signOut } = useAuth();
  const { unreadCount } = useNotifications();
  const { getUnreadCount: getEmailUnreadCount } = useEmailNotifications();
  const navigate = useNavigate();
  
  const emailUnreadCount = getEmailUnreadCount();
  
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
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
        } catch {
          // Silent fail for settings loading
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

  const handleNotificationClick = () => {
    setShowNotificationCenter(prev => !prev);
  };

  const handleSignOut = async () => {
    try {
      const { error } = await signOut();
      if (error) throw error;
      toast.success('Déconnexion réussie');
    } catch {
      toast.error('Erreur lors de la déconnexion');
    }
  };

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
                  const img = e.currentTarget as HTMLImageElement;
                  if (img.src.endsWith('/placeholder.svg')) return;
                  img.src = '/placeholder.svg';
                  img.style.display = 'block';
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
              
              {/* Email notification button */}
              <Button
                onClick={() => navigate('/emails')}
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
                title="Emails"
              >
                <Mail className="h-5 w-5" />
                {emailUnreadCount > 0 && (
                  <div 
                    className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center 
                               text-destructive-foreground text-xs font-bold rounded-full 
                               bg-primary border-2 border-background
                               animate-pulse shadow-lg z-10"
                  >
                    {emailUnreadCount > 99 ? '99+' : emailUnreadCount}
                  </div>
                )}
              </Button>
              
              {/* General notifications button */}
              <div className="relative">
                 <Button
                  onClick={handleNotificationClick}
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10"
                >
                   <Bell className="h-5 w-5" />
                   {unreadCount > 0 && (
                     <div 
                       className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 flex items-center justify-center 
                                  text-destructive-foreground text-xs font-bold rounded-full 
                                  bg-destructive border-2 border-background
                                  animate-pulse shadow-lg z-10"
                     >
                       {unreadCount > 99 ? '99+' : unreadCount}
                     </div>
                   )}
                </Button>
                
                {showNotificationCenter && (
                  <div 
                    className="absolute top-12 right-0 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <NotificationCenter onClose={() => setShowNotificationCenter(false)} />
                  </div>
                )}
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
              <DropdownMenuContent className="w-56 z-[9998] bg-background border" align="end" forceMount>
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
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {showUserProfile && (
              <UserProfile onClose={() => setShowUserProfile(false)} />
            )}
          </div>
        </div>
      </div>

    </>
  );
};
