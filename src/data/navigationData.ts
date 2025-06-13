
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
  Briefcase,
  CalendarCheck
} from 'lucide-react';

export interface MenuItem {
  name: string;
  href: string;
  icon: any;
  visible?: boolean;
  children?: MenuItem[];
}

export const navigationData: MenuItem[] = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard, 
    visible: true 
  },
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
  { 
    name: 'Artistes', 
    href: '/artists', 
    icon: Palette, 
    visible: true 
  },
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
      { name: 'Formulaires', href: '/forms', icon: FileText, visible: true },
      { name: 'Calendrier de publication', href: '/publication-calendar', icon: CalendarCheck, visible: true }
    ]
  },
  { 
    name: 'Ressources', 
    href: '/show-bible', 
    icon: FileStack, 
    visible: true 
  },
  { 
    name: 'Production & Ventes', 
    href: '/road-show', 
    icon: Route, 
    visible: true,
    children: [
      { name: 'Feuille de route', href: '/road-show', icon: Route, visible: true },
      { name: 'Boutique', href: '/merchandise', icon: ShoppingBag, visible: true }
    ]
  },
  { 
    name: 'Site Web', 
    href: '/website', 
    icon: Globe, 
    visible: true 
  },
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

export const defaultOpenSections = [
  'Contacts & Relations', 
  'Événements & Agenda', 
  'Booking', 
  'Communication', 
  'Production & Ventes', 
  'Administration'
];
