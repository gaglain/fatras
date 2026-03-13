import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, BellOff, Check, Mail, Clock, CheckSquare, Calendar, User, MessageSquare, AlertTriangle } from 'lucide-react';
import { useEmailNotifications } from '@/hooks/useEmailNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { useIsMobile } from '@/hooks/use-mobile';


interface UnifiedNotification {
  id: string;
  type: 'email' | 'task' | 'event' | 'contact' | 'message' | 'general' | 'public_chat' | 'roadshow_assignment';
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
  source: 'email' | 'general' | 'task';
  priority?: 'high' | 'medium' | 'low';
  data?: any;
}

export const UnifiedNotificationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
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
  
  // useTaskNotifications pour la vérification en arrière-plan
  useTaskNotifications();

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

    // Ajouter les notifications générales et de tâches
    generalNotifications.forEach(notif => {
      // Déterminer si c'est une notification de tâche
      const isTaskNotif = notif.type === 'task_overdue' || notif.type === 'task_due_soon';
      
      if (isTaskNotif && (notif.data as { task_id?: string })?.task_id) {
        // Notification de tâche avec task_id
        unified.push({
          id: `task-${notif.id}-${(notif.data as { task_id: string }).task_id}`, // Inclure l'ID de la notification ET du task
          type: 'task',
          title: notif.title,
          message: notif.message,
          is_read: notif.read,
          created_at: notif.created_at,
          source: 'general',
          priority: notif.type === 'task_overdue' ? 'high' : 'medium',
          data: {
            ...(notif.data as Record<string, unknown>),
            notification_id: notif.id,
          },
        });
      } else {
        // Notification générale normale (incluant public_chat)
        unified.push({
          id: `general-${notif.id}`,
          type: (notif.type as any) || 'general',
          title: notif.title,
          message: notif.message,
          is_read: notif.read,
          created_at: notif.created_at,
          source: 'general',
          priority: 'medium',
          data: notif.data
        });
      }
    });

    // Trier par date décroissante
    return unified.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [emailNotifications, generalNotifications]);

  const totalUnreadCount = useMemo(() => {
    return allNotifications.filter(n => !n.is_read).length;
  }, [allNotifications]);

  const handleMarkAsRead = async (notification: UnifiedNotification) => {
    if (notification.source === 'email' && notification.id.startsWith('email-')) {
      await markEmailAsRead(notification.id.slice('email-'.length));
      return;
    }

    if (notification.source === 'general') {
      const generalNotificationId =
        (notification.data as { notification_id?: string } | undefined)?.notification_id ??
        (notification.id.startsWith('general-') ? notification.id.slice('general-'.length) : null);

      if (generalNotificationId) {
        await markGeneralAsRead(generalNotificationId);
      }
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
    setIsOpen(false); // Fermer le popover

    // Navigation basée sur le type avec un petit délai pour laisser le popover se fermer
    setTimeout(() => {
      switch (notification.type) {
        case 'email':
          navigate('/email');
          break;
        case 'task': {
          const taskIdFromData = (notification.data as { task_id?: string } | undefined)?.task_id;
          const fallbackTaskId = notification.id.split('-').at(-1);
          const taskId = taskIdFromData || fallbackTaskId;
          navigate(taskId ? `/tasks?taskId=${taskId}` : '/tasks');
          break;
        }
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
        case 'public_chat': {
          const visitorId = notification.data?.visitor_id;
          navigate('/messagerie', { state: { tab: 'public', visitorId } });
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
    }, 100);
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
    const className = priority === 'high' ? 'h-4 w-4 text-destructive' : 'h-4 w-4';
    
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
      case 'public_chat':
        return <MessageSquare className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className={className} />;
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
      <div className="max-h-[60vh] overflow-y-auto">
        <div className="space-y-2 pb-2">
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

  const NotificationTriggerButton = (
    <Button variant="ghost" size="icon" className="relative">
      {totalUnreadCount > 0 ? (
        <Bell className="h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
      {totalUnreadCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {totalUnreadCount > 99 ? '99+' : totalUnreadCount}
        </Badge>
      )}
    </Button>
  );

  const NotificationContent = (
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

  // Mobile: Use Sheet (bottom drawer) for better UX
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {NotificationTriggerButton}
        </SheetTrigger>
        <SheetContent 
          side="bottom" 
          className="max-h-[85vh] h-auto rounded-t-xl flex flex-col"
        >
          <SheetHeader className="flex-shrink-0 pb-2">
            <SheetTitle className="sr-only">Notifications</SheetTitle>
            {/* Drag indicator */}
            <div className="mx-auto w-12 h-1.5 rounded-full bg-muted mb-2" />
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-1 pb-4 min-h-0">
            {NotificationContent}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Use Popover
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {NotificationTriggerButton}
      </PopoverTrigger>
      <PopoverContent className="w-[90vw] max-w-96" align="end">
        {NotificationContent}
      </PopoverContent>
    </Popover>
  );
};
