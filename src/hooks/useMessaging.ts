import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  user_id: string;
  roadshow_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  unread_count?: number;
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  created_at: string;
  edited_at?: string;
  reply_to_id?: string;
  metadata?: any;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user channels
  const fetchChannels = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messaging_channels')
        .select(`
          *,
          messaging_channel_members!inner(
            id,
            user_id,
            role,
            joined_at,
            last_read_at
          )
        `)
        .eq('messaging_channel_members.user_id', user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform data to match our Channel interface
      const transformedChannels: Channel[] = (data || []).map(ch => ({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        type: ch.type as 'public' | 'private' | 'direct',
        user_id: ch.user_id,
        roadshow_id: ch.roadshow_id,
        created_at: ch.created_at,
        updated_at: ch.updated_at,
        is_active: ch.is_active,
        members: ch.messaging_channel_members.map((member: any) => ({
          id: member.id,
          channel_id: ch.id,
          user_id: member.user_id,
          role: member.role as 'admin' | 'member',
          joined_at: member.joined_at,
          last_read_at: member.last_read_at
        }))
      }));

      setChannels(transformedChannels);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  // Fetch messages for a channel
  const fetchMessages = async (channelId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('messaging_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Transform data to match our Message interface
      const transformedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        user_id: msg.user_id,
        content: msg.content,
        message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
        created_at: msg.created_at,
        edited_at: msg.edited_at,
        reply_to_id: msg.reply_to_id,
        metadata: msg.metadata
      }));

      setMessages(prev => ({
        ...prev,
        [channelId]: transformedMessages
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Fetch available users for adding to channels
  const fetchAvailableUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, username, email')
        .eq('is_active', true);

      if (error) throw error;
      setAvailableUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Create a new channel
  const createChannel = async (
    name: string, 
    description: string = '', 
    type: 'public' | 'private' = 'public',
    memberIds: string[] = [],
    roadshowId?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('create_messaging_channel', {
        channel_name: name,
        channel_description: description,
        channel_type: type,
        member_user_ids: memberIds,
        roadshow_ref_id: roadshowId
      });

      if (error) throw error;

      await fetchChannels();
      return data;
    } catch (error) {
      console.error('Error creating channel:', error);
      return null;
    }
  };

  // Create direct message channel
  const createDirectMessage = async (otherUserId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.rpc('create_direct_message_channel', {
        other_user_id: otherUserId
      });

      if (error) throw error;

      await fetchChannels();
      return data;
    } catch (error) {
      console.error('Error creating DM:', error);
      return null;
    }
  };

  // Send a message
  const sendMessage = async (channelId: string, content: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('messaging_messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content,
          message_type: 'text'
        })
        .select('*')
        .single();

      if (error) throw error;

      // Transform the message to match our interface
      const transformedMessage: Message = {
        id: data.id,
        channel_id: data.channel_id,
        user_id: data.user_id,
        content: data.content,
        message_type: data.message_type as 'text' | 'image' | 'file' | 'system',
        created_at: data.created_at,
        edited_at: data.edited_at,
        reply_to_id: data.reply_to_id,
        metadata: data.metadata
      };

      // Update messages in state
      setMessages(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), transformedMessage]
      }));

      // Update channel's updated_at
      await supabase
        .from('messaging_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId);

      return transformedMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  };

  // Delete a channel
  const deleteChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messaging_channels')
        .update({ is_active: false })
        .eq('id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Error deleting channel:', error);
      return false;
    }
  };

  // Add members to channel
  const addChannelMembers = async (channelId: string, userIds: string[]) => {
    if (!user) return false;

    try {
      const members = userIds.map(userId => ({
        channel_id: channelId,
        user_id: userId,
        role: 'member'
      }));

      const { error } = await supabase
        .from('messaging_channel_members')
        .insert(members);

      if (error) throw error;

      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Error adding members:', error);
      return false;
    }
  };

  // Remove member from channel
  const removeChannelMember = async (channelId: string, userId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messaging_channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId);

      if (error) throw error;

      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  };

  // Mark channel as read
  const markChannelAsRead = async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('messaging_channel_members')
        .update({ last_read_at: new Date().toISOString() })
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      console.log('🔄 Fetching messaging data for user:', user.id);
      fetchChannels();
      fetchAvailableUsers();
    }
    setLoading(false);
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    console.log('📡 Setting up real-time subscription for user:', user.id);
    
    // Create a unique channel name to avoid conflicts
    const channelName = `messaging_changes_${user.id}_${Date.now()}`;
    console.log('📡 Creating channel:', channelName);
    const channelSubscription = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messaging_messages'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newMessage = payload.new as Message;
            setMessages(prev => ({
              ...prev,
              [newMessage.channel_id]: [...(prev[newMessage.channel_id] || []), newMessage]
            }));
          }
        }
      )
      .subscribe();

    return () => {
      // Properly unsubscribe and remove channel
      console.log('🧹 Cleaning up messaging subscription:', channelName);
      channelSubscription.unsubscribe();
      supabase.removeChannel(channelSubscription);
    };
  }, [user]);

  return {
    channels,
    messages,
    availableUsers,
    loading,
    fetchChannels,
    fetchMessages,
    createChannel,
    createDirectMessage,
    sendMessage,
    deleteChannel,
    addChannelMembers,
    removeChannelMember,
    markChannelAsRead
  };
};