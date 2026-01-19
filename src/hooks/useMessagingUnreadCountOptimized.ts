import { useEffect, useRef, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const QUERY_KEY = (userId: string) => ['messaging-unread', userId];

async function fetchUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', 'message')
    .eq('read', false);

  if (error) return 0;
  return count || 0;
}

export const useMessagingUnreadCountOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: QUERY_KEY(user?.id || ''),
    queryFn: () => fetchUnreadCount(user!.id),
    enabled: !!user?.id,
    staleTime: 15_000, // 15s
    gcTime: 60_000, // 1min
    refetchOnWindowFocus: false,
  });

  // Real-time subscription for count updates
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `msg-unread-${user.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, () => {
        // Invalidate to refetch count
        queryClient.invalidateQueries({ queryKey: QUERY_KEY(user.id) });
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

  return unreadCount;
};
