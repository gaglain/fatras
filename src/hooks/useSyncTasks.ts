import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface SyncTask {
  id: string;
  user_id: string;
  sync_type: 'email' | 'calendar';
  is_enabled: boolean;
  sync_interval_minutes: number;
  last_sync_at: string | null;
  next_sync_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SyncNotification {
  id: string;
  user_id: string;
  sync_type: 'email' | 'calendar';
  notification_type: 'success' | 'error' | 'warning';
  title: string;
  message: string;
  details: unknown;
  is_read: boolean;
  created_at: string;
}

export const useSyncTasks = () => {
  const { user } = useAuthContext();
  const [tasks, setTasks] = useState<SyncTask[]>([]);
  const [notifications, setNotifications] = useState<SyncNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sync_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        logger.error('Error loading sync tasks:', error);
        toast.error('Erreur lors du chargement des tâches de synchronisation');
        return;
      }

      setTasks((data || []) as SyncTask[]);
    } catch (error: unknown) {
      logger.error('Error loading sync tasks:', error);
      toast.error('Erreur lors du chargement des tâches de synchronisation');
    }
  };

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('sync_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        logger.error('Error loading sync notifications:', error);
        return;
      }

      setNotifications((data || []) as SyncNotification[]);
    } catch (error: unknown) {
      logger.error('Error loading sync notifications:', error);
    }
  };

  const createOrUpdateTask = async (syncType: 'email' | 'calendar', isEnabled: boolean, intervalMinutes: number = 15) => {
    if (!user) return;

    try {
      // Check if task already exists
      const { data: existingTask } = await supabase
        .from('sync_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('sync_type', syncType)
        .single();

      const nextSyncTime = new Date();
      nextSyncTime.setMinutes(nextSyncTime.getMinutes() + intervalMinutes);

      if (existingTask) {
        // Update existing task
        const { error } = await supabase
          .from('sync_tasks')
          .update({
            is_enabled: isEnabled,
            sync_interval_minutes: intervalMinutes,
            next_sync_at: isEnabled ? nextSyncTime.toISOString() : null
          })
          .eq('id', existingTask.id);

        if (error) {
          logger.error('Error updating sync task:', error);
          toast.error('Erreur lors de la mise à jour de la tâche');
          return;
        }
      } else {
        // Create new task
        const { error } = await supabase
          .from('sync_tasks')
          .insert({
            user_id: user.id,
            sync_type: syncType,
            is_enabled: isEnabled,
            sync_interval_minutes: intervalMinutes,
            next_sync_at: isEnabled ? nextSyncTime.toISOString() : null
          });

        if (error) {
          logger.error('Error creating sync task:', error);
          toast.error('Erreur lors de la création de la tâche');
          return;
        }
      }

      await loadTasks();
      toast.success(`Synchronisation ${syncType} ${isEnabled ? 'activée' : 'désactivée'}`);
    } catch (error: unknown) {
      logger.error('Error creating/updating sync task:', error);
      toast.error('Erreur lors de la configuration de la synchronisation');
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('sync_notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        logger.error('Error marking notification as read:', error);
        return;
      }

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error: unknown) {
      logger.error('Error marking notification as read:', error);
    }
  };

  const getUnreadNotificationsCount = () => {
    return notifications.filter(notif => !notif.is_read).length;
  };

  useEffect(() => {
    if (user) {
      setLoading(true);
      Promise.all([loadTasks(), loadNotifications()]).finally(() => {
        setLoading(false);
      });
    }
  }, [user]);

  // Subscribe to real-time updates for notifications
  useEffect(() => {
    if (!user) return;

    const channelName = `sync-notifications-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'sync_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          logger.debug('New sync notification:', payload);
          setNotifications(prev => [payload.new as SyncNotification, ...prev]);
          
          // Show toast notification
          const notification = payload.new as SyncNotification;
          if (notification.notification_type === 'success') {
            toast.success(notification.title, {
              description: notification.message
            });
          } else if (notification.notification_type === 'error') {
            toast.error(notification.title, {
              description: notification.message
            });
          } else {
            toast.info(notification.title, {
              description: notification.message
            });
          }
        }
      )
      .subscribe();

    return () => {
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          logger.warn('Warning during sync tasks cleanup:', err);
        }
      }, 100);
    };
  }, [user]);

  return {
    tasks,
    notifications,
    loading,
    createOrUpdateTask,
    markNotificationAsRead,
    getUnreadNotificationsCount,
    refreshTasks: loadTasks,
    refreshNotifications: loadNotifications
  };
};
