
import React, { useState } from 'react';
import { Bell, Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { NotificationPopup } from './NotificationPopup';

interface HeaderProps {
  logo?: string | null;
  companyName?: string;
  notificationCount?: number;
}

// Sample notifications
const sampleNotifications = [
  {
    id: '1',
    type: 'email' as const,
    title: 'Nouveau contrat reçu',
    message: 'Un nouveau contrat pour le Festival d\'Été a été reçu et nécessite votre attention.',
    timestamp: '2024-06-15T10:30:00Z',
    isRead: false,
    priority: 'high' as const
  },
  {
    id: '2',
    type: 'task' as const,
    title: 'Tâche en retard',
    message: 'La tâche "Préparer le matériel son" était due hier.',
    timestamp: '2024-06-14T16:00:00Z',
    isRead: false,
    priority: 'medium' as const
  },
  {
    id: '3',
    type: 'message' as const,
    title: 'Nouveau message dans #général',
    message: 'Alice Johnson a posté un message dans le canal général.',
    timestamp: '2024-06-15T09:15:00Z',
    isRead: true,
    priority: 'low' as const
  }
];

export const Header: React.FC<HeaderProps> = ({ 
  logo, 
  companyName = 'ShowManager Pro'
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(sampleNotifications);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          {logo && (
            <img src={logo} alt="Logo" className="h-8 w-8 object-contain" />
          )}
          <h1 className="text-xl font-bold text-gray-900">{companyName}</h1>
          
          <div className="relative max-w-md ml-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher contacts, événements, tâches..."
              className="pl-10 w-96"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajout Rapide
          </Button>
          
          <div className="relative">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <>
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                  <div className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse"></div>
                </>
              )}
            </Button>
            
            <NotificationPopup
              isOpen={showNotifications}
              onClose={() => setShowNotifications(false)}
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllAsRead={markAllAsRead}
            />
          </div>
          
          <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors">
            <span className="text-white text-sm font-medium">AJ</span>
          </div>
        </div>
      </div>
    </header>
  );
};
