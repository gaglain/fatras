import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

const FALLBACK_REFRESH_MS = 15000;

export const useMessagingUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const userId = user?.id;

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('type', 'message')
        .eq('read', false);

      if (error) throw error;
      setUnreadCount(count || 0);
    } catch (error: unknown) {
      logger.error('Error fetching messaging unread count:', error);
      setUnreadCount(0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0);
      return;
    }

    void fetchUnreadCount();

    const channelName = `messaging-unread-${userId}-${Date.now()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void fetchUnreadCount();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          void fetchUnreadCount();
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          void fetchUnreadCount();
        }
      });

    const intervalId = window.setInterval(() => {
      void fetchUnreadCount();
    }, FALLBACK_REFRESH_MS);

    const handleVisibilityOrFocus = () => {
      if (!document.hidden) {
        void fetchUnreadCount();
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
  }, [userId, fetchUnreadCount]);

  return unreadCount;
};
