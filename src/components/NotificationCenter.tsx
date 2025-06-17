
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
      case 'high': return { backgroundColor: '#fca5a5', color: '#991b1b' };
      case 'medium': return { backgroundColor: '#fde68a', color: '#92400e' };
      case 'low': return { backgroundColor: '#bbf7d0', color: '#166534' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151' };
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
    <Card 
      className="w-96 max-w-[90vw] shadow-2xl z-[200] border"
      style={{
        backgroundColor: 'var(--custom-notificationBg)',
        borderColor: 'var(--custom-notificationBorder)'
      }}
    >
      <CardHeader 
        className="pb-2 border-b"
        style={{
          borderColor: 'var(--custom-notificationBorder)'
        }}
      >
        <div className="flex items-center justify-between">
          <CardTitle 
            className="text-lg flex items-center"
            style={{ color: 'var(--custom-notificationText)' }}
          >
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <div 
                className="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: 'var(--custom-notificationBadgeBg)',
                  color: 'var(--custom-notificationBadgeText)'
                }}
              >
                {unreadCount}
              </div>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              console.log('🔔 Close button clicked in NotificationCenter');
              onClose();
            }}
            className="h-8 w-8 p-0 hover:opacity-80"
            style={{
              backgroundColor: 'var(--custom-notificationButtonBg)',
              color: 'var(--custom-notificationButtonText)'
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        {notifications.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={markAllAsRead}
            className="self-end mt-2 hover:opacity-80"
            style={{
              backgroundColor: 'var(--custom-notificationButtonBg)',
              color: 'var(--custom-notificationButtonText)',
              borderColor: 'var(--custom-notificationBorder)'
            }}
          >
            Tout marquer comme lu
          </Button>
        )}
      </CardHeader>
      <CardContent 
        className="max-h-96 overflow-y-auto p-4"
        style={{ backgroundColor: 'var(--custom-notificationBg)' }}
      >
        {notifications.length === 0 ? (
          <div 
            className="text-center py-8"
            style={{ color: 'var(--custom-notificationText)' }}
          >
            <Bell className="h-12 w-12 mx-auto mb-3" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md"
                style={{
                  backgroundColor: 'var(--custom-notificationBg)',
                  borderColor: !notification.isRead 
                    ? 'var(--custom-notificationBadgeBg)' 
                    : 'var(--custom-notificationBorder)',
                  borderWidth: !notification.isRead ? '2px' : '1px'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div style={{ color: 'var(--custom-notificationText)' }}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ color: 'var(--custom-notificationText)' }}
                      >
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={getPriorityColor(notification.priority)}
                        >
                          {notification.priority}
                        </div>
                        {!notification.isRead && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: 'var(--custom-notificationRedDot)' }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <p 
                      className="text-sm line-clamp-2"
                      style={{ color: 'var(--custom-notificationText)' }}
                    >
                      {notification.message}
                    </p>
                    <p 
                      className="text-xs mt-1 opacity-70"
                      style={{ color: 'var(--custom-notificationText)' }}
                    >
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
