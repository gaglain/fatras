import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Global hook to listen for public chat messages and create notifications
 * This should be used at the app level to ensure notifications are created
 * even when the messaging page is not open
 */
export const usePublicChatNotifications = () => {
  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!user?.id) return;

    // Create unique channel name
    const channelName = `global-public-chat-notif-${user.id}-${Date.now()}`;
    
    console.log('🔔 usePublicChatNotifications: Setting up listener for user:', user.id);
    
    channelRef.current = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'public_chat_messages'
        },
        async (payload) => {
          const newMsg = payload.new as any;
          console.log('🔔 usePublicChatNotifications: New message received:', newMsg);
          
          // Only create notification if message is from visitor (not admin)
          if (!newMsg.is_from_admin) {
            console.log('📨 usePublicChatNotifications: Creating notification for visitor message');
            
            try {
              const { data, error } = await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'public_chat',
                title: 'Nouveau message du site',
                message: `${newMsg.visitor_name || 'Un visiteur'}: ${newMsg.message?.substring(0, 50)}${newMsg.message?.length > 50 ? '...' : ''}`,
                read: false,
                data: { visitor_id: newMsg.visitor_id, message_id: newMsg.id }
              }).select();
              
              if (error) {
                console.error('❌ usePublicChatNotifications: Error creating notification:', error);
              } else {
                console.log('✅ usePublicChatNotifications: Notification created:', data);
              }
            } catch (err) {
              console.error('❌ usePublicChatNotifications: Exception:', err);
            }
          } else {
            console.log('🔔 usePublicChatNotifications: Skipping admin message');
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 usePublicChatNotifications: Subscription status:', status);
      });

    return () => {
      if (channelRef.current) {
        console.log('🔔 usePublicChatNotifications: Cleaning up listener');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id]);
};
