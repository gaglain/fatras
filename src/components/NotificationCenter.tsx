
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, X, Mail, CheckSquare, Calendar, User, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useNotifications } from '@/hooks/useNotifications';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  console.log('🔔 NotificationCenter component rendered');
  
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleNotificationClick = (notification: any) => {
    markAsRead(notification.id);
    // Navigation basée sur le type de notification
    switch (notification.type) {
      case 'task_reminder':
        navigate('/tasks');
        break;
      case 'publication_reminder':
        navigate('/publication-calendar');
        break;
      case 'email':
        navigate('/email');
        break;
      case 'public_chat':
        navigate('/messagerie');
        break;
      default:
        break;
    }
    onClose();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'contact': return <User className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      case 'public_chat': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (type: string) => {
    switch (type) {
      case 'task_reminder': return 'bg-red-100 text-red-800';
      case 'publication_reminder': return 'bg-blue-100 text-blue-800';
      case 'email': return 'bg-green-100 text-green-800';
      case 'public_chat': return 'bg-purple-100 text-purple-800';
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

  return (
    <div 
      className="w-96 max-w-[90vw] shadow-2xl z-[200] border rounded-lg transition-all duration-300 bg-white dark:bg-gray-900"
      style={{
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
        color: theme === 'dark' ? '#ffffff' : '#18181b'
      }}
    >
      {/* Header */}
      <div 
        className="pb-2 border-b p-4 bg-white dark:bg-gray-900"
        style={{
          borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff'
        }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="text-lg flex items-center font-semibold text-gray-900 dark:text-white"
          >
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <div className="ml-2 px-2 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                {unreadCount}
              </div>
            )}
          </div>
          <button 
            onClick={() => {
              console.log('🔔 Close button clicked in NotificationCenter');
              onClose();
            }}
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center transition-all duration-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={markAllAsRead}
            className="self-end mt-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-1 text-sm rounded border transition-all duration-300"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>
      
      {/* Corps */}
      <div 
        className="max-h-96 overflow-y-auto p-4 bg-white dark:bg-gray-900"
        style={{ 
          backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff' 
        }}
      >
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-3 border rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md bg-white dark:bg-gray-800"
                style={{
                  backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                  borderColor: !notification.read 
                    ? '#3b82f6' 
                    : (theme === 'dark' ? '#374151' : '#e5e7eb'),
                  borderWidth: !notification.read ? '2px' : '1px'
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-gray-600 dark:text-gray-300">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate text-gray-900 dark:text-white">
                        {notification.title}
                      </p>
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded text-xs font-semibold ${getPriorityColor(notification.type)}`}>
                          {notification.type}
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm line-clamp-2 text-gray-600 dark:text-gray-300">
                      {notification.message}
                    </p>
                    <p className="text-xs mt-1 opacity-70 text-gray-500 dark:text-gray-400">
                      {formatTime(notification.created_at)}
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
