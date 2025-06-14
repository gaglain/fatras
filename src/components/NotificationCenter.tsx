
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

// Aucune notification par défaut
const sampleNotifications: Notification[] = [];

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
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
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
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
    <Card className="w-96 shadow-lg" style={{
      background: 'var(--custom-cardBg, #ffffff)',
      color: 'var(--custom-cardText, #18181b)',
      border: '1px solid rgba(0,0,0,0.1)',
      borderRadius: '0'
    }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            <Bell className="h-5 w-5 mr-2" style={{
              color: 'var(--custom-text, #666666)'
            }} />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2" style={{
                background: '#ef4444',
                color: '#ffffff',
                borderRadius: '0'
              }}>
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            style={{
              background: 'transparent',
              color: 'var(--custom-text, #666666)',
              border: 'none',
              borderRadius: '0'
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
            className="self-end"
            style={{
              background: 'transparent',
              color: 'var(--custom-buttonBg, #1632f4)',
              border: '1px solid var(--custom-buttonBg, #1632f4)',
              borderRadius: '0'
            }}
          >
            Tout marquer comme lu
          </Button>
        )}
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="text-center py-8" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            <Bell className="h-12 w-12 mx-auto mb-3" style={{
              color: 'var(--custom-text, #666666)',
              opacity: 0.5
            }} />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 border transition-colors cursor-pointer hover:bg-accent ${
                  !notification.isRead ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/20' : 'border-border'
                }`}
                style={{
                  background: !notification.isRead 
                    ? 'rgba(var(--custom-buttonBg, 22, 50, 244), 0.05)' 
                    : 'var(--custom-cardBg, #ffffff)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '0'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div style={{ color: 'var(--custom-text, #666666)' }} className="mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate" style={{
                        color: 'var(--custom-cardText, #18181b)'
                      }}>
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(notification.priority)} style={{
                          borderRadius: '0'
                        }}>
                          {notification.priority}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 rounded-full" style={{
                            background: 'var(--custom-buttonBg, #1632f4)',
                            borderRadius: '50%'
                          }}></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
                      {notification.message}
                    </p>
                    <p className="text-xs mt-1" style={{
                      color: 'var(--custom-text, #666666)'
                    }}>
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
