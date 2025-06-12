
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Palette, 
  Calendar, 
  CheckSquare, 
  FileText, 
  Mail, 
  MessageSquare, 
  CalendarDays, 
  FileStack, 
  Route, 
  ShoppingBag, 
  Target, 
  Globe, 
  Settings,
  UserCog,
  Forms
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Listes de contacts', href: '/contact-lists', icon: UserPlus },
  { name: 'Artistes', href: '/artists', icon: Palette },
  { name: 'Événements', href: '/events', icon: Calendar },
  { name: 'Types d\'événements', href: '/event-types', icon: CalendarDays },
  { name: 'Tâches', href: '/tasks', icon: CheckSquare },
  { name: 'Contrats', href: '/contracts', icon: FileText },
  { name: 'Email', href: '/email', icon: Mail },
  { name: 'Campagnes email', href: '/email-campaigns', icon: Mail },
  { name: 'Messagerie', href: '/messagerie', icon: MessageSquare },
  { name: 'Agenda', href: '/agenda', icon: CalendarDays },
  { name: 'Ressources', href: '/show-bible', icon: FileStack },
  { name: 'Road Show', href: '/road-show', icon: Route },
  { name: 'Merchandise', href: '/merchandise', icon: ShoppingBag },
  { name: 'Opportunités', href: '/opportunities', icon: Target },
  { name: 'Site Web', href: '/website', icon: Globe },
  { name: 'Formulaires', href: '/forms', icon: Forms },
  { name: 'Gestion Utilisateurs', href: '/user-management', icon: UserCog },
  { name: 'Application', href: '/application', icon: Settings },
  { name: 'Préférences', href: '/preferences', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-background border-r border-border">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5 flex-shrink-0',
                    isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
