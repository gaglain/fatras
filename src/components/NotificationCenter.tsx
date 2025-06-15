
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, X, Mail, CheckSquare, Calendar, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Notification {
  id: string;
  type: 'email' | 'task' | 'event' | 'message' | 'contact';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
  linkTo?: string;
}

const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nouveau message',
    message: 'Marie Martin vous a envoyé un message',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'medium',
    linkTo: '/messagerie'
  },
  {
    id: '2',
    type: 'task',
    title: 'Tâche en retard',
    message: 'Finaliser le contrat pour la tournée d\'été',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    priority: 'high',
    linkTo: '/tasks'
  },
  {
    id: '3',
    type: 'event',
    title: 'Événement à venir',
    message: 'Concert prévu demain à 20h',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    priority: 'medium',
    linkTo: '/events'
  }
];

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  console.log('🔔 NotificationCenter component rendered');
  
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const navigate = useNavigate();

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

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.linkTo) {
      navigate(notification.linkTo);
      onClose();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'contact': return <User className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffHours = Math.floor((now.getTime() - notifTime.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'À l\'instant';
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return notifTime.toLocaleDateString('fr-FR');
  };

  return (
    <Card className="w-96 max-w-[90vw] shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <CardHeader className="pb-2 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center text-gray-900 dark:text-white">
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              console.log('🔔 Close button clicked in NotificationCenter');
              onClose();
            }}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="self-end mt-2"
          >
            Tout marquer comme lu
          </Button>
        )}
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto bg-white dark:bg-gray-800 p-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-3" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md bg-white dark:bg-gray-800 ${
                  !notification.isRead 
                    ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                    : 'border-border bg-card hover:bg-accent dark:border-gray-600 dark:hover:bg-gray-700'
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-1 text-muted-foreground">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
