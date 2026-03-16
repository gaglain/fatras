import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export interface EmailNotification {
  id: string;
  user_id: string;
  email_id?: string;
  type: 'new_email' | 'email_sent' | 'email_failed';
  title: string;
  message?: string;
  is_read: boolean;
  created_at: string;
}

const EMAIL_NOTIFICATIONS_LIMIT = 50;
const FALLBACK_REFRESH_MS = 15000;

export const useEmailNotifications = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(EMAIL_NOTIFICATIONS_LIMIT);

      if (error) throw error;

      setNotifications((data as EmailNotification[]) || []);
    } catch (error) {
      logger.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const setupRealtimeSubscription = useCallback(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`email-notifs-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotification = payload.new as EmailNotification;

          setNotifications((prev) => {
            const exists = prev.some((notification) => notification.id === newNotification.id);
            if (exists) return prev;
            return [newNotification, ...prev].slice(0, EMAIL_NOTIFICATIONS_LIMIT);
          });

          toast.info(newNotification.title, {
            description: newNotification.message,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'email_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedNotification = payload.new as EmailNotification;
          setNotifications((prev) =>
            prev.map((notification) =>
              notification.id === updatedNotification.id ? updatedNotification : notification
            )
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void loadNotifications();
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          void loadNotifications();
        }
      });

    return () => {
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          logger.warn('⚠️ Warning during email notifications cleanup:', err);
        }
      }, 100);
    };
  }, [loadNotifications, userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    void loadNotifications();
    const cleanup = setupRealtimeSubscription();

    const intervalId = window.setInterval(() => {
      void loadNotifications();
    }, FALLBACK_REFRESH_MS);

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        void loadNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      cleanup?.();
    };
  }, [loadNotifications, setupRealtimeSubscription, userId]);

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      );
    } catch (error) {
      logger.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })));
    } catch (error) {
      logger.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter((notification) => !notification.is_read).length;
  };

  return {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
  };
};
