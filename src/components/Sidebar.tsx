
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Calendar,
  FileText,
  Mail,
  CheckSquare,
  Music,
  MapPin,
  BookOpen,
  ShoppingBag,
  Settings
} from 'lucide-react';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', href: '/' },
  { icon: Users, label: 'Contacts', href: '/contacts' },
  { icon: Calendar, label: 'Événements', href: '/events' },
  { icon: Music, label: 'Artistes', href: '/artists' },
  { icon: FileText, label: 'Contrats', href: '/contracts' },
  { icon: Mail, label: 'Email', href: '/email' },
  { icon: CheckSquare, label: 'Tâches', href: '/tasks' },
  { icon: BookOpen, label: 'Bible du Spectacle', href: '/show-bible' },
  { icon: MapPin, label: 'Tournée', href: '/roadshow' },
  { icon: ShoppingBag, label: 'Marchandisage', href: '/merchandise' },
  { icon: Settings, label: 'Préférences', href: '/preferences' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">ShowManager Pro</h1>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
