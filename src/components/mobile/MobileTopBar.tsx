import React, { useState, useEffect } from 'react';
import { Menu, X, LogOut, ChevronRight, User, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { navigationData } from '@/data/navigationData';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { NotificationBadge } from '@/components/notifications/NotificationBadge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { NotificationList } from '@/components/notifications/NotificationList';
import { useMessagingUnreadCount } from '@/hooks/useMessagingUnreadCount';

export const MobileTopBar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [appLogo, setAppLogo] = useState<string>('');
  const [userProfile, setUserProfile] = useState<{ avatar_url?: string } | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { unreadCount: generalUnreadCount } = useNotifications();
  const { getUnreadCount } = useEmailNotifications();
  const messagingUnreadCount = useMessagingUnreadCount();
  
  // Comptage total des notifications (général + email + messagerie)
  const totalUnreadCount = generalUnreadCount + getUnreadCount() + messagingUnreadCount;

  useEffect(() => {
    const loadAppSettings = async () => {
      const { data } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'app_icon')
        .maybeSingle();
      
      if (data?.setting_value) {
        setAppLogo(data.setting_value);
      }
    };

    const loadUserProfile = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('user_profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setUserProfile(data);
      }
    };

    loadAppSettings();
    loadUserProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Déconnexion réussie');
      navigate('/auth');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const toggleSection = (sectionName: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Top Bar - safe area for PWA standalone mode */}
      <header
        className="fixed top-0 left-0 right-0 h-14 bg-background border-b z-40 flex items-center justify-between px-4"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          height: 'calc(3.5rem + env(safe-area-inset-top))',
        }}
      >
        <div className="flex items-center gap-2">
          {appLogo ? (
            <img 
              src={appLogo} 
              alt="Logo" 
              className="h-8 w-8 rounded object-cover"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          ) : (
            <img 
              src="/lovable-uploads/0dc85f93-e1c6-4afe-9b81-8b29ee2a3dcf.png" 
              alt="Logo" 
              className="h-6 w-6"
              onError={(e) => e.currentTarget.style.display = 'none'}
            />
          )}
          <h1 className="font-semibold text-sm">Fatras</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell className="h-5 w-5" />
            <NotificationBadge count={totalUnreadCount} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => navigate('/preferences')}
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={userProfile?.avatar_url} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* Slide-in Menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
            style={{ top: 'calc(3.5rem + env(safe-area-inset-top))' }}
            onClick={() => setMenuOpen(false)}
          />
          
          <div
            className="fixed right-0 w-80 bg-background border-l z-50 animate-slide-in-right overflow-y-auto"
            style={{
              top: 'calc(3.5rem + env(safe-area-inset-top))',
              height: 'calc(100vh - 3.5rem - env(safe-area-inset-top))'
            }}
          >
            <div className="p-4">
              <div className="space-y-1">
                {navigationData.filter(item => item.visible !== false).map((item) => (
                  <div key={item.name}>
                    {item.children && item.children.length > 0 ? (
                      <>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-between",
                            isActive(item.href) && "bg-accent"
                          )}
                          onClick={() => toggleSection(item.name)}
                        >
                          <div className="flex items-center">
                            <item.icon className="mr-2 h-4 w-4" />
                            {item.name}
                          </div>
                          <ChevronRight 
                            className={cn(
                              "h-4 w-4 transition-transform",
                              expandedSections.includes(item.name) && "rotate-90"
                            )} 
                          />
                        </Button>
                        {expandedSections.includes(item.name) && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => (
                              <Button
                                key={child.href}
                                variant="ghost"
                                size="sm"
                                className={cn(
                                  "w-full justify-start",
                                  isActive(child.href) && "bg-accent"
                                )}
                                onClick={() => handleNavigation(child.href)}
                              >
                                <child.icon className="mr-2 h-3 w-3" />
                                {child.name}
                              </Button>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start",
                          isActive(item.href) && "bg-accent"
                        )}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <item.icon className="mr-2 h-4 w-4" />
                        {item.name}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="pt-4 border-t mt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Notification Center Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent side="right" className="w-full sm:w-96">
          <div className="h-full overflow-y-auto">
            <NotificationList />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
