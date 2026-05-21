import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, MapPin, Calendar, ContactRound, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMessagingUnreadCount } from '@/hooks/useMessagingUnreadCount';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  badge?: number;
}

export const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const messagingUnreadCount = useMessagingUnreadCount();

  const navItems: NavItem[] = [
    { icon: Home, label: 'Accueil', path: '/dashboard' },
    { icon: MapPin, label: 'Tournée', path: '/roadshow' },
    { icon: Calendar, label: 'Agenda', path: '/events' },
    { icon: MessageCircle, label: 'Messages', path: '/messagerie', badge: messagingUnreadCount },
    { icon: ContactRound, label: 'Contacts', path: '/contacts' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              data-tour={`mobilenav-${item.path}`}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 flex-1 my-1.5 rounded-md",
                "transition-all duration-200 active:scale-95",
                active
                  ? "text-primary-foreground bg-foreground shadow-sm"
                  : "text-foreground/70 hover:text-foreground"
              )}
            >
              <div className="relative">
                <item.icon className={cn(
                  "h-[18px] w-[18px] transition-all duration-200",
                  active ? "stroke-[2]" : "stroke-[1.75]"
                )} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center border border-card">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              <span className={cn(
                "text-[10px] leading-none tracking-wide uppercase transition-all",
                active ? "font-semibold" : "font-medium"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
