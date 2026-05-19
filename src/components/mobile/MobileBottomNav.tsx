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
      className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t z-30"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              data-tour={`mobilenav-${item.path}`}
              onClick={() => navigate(item.path)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                "transition-all duration-200 active:scale-95",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              {/* Active indicator dot */}
              {active && (
                <span className="absolute top-1.5 w-1 h-1 rounded-full bg-primary animate-in fade-in zoom-in duration-200" />
              )}
              
              <div className="relative mt-1">
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-200",
                  active && "stroke-[2.5] scale-110"
                )} />
                {/* Unread badge */}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
              
              <span className={cn(
                "text-[10px] leading-tight transition-all duration-200",
                active ? "font-semibold" : "font-normal"
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
