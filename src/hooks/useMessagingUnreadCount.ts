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

    // Rafraîchir périodiquement (toutes les 10 secondes)
    const interval = setInterval(fetchUnreadCount, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [user?.id]);

  return unreadCount;
};
