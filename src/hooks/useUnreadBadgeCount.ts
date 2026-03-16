import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';

const POLL_INTERVAL_MS = 10_000; // 10s – lightweight COUNT queries

/**
 * Lightweight hook that queries *only* unread counts from the DB.
 * Unlike the full notification hooks this never transfers rows – just 3
 * tiny SELECT COUNT(*) queries.  It is used exclusively for the PWA
 * system badge (icon dot) so it stays accurate even when the Realtime
 * WebSocket drops silently (common on mobile PWA / iOS).
 */
export const useUnreadBadgeCount = () => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const [count, setCount] = useState(0);
  const mountedRef = useRef(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }

    try {
      // Fire all 3 counts in parallel – each is a HEAD request (no rows)
      const [generalRes, emailRes, messagingRes] = await Promise.all([
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false),
        supabase
          .from('email_notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false),
        supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('type', 'message')
          .eq('read', false),
      ]);

      if (!mountedRef.current) return;

      // messaging notifications are a subset of general – don't double count
      const general = Math.max(0, generalRes.count ?? 0);
      const email = Math.max(0, emailRes.count ?? 0);
      // messaging is already included in `general`, so total = general + email
      setCount(general + email);
    } catch (err) {
      logger.debug('useUnreadBadgeCount - query failed', err);
    }
  }, [userId]);

  useEffect(() => {
    mountedRef.current = true;

    if (!userId) {
      setCount(0);
      return;
    }

    // Initial fetch
    void refresh();

    // Polling fallback
    const intervalId = window.setInterval(() => void refresh(), POLL_INTERVAL_MS);

    // Realtime – listen for any change on notifications + email_notifications
    const channel = supabase
      .channel(`badge-count-${userId}-${Date.now()}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => void refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'email_notifications', filter: `user_id=eq.${userId}` },
        () => void refresh(),
      )
      .subscribe();

    // Visibility / focus – immediate sync when user returns to PWA
    const onVisibility = () => {
      if (!document.hidden) void refresh();
    };
    const onFocus = () => void refresh();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onFocus);

    return () => {
      mountedRef.current = false;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onFocus);
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return count;
};
