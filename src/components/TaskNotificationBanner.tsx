import React, { useEffect, useState } from 'react';
import { Bell, Clock, AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useTaskNotifications } from '@/hooks/useTaskNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TaskNotificationBannerProps {
  className?: string;
}

export const TaskNotificationBanner: React.FC<TaskNotificationBannerProps> = ({ className }) => {
  const { user } = useAuth();
  // Background scheduler (singleton) to generate task notifications.
  useTaskNotifications();
  const [urgentNotifications, setUrgentNotifications] = useState<any[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;

    // Charger les notifications urgentes
    loadUrgentNotifications();

    // Rafraîchir l'affichage des notifications urgentes toutes les 2 minutes
    const interval = setInterval(() => {
      loadUrgentNotifications();
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user, dismissedNotifications]);

  const loadUrgentNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['task_overdue', 'task_due_soon'])
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        // Ne pas loguer les erreurs réseau temporaires pour éviter le spam console
        if (!error.message?.includes('fetch') && !error.message?.includes('network')) {
          console.error('Erreur notifications:', error.message);
        }
        return;
      }

      // Filtrer les notifications non masquées
      const visibleNotifications = (data || []).filter(
        notification => !dismissedNotifications.has(notification.id)
      );

      setUrgentNotifications(visibleNotifications);
    } catch (error: any) {
      // Ignorer silencieusement les erreurs réseau temporaires
      if (error?.message?.includes('fetch') || error?.message?.includes('network') || error?.name === 'TypeError') {
        return;
      }
      console.error('Erreur notifications:', error);
    }
  };

  const dismissNotification = async (notificationId: string) => {
    // Ajouter à la liste des masquées
    setDismissedNotifications(prev => new Set([...prev, notificationId]));
    
    // Marquer comme lue dans la base de données
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
    }
    
    // Recharger les notifications
    loadUrgentNotifications();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_overdue':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'task_due_soon':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case 'task_overdue':
        return 'destructive';
      case 'task_due_soon':
        return 'default';
      default:
        return 'default';
    }
  };

  if (urgentNotifications.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      {urgentNotifications.map((notification) => (
        <Alert 
          key={notification.id} 
          variant={getNotificationVariant(notification.type)}
          className="relative pr-12"
        >
          {getNotificationIcon(notification.type)}
          <AlertDescription className="pr-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium">{notification.title}</div>
                <div className="text-sm opacity-90">{notification.message}</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-6 w-6 p-0"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};