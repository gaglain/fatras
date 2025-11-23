import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMessagingUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // Récupérer l'ID utilisateur depuis auth
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) {
          setUnreadCount(0);
          return;
        }

        // Récupérer les canaux dont l'utilisateur est membre
        const { data: memberships, error: memberError } = await supabase
          .from('messaging_channel_members')
          .select('channel_id, last_read_at')
          .eq('user_id', authUser.id);

        if (memberError) throw memberError;
        if (!memberships || memberships.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Pour chaque canal, compter les messages non lus
        let totalUnread = 0;
        
        for (const membership of memberships) {
          const { count, error: countError } = await supabase
            .from('messaging_messages')
            .select('*', { count: 'exact', head: true })
            .eq('channel_id', membership.channel_id)
            .neq('user_id', authUser.id)
            .gt('created_at', membership.last_read_at || '1970-01-01');

          if (!countError && count) {
            totalUnread += count;
          }
        }

        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error fetching messaging unread count:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // S'abonner aux nouveaux messages
    const subscribeToChanges = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const channel = supabase
        .channel('messaging-unread')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messaging_messages'
          },
          () => {
            fetchUnreadCount();
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messaging_channel_members',
            filter: `user_id=eq.${authUser.id}`
          },
          () => {
            fetchUnreadCount();
          }
        )
        .subscribe();

      return channel;
    };

    let channelSubscription: any;
    subscribeToChanges().then(channel => {
      channelSubscription = channel;
    });

    return () => {
      if (channelSubscription) {
        channelSubscription.unsubscribe();
      }
    };
  }, [user]);

  return unreadCount;
};
