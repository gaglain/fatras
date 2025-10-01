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

  // Fetch user channels (joined channels)
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

  // Fetch all available public channels (Slack-style discovery)
  const fetchAvailableChannels = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('messaging_channels')
        .select(`
          *,
          messaging_channel_members(user_id)
        `)
        .eq('type', 'public')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      return (data || []).map(ch => ({
        ...ch,
        is_member: ch.messaging_channel_members?.some((m: any) => m.user_id === user.id) || false,
        member_count: ch.messaging_channel_members?.length || 0
      }));
    } catch (error) {
      console.error('Error fetching available channels:', error);
      return [];
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
        .select('id, user_id, first_name, last_name, username, email')
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
      // Try RPC first
      const { data, error } = await supabase.rpc('create_messaging_channel', {
        channel_name: name,
        channel_description: description,
        channel_type: type,
        member_user_ids: memberIds,
        roadshow_ref_id: roadshowId,
      });

      if (!error && data) {
        await fetchChannels();
        return data as string;
      }

      // Fallback: manual creation if RPC is unavailable
      console.warn('RPC create_messaging_channel not available, falling back to manual insert', error);

      const { data: channelRow, error: insertErr } = await supabase
        .from('messaging_channels')
        .insert({
          name,
          description,
          type,
          user_id: user.id,
          roadshow_id: roadshowId,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertErr || !channelRow) throw insertErr;

      const baseMembers = [user.id, ...memberIds.filter((id) => id !== user.id)];
      if (baseMembers.length > 0) {
        const membersPayload = baseMembers.map((uid) => ({
          channel_id: channelRow.id,
          user_id: uid,
          role: uid === user.id ? 'admin' : 'member',
        }));
        const { error: membersErr } = await supabase
          .from('messaging_channel_members')
          .insert(membersPayload);
        if (membersErr) console.warn('Members insert warning:', membersErr);
      }

      await fetchChannels();
      return channelRow.id as string;
    } catch (error) {
      console.error('Error creating channel (RPC + fallback failed):', error);
      return null;
    }
  };

  // Create direct message channel
  const createDirectMessage = async (otherUserId: string) => {
    if (!user) return null;

    try {
      // Try RPC first
      const { data: channelId, error: rpcErr } = await supabase.rpc(
        'create_direct_message_channel',
        { other_user_id: otherUserId }
      );

      if (!rpcErr && channelId) {
        setTimeout(() => { fetchChannels(); }, 100);
        return channelId as string;
      }

      // Fallback: manual creation
      console.warn('RPC create_direct_message_channel not available, falling back to manual insert', rpcErr);

      const dmName = `DM-${user.id}-${otherUserId}`;
      const { data: channelRow, error: insertErr } = await supabase
        .from('messaging_channels')
        .insert({
          name: dmName,
          type: 'direct',
          user_id: user.id,
          is_active: true,
        })
        .select('id')
        .single();

      if (insertErr || !channelRow) throw insertErr;

      const { error: membersErr } = await supabase
        .from('messaging_channel_members')
        .insert([
          { channel_id: channelRow.id, user_id: user.id, role: 'admin' },
          { channel_id: channelRow.id, user_id: otherUserId, role: 'member' },
        ]);
      if (membersErr) console.warn('DM members insert warning:', membersErr);

      setTimeout(() => { fetchChannels(); }, 100);
      return channelRow.id as string;
    } catch (error) {
      console.error('Error creating DM (RPC + fallback failed):', error);
      return null;
    }
  };

  // Send a message (auto-join channel if not a member)
  const sendMessage = async (channelId: string, content: string) => {
    if (!user) return null;

    try {
      // Ensure current user is a member of the channel (RLS requires membership to send)
      const { data: existingMember, error: memberCheckErr } = await supabase
        .from('messaging_channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (memberCheckErr) {
        console.warn('Membership check warning:', memberCheckErr);
      }

      if (!existingMember) {
        const { error: joinErr } = await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
        if (joinErr) {
          // Not fatal for sender if they were already member or policy restricts; continue sending anyway
          console.warn('Join channel (self) warning:', joinErr);
        }
      }

      const { data, error } = await supabase
        .from('messaging_messages')
        .insert({
          channel_id: channelId,
          user_id: user.id,
          content,
          message_type: 'text',
        })
        .select('*')
        .single();

      if (error) throw error;

      const transformedMessage: Message = {
        id: data.id,
        channel_id: data.channel_id,
        user_id: data.user_id,
        content: data.content,
        message_type: data.message_type as 'text' | 'image' | 'file' | 'system',
        created_at: data.created_at,
        edited_at: data.edited_at,
        reply_to_id: data.reply_to_id,
        metadata: data.metadata,
      };

      setMessages((prev) => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), transformedMessage],
      }));

      // Best-effort: update channel ordering; may fail for non-owners due to RLS, so ignore errors
      try {
        await supabase
          .from('messaging_channels')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', channelId);
      } catch (e) {
        console.debug('Non-owner channel update ignored:', e);
      }

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

  // Delete channels by roadshow ID
  const deleteChannelsByRoadshow = async (roadshowId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messaging_channels')
        .update({ is_active: false })
        .eq('roadshow_id', roadshowId)
        .eq('user_id', user.id);

      if (error) throw error;

      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Error deleting roadshow channels:', error);
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

  // Ensure current user is a member of the channel (join-on-view)
  const ensureMembership = async (channelId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { data: existing, error: checkErr } = await supabase
        .from('messaging_channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (checkErr) console.warn('ensureMembership check warning:', checkErr);
      if (existing) return true;
      const { error: insertErr } = await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      if (insertErr) {
        console.warn('ensureMembership insert warning:', insertErr);
        return false;
      }
      return true;
    } catch (e) {
      console.error('ensureMembership error:', e);
      return false;
    }
  };

  // Ensure user is in #general (Slack-like default)
  const ensureDefaultGeneralMembership = async () => {
    if (!user) return;
    try {
      // 1) Find existing public #general channel
      // 1) Find all active public #general, prefer oldest
      const { data: generals, error: listErr } = await supabase
        .from('messaging_channels')
        .select('id, created_at')
        .eq('name', 'general')
        .eq('type', 'public')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      let channelId: string | undefined = generals?.[0]?.id;

      // 2) Create it if missing (RPC first, then fallback re-check)
      if (!channelId) {
        const { data: newId, error: rpcErr } = await supabase.rpc('create_messaging_channel', {
          channel_name: 'general',
          channel_description: 'Canal par défaut',
          channel_type: 'public',
          member_user_ids: [],
          roadshow_ref_id: null,
        });

        if (!rpcErr && newId) {
          channelId = newId as string;
        } else {
          // Recheck in case it was created concurrently; pick oldest
          const { data: againList } = await supabase
            .from('messaging_channels')
            .select('id, created_at')
            .eq('name', 'general')
            .eq('type', 'public')
            .eq('is_active', true)
            .order('created_at', { ascending: true });
          channelId = againList?.[0]?.id;
        }
      }

      if (!channelId) return;

      // 3) Ensure current user is a member
      const { data: existing } = await supabase
        .from('messaging_channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      }

      // Clean up duplicate #general memberships for this user (keep canonical oldest)
      try {
        const { data: others } = await supabase
          .from('messaging_channels')
          .select('id')
          .eq('name', 'general')
          .eq('type', 'public')
          .eq('is_active', true)
          .neq('id', channelId);

        const otherIds = (others || []).map((c: any) => c.id);
        if (otherIds.length > 0) {
          await supabase
            .from('messaging_channel_members')
            .delete()
            .in('channel_id', otherIds)
            .eq('user_id', user.id);
        }
      } catch (_e) {
        // ignore cleanup errors
      }
    } catch (e) {
      console.warn('ensureDefaultGeneralMembership error:', e);
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
    if (!user?.id) {
      setLoading(false);
      return;
    }

    console.log('🔄 Fetching messaging data for user:', user.id);
    fetchChannels();
    fetchAvailableUsers();
    ensureDefaultGeneralMembership();
    setLoading(false);
  }, [user?.id]);

  // Fixed real-time subscriptions with proper cleanup
  useEffect(() => {
    if (!user?.id) return;

    console.log('📡 Setting up real-time subscription for messaging');
    
    // Remove any existing subscriptions first
    const existingChannels = supabase.getChannels();
    existingChannels.forEach(channel => {
      if (channel.topic.includes('messaging')) {
        console.log('🧹 Removing existing channel:', channel.topic);
        supabase.removeChannel(channel);
      }
    });

    // Create a unique channel name based on timestamp to avoid conflicts
    const channelName = `messaging-realtime-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaging_messages'
        },
        (payload) => {
          console.log('📨 New message received:', payload.new);
          const newMessage = payload.new as Message;
          // Update local state immediately
          setMessages(prev => ({
            ...prev,
            [newMessage.channel_id]: [...(prev[newMessage.channel_id] || []), newMessage]
          }));
          
          // Update channel's updated_at for proper ordering
          setChannels(prev => prev.map(ch => 
            ch.id === newMessage.channel_id 
              ? { ...ch, updated_at: newMessage.created_at }
              : ch
          ));

          // Ensure full thread is loaded on receivers (avoids missing history)
          fetchMessages(newMessage.channel_id);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaging_channels'
        },
        (payload) => {
          console.log('📢 New channel created:', payload.new);
          fetchChannels();
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messaging_channel_members',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          console.log('👤 You were added to a channel, refreshing channels');
          fetchChannels();
        }
      )
      .subscribe((status) => {
        console.log('📡 Messaging subscription status:', status);
      });

    return () => {
      console.log('🧹 Cleaning up messaging subscription');
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  // Join a public channel (Slack-style)
  const joinChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' });

      if (error) throw error;

      await fetchChannels();
      return true;
    } catch (error) {
      console.error('Error joining channel:', error);
      return false;
    }
  };

  return {
    channels,
    messages,
    availableUsers,
    loading,
    fetchChannels,
    fetchAvailableChannels,
    fetchMessages,
    createChannel,
    createDirectMessage,
    sendMessage,
    deleteChannel,
    deleteChannelsByRoadshow,
    addChannelMembers,
    ensureMembership,
    removeChannelMember,
    joinChannel,
    markChannelAsRead
  };
};