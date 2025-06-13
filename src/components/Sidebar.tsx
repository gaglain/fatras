import React, { useState, useEffect } from 'react';
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
  ChevronDown,
  ChevronRight,
  Briefcase
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  visible?: boolean;
  children?: MenuItem[];
}

const defaultNavigation: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, visible: true },
  { 
    name: 'Contacts & Relations', 
    href: '/contacts', 
    icon: Users, 
    visible: true,
    children: [
      { name: 'Contacts', href: '/contacts', icon: Users, visible: true },
      { name: 'Listes de contacts', href: '/contact-lists', icon: UserPlus, visible: true }
    ]
  },
  { name: 'Artistes', href: '/artists', icon: Palette, visible: true },
  { 
    name: 'Événements & Agenda', 
    href: '/events', 
    icon: Calendar, 
    visible: true,
    children: [
      { name: 'Événements', href: '/events', icon: Calendar, visible: true },
      { name: 'Types d\'événements', href: '/event-types', icon: CalendarDays, visible: true },
      { name: 'Agenda', href: '/agenda', icon: CalendarDays, visible: true }
    ]
  },
  { 
    name: 'Booking', 
    href: '/opportunities', 
    icon: Briefcase, 
    visible: true,
    children: [
      { name: 'Opportunités', href: '/opportunities', icon: Target, visible: true },
      { name: 'Contrats', href: '/contracts', icon: FileText, visible: true },
      { name: 'Tâches', href: '/tasks', icon: CheckSquare, visible: true }
    ]
  },
  { 
    name: 'Communication', 
    href: '/email', 
    icon: Mail, 
    visible: true,
    children: [
      { name: 'Email', href: '/email', icon: Mail, visible: true },
      { name: 'Campagnes email', href: '/email-campaigns', icon: Mail, visible: true },
      { name: 'Messagerie', href: '/messagerie', icon: MessageSquare, visible: true },
      { name: 'Formulaires', href: '/forms', icon: FileText, visible: true }
    ]
  },
  { name: 'Ressources', href: '/show-bible', icon: FileStack, visible: true },
  { 
    name: 'Production & Ventes', 
    href: '/road-show', 
    icon: Route, 
    visible: true,
    children: [
      { name: 'Feuille de route', href: '/road-show', icon: Route, visible: true },
      { name: 'Merchandise', href: '/merchandise', icon: ShoppingBag, visible: true }
    ]
  },
  { name: 'Site Web', href: '/website', icon: Globe, visible: true },
  { 
    name: 'Administration', 
    href: '/user-management', 
    icon: Settings, 
    visible: true,
    children: [
      { name: 'Gestion Utilisateurs', href: '/user-management', icon: UserCog, visible: true },
      { name: 'Application', href: '/application', icon: Settings, visible: true },
      { name: 'Préférences', href: '/preferences', icon: Settings, visible: true }
    ]
  }
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [navigation, setNavigation] = useState<MenuItem[]>(defaultNavigation);
  const [openSections, setOpenSections] = useState<string[]>(['Contacts & Relations', 'Événements & Agenda', 'Booking', 'Communication', 'Production & Ventes', 'Administration']);

  
  useEffect(() => {
    const saved = localStorage.getItem('menuConfiguration');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.menuItems) {
          setNavigation(config.menuItems);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de la configuration du menu:', error);
      }
    }
  }, []);

  const toggleSection = (sectionName: string) => {
    setOpenSections(prev => 
      prev.includes(sectionName)
        ? prev.filter(name => name !== sectionName)
        : [...prev, sectionName]
    );
  };

  const isActiveItem = (href: string) => {
    return location.pathname === href;
  };

  const isActiveSection = (item: MenuItem) => {
    if (item.children) {
      return item.children.some(child => isActiveItem(child.href));
    }
    return isActiveItem(item.href);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    if (!item.visible) return null;

    if (item.children && !isChild) {
      const isOpen = openSections.includes(item.name);
      const isActive = isActiveSection(item);

      return (
        <Collapsible key={item.name} open={isOpen} onOpenChange={() => toggleSection(item.name)}>
          <CollapsibleTrigger className={cn(
            'group flex items-center justify-between w-full px-2 py-2 text-sm font-medium rounded-md transition-colors',
            isActive
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          )}>
            <div className="flex items-center">
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-primary-foreground' : 'text-muted-foreground'
                )}
              />
              {item.name}
            </div>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="ml-6 mt-1 space-y-1">
            {item.children.map(child => renderMenuItem(child, true))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
      <Link
        key={item.name}
        to={item.href}
        className={cn(
          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
          isChild ? 'ml-2 pl-6' : '',
          isActiveItem(item.href)
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <item.icon
          className={cn(
            'mr-3 h-4 w-4 flex-shrink-0',
            isActiveItem(item.href) ? 'text-primary-foreground' : 'text-muted-foreground'
          )}
        />
        {item.name}
      </Link>
    );
  };

  return (
    <div className="w-64 bg-background border-r border-border">
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map(item => renderMenuItem(item))}
        </div>
      </nav>
    </div>
  );
};
