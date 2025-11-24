import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useMessagingUnreadCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    const fetchUnreadCount = async () => {
      try {
        // Compter simplement les notifications de type 'message' non lues
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('type', 'message')
          .eq('read', false);

        if (error) throw error;
        setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error fetching messaging unread count:', error);
        setUnreadCount(0);
      }
    };

    fetchUnreadCount();

    // S'abonner aux changements de notifications de type 'message'
    // Utiliser un nom de canal unique avec l'ID utilisateur pour éviter les conflits
    const channelName = `messaging-notifications-unread-${user.id}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('📨 Notification change detected:', payload);
          // Rafraîchir immédiatement le compteur
          fetchUnreadCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return unreadCount;
};
