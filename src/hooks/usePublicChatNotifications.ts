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
    
    console.log('🔔 Setting up global public chat notification listener');
    
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
          console.log('🔔 Global: New public chat message received:', newMsg);
          
          // Only create notification if message is from visitor (not admin)
          if (!newMsg.is_from_admin) {
            console.log('📨 Creating notification for public chat message');
            
            const { error } = await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'public_chat',
              title: 'Nouveau message du site',
              message: `${newMsg.visitor_name || 'Un visiteur'}: ${newMsg.message?.substring(0, 50)}${newMsg.message?.length > 50 ? '...' : ''}`,
              read: false,
              data: { visitor_id: newMsg.visitor_id, message_id: newMsg.id }
            });
            
            if (error) {
              console.error('❌ Error creating public chat notification:', error);
            } else {
              console.log('✅ Public chat notification created successfully');
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('🔔 Global public chat subscription status:', status);
      });

    return () => {
      if (channelRef.current) {
        console.log('🔔 Cleaning up global public chat listener');
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id]);
};
