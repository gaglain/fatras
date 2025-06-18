
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Mail, CheckSquare, Calendar, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';

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
  const [customColors, setCustomColors] = useState<any>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();

  // Charger les couleurs personnalisées depuis localStorage
  useEffect(() => {
    const loadCustomColors = () => {
      const saved = localStorage.getItem('customColors');
      if (saved) {
        try {
          const colors = JSON.parse(saved);
          setCustomColors(colors);
          console.log('🎨 Custom colors loaded for NotificationCenter:', colors);
        } catch (error) {
          console.error('❌ Error loading custom colors:', error);
        }
      }
    };

    loadCustomColors();

    // Écouter les changements de couleurs
    const handleColorsChanged = () => {
      loadCustomColors();
    };

    window.addEventListener('colorsChanged', handleColorsChanged);
    return () => window.removeEventListener('colorsChanged', handleColorsChanged);
  }, []);

  // Calculer les couleurs à utiliser
  const getColors = () => {
    const isDark = theme === 'dark';
    
    if (customColors) {
      return {
        background: isDark ? (customColors.backgroundDark || '#18181b') : (customColors.background || '#ffffff'),
        text: isDark ? (customColors.textDark || '#ffffff') : (customColors.text || '#18181b'),
        border: customColors.notificationBorder || (isDark ? '#374151' : '#e5e7eb'),
        badgeBg: customColors.notificationBadgeBg || '#ef4444',
        badgeText: customColors.notificationBadgeText || '#ffffff',
        buttonBg: customColors.notificationButtonBg || (isDark ? '#374151' : '#f3f4f6'),
        buttonText: customColors.notificationButtonText || (isDark ? '#ffffff' : '#374151'),
        redDot: customColors.notificationRedDot || '#ef4444'
      };
    }

    // Couleurs par défaut
    return {
      background: isDark ? '#18181b' : '#ffffff',
      text: isDark ? '#ffffff' : '#18181b',
      border: isDark ? '#374151' : '#e5e7eb',
      badgeBg: '#ef4444',
      badgeText: '#ffffff',
      buttonBg: isDark ? '#374151' : '#f3f4f6',
      buttonText: isDark ? '#ffffff' : '#374151',
      redDot: '#ef4444'
    };
  };

  const colors = getColors();
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
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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

  console.log('🎨 NotificationCenter using colors:', colors);

  return (
    <div 
      className="w-96 max-w-[90vw] shadow-2xl z-[200] border rounded-lg transition-all duration-300"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.border,
        color: colors.text
      }}
    >
      {/* Header */}
      <div 
        className="pb-2 border-b p-4"
        style={{
          borderColor: colors.border,
          backgroundColor: colors.background
        }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="text-lg flex items-center font-semibold"
            style={{ color: colors.text }}
          >
            <Bell 
              className="h-5 w-5 mr-2" 
              style={{ color: colors.text }} 
            />
            Notifications
            {unreadCount > 0 && (
              <div 
                className="ml-2 px-2 py-1 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: colors.badgeBg,
                  color: colors.badgeText
                }}
              >
                {unreadCount}
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              console.log('🔔 Close button clicked in NotificationCenter');
              onClose();
            }}
            className="h-8 w-8 p-0 hover:opacity-80 rounded flex items-center justify-center transition-all duration-300"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.buttonText
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            className="self-end mt-2 hover:opacity-80 px-3 py-1 text-sm rounded border transition-all duration-300"
            style={{
              backgroundColor: colors.buttonBg,
              color: colors.buttonText,
              borderColor: colors.border
            }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      
      {/* Corps */}
      <div 
        className="max-h-96 overflow-y-auto p-4"
        style={{ backgroundColor: colors.background }}
      >
        {notifications.length === 0 ? (
          <div 
            className="text-center py-8"
            style={{ color: colors.text }}
          >
            <Bell 
              className="h-12 w-12 mx-auto mb-3" 
              style={{ color: colors.text }} 
            />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md"
                style={{
                  backgroundColor: colors.background,
                  borderColor: !notification.isRead 
                    ? colors.badgeBg 
                    : colors.border,
                  borderWidth: !notification.isRead ? '2px' : '1px'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div style={{ color: colors.text }}>
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p 
                        className="text-sm font-medium truncate"
                        style={{ color: colors.text }}
                      >
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div 
                          className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(notification.priority)}`}
                        >
                          {notification.priority}
                        </div>
                        {!notification.isRead && (
                          <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: colors.redDot }}
                          ></div>
                        )}
                      </div>
                    </div>
                    <p 
                      className="text-sm line-clamp-2"
                      style={{ color: colors.text }}
                    >
                      {notification.message}
                    </p>
                    <p 
                      className="text-xs mt-1 opacity-70"
                      style={{ color: colors.text }}
                    >
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
