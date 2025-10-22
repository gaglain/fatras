import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
}

const NOTIFICATIONS_LIMIT = 100; // Limiter à 100 notifications max

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(NOTIFICATIONS_LIMIT); // Limiter le nombre

      if (data && !error) {
        setNotifications(data);
      } else if (error) {
        console.error('❌ Erreur lors de la récupération des notifications:', error);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Écouter les nouvelles notifications en temps réel
    const channel = supabase
      .channel(`notifs-changes-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => {
            // Éviter les doublons et limiter à NOTIFICATIONS_LIMIT
            const exists = prev.some(n => n.id === payload.new.id);
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
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          setNotifications(prev => 
            prev.map(notif => 
              notif.id === payload.new.id ? payload.new as Notification : notif
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user?.id);

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  }, [user]);

  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);

      if (!error) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, read: true }))
        );
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  }, [user]);

  const createNotification = useCallback(async (notificationData: Omit<Notification, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          user_id: notificationData.user_id,
          type: notificationData.type,
          title: notificationData.title,
          message: notificationData.message,
          read: notificationData.read,
          data: notificationData.data
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    createNotification
  };
};