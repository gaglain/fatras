import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import type { Json } from '@/integrations/supabase/types';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Json;
  read: boolean;
  created_at: string;
}

const NOTIFICATIONS_LIMIT = 100;
const FALLBACK_REFRESH_MS = 15000;

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATIONS_LIMIT);

      if (error) {
        logger.error('Erreur lors de la récupération des notifications:', error);
        return;
      }

      setNotifications(data || []);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    void fetchNotifications();

    const channel = supabase
      .channel(`notifs-changes-${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === payload.new.id);
            if (exists) return prev;
            return [payload.new as Notification, ...prev].slice(0, NOTIFICATIONS_LIMIT);
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((notif) => (notif.id === payload.new.id ? (payload.new as Notification) : notif))
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void fetchNotifications();
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          void fetchNotifications();
        }
      });

    const intervalId = window.setInterval(() => {
      void fetchNotifications();
    }, FALLBACK_REFRESH_MS);

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        void fetchNotifications();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', userId);

      if (!error) {
        setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)));
      }
    } catch (error: unknown) {
      logger.error('Erreur lors de la mise à jour de la notification:', error);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (!error) {
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
      }
    } catch (error: unknown) {
      logger.error('Erreur lors de la mise à jour des notifications:', error);
    }
  }, [userId]);

  const createNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([
          {
            user_id: notificationData.user_id,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            read: notificationData.read,
            data: notificationData.data ?? null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      logger.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification,
  };
};