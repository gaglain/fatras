import { useCallback, useEffect, useRef, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

const NOTIFICATIONS_LIMIT = 50;
const QUERY_KEY = (userId: string) => ['notifications', userId];

async function fetchNotificationsData(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, user_id, type, title, message, data, read, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(NOTIFICATIONS_LIMIT);

  if (error) throw error;
  return data || [];
}

export const useNotificationsOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Notifications query with aggressive caching
  const {
    data: notifications = [],
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: QUERY_KEY(user?.id || ''),
    queryFn: () => fetchNotificationsData(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000, // 30s fresh
    gcTime: 5 * 60_000, // 5min cache
    refetchOnWindowFocus: false,
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)
        .eq('user_id', user?.id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(user?.id || '') });
      
      queryClient.setQueryData<Notification[]>(QUERY_KEY(user?.id || ''), (old = []) =>
        old.map(n => n.id === id ? { ...n, read: true } : n)
      );
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user?.id)
        .eq('read', false);
      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(user?.id || '') });
      
      queryClient.setQueryData<Notification[]>(QUERY_KEY(user?.id || ''), (old = []) =>
        old.map(n => ({ ...n, read: true }))
      );
    },
  });

  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // Memoized unread count
  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `notif-rt-${user.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const newNotif = payload.new as Notification;
        
        queryClient.setQueryData<Notification[]>(QUERY_KEY(user.id), (old = []) => {
          if (old.some(n => n.id === newNotif.id)) return old;
          return [newNotif, ...old].slice(0, NOTIFICATIONS_LIMIT);
        });
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        const updated = payload.new as Notification;
        
        queryClient.setQueryData<Notification[]>(QUERY_KEY(user.id), (old = []) =>
          old.map(n => n.id === updated.id ? updated : n)
        );
      })
      .subscribe();

    realtimeChannelRef.current = channel;

    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
    };
  }, [user?.id, queryClient]);

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refetch,
  };
};
