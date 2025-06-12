
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';
import { NotificationPopup } from './NotificationPopup';

interface Notification {
  id: string;
  type: 'email' | 'task' | 'event' | 'message' | 'contact';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'task',
    title: 'Nouvelle tâche assignée',
    message: 'Préparer le matériel pour le concert de demain',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'high'
  },
  {
    id: '2',
    type: 'email',
    title: 'Nouveau mail reçu',
    message: 'Confirmation de réservation pour la salle',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'medium'
  },
  {
    id: '3',
    type: 'contact',
    title: 'Nouveau contact',
    message: 'Un nouvel artiste s\'est inscrit',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: 'low'
  },
  {
    id: '4',
    type: 'message',
    title: 'Message interne',
    message: 'L\'équipe technique demande une réunion',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'medium'
  }
];

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center">
            {unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationPopup
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
      />
    </div>
  );
};
