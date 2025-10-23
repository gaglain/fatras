import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

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

export const useEmailNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<EmailNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    loadNotifications();
    const cleanup = setupRealtimeSubscription();
    return () => {
      cleanup?.();
    };
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('email_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      setNotifications(data as EmailNotification[] || []);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    let cleanupTimeout: NodeJS.Timeout | null = null;

    const channel = supabase
      .channel(`email-notifs-${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'email_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as EmailNotification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast notification
          toast.info(newNotification.title, {
            description: newNotification.message
          });
        }
      )
      .subscribe();

    return () => {
      cleanupTimeout = setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.warn('⚠️ Warning during email notifications cleanup:', err);
        }
      }, 100);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, is_read: true } 
          : notification
      ));
    } catch (error) {
      console.error('Erreur lors du marquage comme lu:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('email_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(notification => 
        ({ ...notification, is_read: true })
      ));
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
    }
  };

  const getUnreadCount = () => {
    return notifications.filter(notification => !notification.is_read).length;
  };

  return {
    notifications,
    isLoading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };
};