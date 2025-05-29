
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  Music, 
  Mail, 
  FileText, 
  Package, 
  BookOpen,
  Home,
  Route
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Contacts', href: '/contacts', icon: Users },
  { name: 'Events', href: '/events', icon: Calendar },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Artists', href: '/artists', icon: Music },
  { name: 'Email', href: '/email', icon: Mail },
  { name: 'Contracts', href: '/contracts', icon: FileText },
  { name: 'Merchandise', href: '/merchandise', icon: Package },
  { name: 'Road Show', href: '/road-show', icon: Route },
  { name: 'Show Bible', href: '/show-bible', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-purple-600">ArtistCRM</h1>
        <p className="text-sm text-gray-500 mt-1">Booker Management</p>
      </div>
      
      <nav className="mt-6">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-6 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-purple-50 text-purple-700 border-r-2 border-purple-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
