import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Global hook to listen for public chat messages and create notifications
 * This should be used at the app level to ensure notifications are created
 * even when the messaging page is not open
 */
export const usePublicChatNotifications = () => {
  const { user } = useAuth();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  const createNotification = useCallback(async (newMsg: any) => {
    if (!user?.id) return;
    
    console.log('📨 usePublicChatNotifications: Creating notification for message:', newMsg.id);
    
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
        console.log('✅ usePublicChatNotifications: Notification created successfully:', data);
      }
    } catch (err) {
      console.error('❌ usePublicChatNotifications: Exception:', err);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      console.log('🔔 usePublicChatNotifications: No user, skipping');
      return;
    }

    // Prevent duplicate subscriptions
    if (isSubscribedRef.current) {
      console.log('🔔 usePublicChatNotifications: Already subscribed, skipping');
      return;
    }

    // Create unique channel name
    const channelName = `global-public-chat-notif-${user.id}`;
    
    console.log('🔔 usePublicChatNotifications: Setting up listener for user:', user.id);
    
    // Clean up existing channel if any
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

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
          console.log('🔔 usePublicChatNotifications: New message received:', {
            id: newMsg.id,
            visitor_name: newMsg.visitor_name,
            is_from_admin: newMsg.is_from_admin
          });
          
          // Only create notification if message is from visitor (not admin)
          if (!newMsg.is_from_admin) {
            await createNotification(newMsg);
          } else {
            console.log('🔔 usePublicChatNotifications: Skipping admin message');
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 usePublicChatNotifications: Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          console.log('✅ usePublicChatNotifications: Successfully subscribed to public chat messages');
        }
      });

    return () => {
      console.log('🔔 usePublicChatNotifications: Cleaning up listener');
      isSubscribedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [user?.id, createNotification]);
};
