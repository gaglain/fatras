
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  FileText, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  MessageSquare,
  User,
  Globe,
  Mail,
  Music,
  ShoppingBag,
  BookOpen,
  MapPin,
  Package,
  Smartphone
} from 'lucide-react';
import { TaskNotification } from '@/components/tasks/TaskNotification';

const menuItems = [
  { icon: BarChart3, label: 'Tableau de Bord', path: '/dashboard' },
  { icon: Calendar, label: 'Agenda', path: '/agenda' },
  { icon: Users, label: 'Contacts', path: '/contacts' },
  { icon: Music, label: 'Artistes', path: '/artists' },
  { icon: Calendar, label: 'Événements', path: '/events' },
  { icon: FileText, label: 'Contrats', path: '/contracts' },
  { icon: CheckSquare, label: 'Tâches', path: '/tasks', hasNotification: true },
  { icon: Mail, label: 'Email', path: '/email' },
  { icon: Mail, label: 'Campagnes Email', path: '/email-campaigns' },
  { icon: MessageSquare, label: 'Messagerie', path: '/messagerie' },
  { icon: BookOpen, label: 'Bible du Spectacle', path: '/show-bible' },
  { icon: MapPin, label: 'Feuille de route', path: '/road-show' },
  { icon: ShoppingBag, label: 'Merchandising', path: '/merchandise' },
  { icon: Package, label: 'Opportunités', path: '/opportunities' },
  { icon: Globe, label: 'Site Web', path: '/website' },
  { icon: Smartphone, label: 'Application', path: '/application' },
  { icon: Settings, label: 'Préférences', path: '/preferences' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const pendingTasksCount = 5; // This would come from your task management system

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">ShowManager Pro</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1">{item.label}</span>
                  {item.hasNotification && (
                    <TaskNotification pendingCount={pendingTasksCount} />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
};
