import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BellOff, Check, Mail, Clock, CheckSquare, Calendar, User, MessageSquare, AlertTriangle } from 'lucide-react';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { useNavigate } from 'react-router-dom';

interface UnifiedNotification {
  id: string;
  type: 'email' | 'task' | 'event' | 'contact' | 'message' | 'general' | 'roadshow_assignment';
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  source: 'email' | 'general' | 'task';
  priority?: 'high' | 'medium' | 'low';
  data?: Record<string, any>;
}

export const NotificationList: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    notifications: emailNotifications, 
    isLoading: emailLoading, 
    markAsRead: markEmailAsRead, 
    markAllAsRead: markAllEmailsAsRead, 
    getUnreadCount: getEmailUnreadCount 
  } = useEmailNotifications();
  
  const { 
    notifications: generalNotifications, 
    unreadCount: generalUnreadCount, 
    markAsRead: markGeneralAsRead, 
    markAllAsRead: markAllGeneralAsRead 
  } = useNotifications();
  
  const { 
    notifications: taskNotifications 
  } = useTaskNotifications();

  // Unifier toutes les notifications
  const allNotifications = useMemo<UnifiedNotification[]>(() => {
    const unified: UnifiedNotification[] = [];

    // Ajouter les notifications d'emails
    emailNotifications.forEach(notif => {
      unified.push({
        id: `email-${notif.id}`,
        type: 'email',
        title: notif.title,
        message: notif.message,
        is_read: notif.is_read,
        created_at: notif.created_at,
        source: 'email',
        priority: 'medium'
      });
    });

    // Ajouter les notifications générales
    generalNotifications.forEach(notif => {
      unified.push({
        id: `general-${notif.id}`,
        type: (notif.type as any) || 'general',
        title: notif.title,
        message: notif.message,
        is_read: notif.read,
        created_at: notif.created_at,
        source: 'general',
        priority: 'medium',
        data: (notif.data as Record<string, any>) || undefined,
      });
    });

    // Ajouter les notifications de tâches
    taskNotifications.forEach(notif => {
      unified.push({
        id: `task-${notif.task_id}`,
        type: 'task',
        title: notif.task_title,
        message: notif.message,
        is_read: false,
        created_at: notif.created_at,
        source: 'task',
        priority: notif.type === 'overdue' ? 'high' : 'medium'
      });
    });

    // Trier par date décroissante
    return unified.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [emailNotifications, generalNotifications, taskNotifications]);

  const totalUnreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.is_read).length;
  }, [allNotifications]);

  const handleMarkAsRead = async (notification: UnifiedNotification) => {
    if (notification.source === 'email' && notification.id.startsWith('email-')) {
      await markEmailAsRead(notification.id.slice('email-'.length));
      return;
    }

    if (notification.source === 'general' && notification.id.startsWith('general-')) {
      await markGeneralAsRead(notification.id.slice('general-'.length));
    }
  };

  const handleMarkAllAsRead = async () => {
    await Promise.all([
      markAllEmailsAsRead(),
      markAllGeneralAsRead()
    ]);
  };

  const handleNotificationClick = async (notification: UnifiedNotification) => {
    await handleMarkAsRead(notification);
    
    // Navigation basée sur le type
    switch (notification.type) {
      case 'email':
        navigate('/email');
        break;
      case 'task':
        navigate('/tasks');
        break;
      case 'event':
        navigate('/events');
        break;
      case 'contact':
        navigate('/contacts');
        break;
      case 'message': {
        const channelId = notification.data?.channel_id;
        const channelName = notification.data?.channel_name;
        const messageId = notification.data?.message_id;
        const query = new URLSearchParams({ openChat: '1' });
        if (channelId) query.set('channelId', String(channelId));
        if (channelName) query.set('channelName', String(channelName));
        if (messageId) query.set('messageId', String(messageId));
        navigate(`/dashboard?${query.toString()}`);
        break;
      }
      case 'roadshow_assignment': {
        const stopId = notification.data?.roadshow_stop_id;
        if (stopId) {
          navigate(`/roadshow?stop=${stopId}`);
        } else {
          navigate('/roadshow');
        }
        break;
      }
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "À l'instant";
    if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
    if (diffHours < 24) return `il y a ${diffHours}h`;
    if (diffDays < 7) return `il y a ${diffDays}j`;
    return date.toLocaleDateString('fr-FR');
  };

  const getNotificationIcon = (type: string, priority?: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4 text-blue-500" />;
      case 'task':
        return priority === 'high' 
          ? <AlertTriangle className="h-4 w-4 text-destructive" />
          : <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'event':
        return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'contact':
        return <User className="h-4 w-4 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-cyan-500" />;
      default:
        return <Mail className="h-4 w-4" />;
    }
  };

  const filterNotificationsByType = (type: string) => {
    if (type === 'all') return allNotifications;
    return allNotifications.filter(n => n.type === type);
  };

  const renderNotificationList = (notifications: UnifiedNotification[]) => {
    if (notifications.length === 0) {
      return (
        <div className="text-center text-muted-foreground py-8">
          <BellOff className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Aucune notification</p>
        </div>
      );
    }

    return (
      <div className="overflow-y-auto">
        <div className="space-y-2 pb-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                !notification.is_read 
                  ? 'bg-primary/5 border-primary/30' 
                  : 'border-border'
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getNotificationIcon(notification.type, notification.priority)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className={`text-sm truncate ${
                      !notification.is_read ? 'font-semibold' : 'font-medium'
                    }`}>
                      {notification.title}
                    </h5>
                    {!notification.is_read && (
                      <div className="h-2 w-2 bg-primary rounded-full flex-shrink-0" />
                    )}
                  </div>
                  {notification.message && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(notification.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-lg">Notifications</h4>
        {totalUnreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-xs h-8"
          >
            <Check className="h-3 w-3 mr-1" />
            Tout marquer comme lu
          </Button>
        )}
      </div>
      
      <Separator />
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs">
            Tout
            {totalUnreadCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                {totalUnreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="email" className="text-xs">
            <Mail className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="task" className="text-xs">
            <CheckSquare className="h-3 w-3" />
          </TabsTrigger>
          <TabsTrigger value="event" className="text-xs">
            <Calendar className="h-3 w-3" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          {renderNotificationList(allNotifications)}
        </TabsContent>
        
        <TabsContent value="email" className="mt-4">
          {renderNotificationList(filterNotificationsByType('email'))}
        </TabsContent>
        
        <TabsContent value="task" className="mt-4">
          {renderNotificationList(filterNotificationsByType('task'))}
        </TabsContent>
        
        <TabsContent value="event" className="mt-4">
          {renderNotificationList(filterNotificationsByType('event'))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export { type UnifiedNotification };
