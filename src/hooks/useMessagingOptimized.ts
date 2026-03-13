import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

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
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
  user_profile?: UserProfile;
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
  metadata?: unknown;
  user_profile?: UserProfile;
}

interface UserProfile {
  user_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
  is_active?: boolean;
  role?: string;
}

// Query keys for caching
const QUERY_KEYS = {
  channels: (userId: string) => ['messaging', 'channels', userId],
  messages: (channelId: string) => ['messaging', 'messages', channelId],
  availableUsers: (userId: string) => ['messaging', 'users', userId],
};

// Fetch channels optimized
async function fetchChannelsData(userId: string): Promise<Channel[]> {
  const [memberResult, publicResult] = await Promise.all([
    supabase
      .from('messaging_channel_members')
      .select('channel_id')
      .eq('user_id', userId),
    supabase
      .from('messaging_channels')
      .select('id')
      .eq('type', 'public')
      .eq('is_active', true)
  ]);

  if (memberResult.error) throw memberResult.error;
  if (publicResult.error) throw publicResult.error;

  const memberChannelIds = (memberResult.data || []).map(r => r.channel_id);
  const publicChannelIds = (publicResult.data || []).map(c => c.id);
  const allChannelIds = [...new Set([...memberChannelIds, ...publicChannelIds])];

  if (allChannelIds.length === 0) return [];

  const [channelResult, membersResult] = await Promise.all([
    supabase
      .from('messaging_channels')
      .select('id, name, description, type, user_id, roadshow_id, created_at, updated_at, is_active')
      .in('id', allChannelIds)
      .eq('is_active', true)
      .order('updated_at', { ascending: false }),
    supabase
      .from('messaging_channel_members')
      .select('id, channel_id, user_id, role, joined_at, last_read_at')
      .in('channel_id', allChannelIds)
  ]);

  if (channelResult.error) throw channelResult.error;

  const channelRows = channelResult.data || [];
  const allMembers = membersResult.data || [];

  // Fetch profiles in single query
  const allUserIds = [...new Set(allMembers.map(m => m.user_id))];
  const profilesByUserId: Record<string, UserProfile> = {};

  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name, username, email, avatar_url')
      .in('user_id', allUserIds);

    (profiles || []).forEach(p => {
      profilesByUserId[p.user_id] = p;
    });
  }

  const membersByChannel: Record<string, ChannelMember[]> = {};
  allMembers.forEach(m => {
    (membersByChannel[m.channel_id] ||= []).push({
      ...m,
      role: m.role as 'admin' | 'member',
      user_profile: profilesByUserId[m.user_id]
    });
  });

  return channelRows.map(ch => ({
    id: ch.id,
    name: ch.name,
    description: ch.description,
    type: ch.type as 'public' | 'private' | 'direct',
    user_id: ch.user_id,
    roadshow_id: ch.roadshow_id,
    created_at: ch.created_at,
    updated_at: ch.updated_at,
    is_active: ch.is_active,
    members: membersByChannel[ch.id] || [],
  }));
}

// Fetch messages optimized
async function fetchMessagesData(channelId: string): Promise<Message[]> {
  const { data: msgRows, error } = await supabase
    .from('messaging_messages')
    .select('id, channel_id, user_id, content, message_type, created_at, edited_at, reply_to_id')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(50); // Reduced from 100 for faster initial load

  if (error) throw error;

  const orderedMsgs = (msgRows || []).reverse();
  const userIds = [...new Set(orderedMsgs.map(m => m.user_id))];

  const profilesByUserId: Record<string, UserProfile> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, first_name, last_name, username, avatar_url')
      .in('user_id', userIds);

    (profiles || []).forEach(p => {
      profilesByUserId[p.user_id] = p;
    });
  }

  return orderedMsgs.map(msg => ({
    id: msg.id,
    channel_id: msg.channel_id,
    user_id: msg.user_id,
    content: msg.content,
    message_type: msg.message_type as Message['message_type'],
    created_at: msg.created_at,
    edited_at: msg.edited_at,
    reply_to_id: msg.reply_to_id,
    user_profile: profilesByUserId[msg.user_id]
  }));
}

// Fetch available users
async function fetchAvailableUsersData(userId: string): Promise<UserProfile[]> {
  try {
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_active_users_basic');
    if (!rpcError && rpcData) return rpcData || [];
  } catch {
    // RPC not available
  }

  const { data: profiles } = await supabase
    .from('user_profiles')
    .select('user_id, first_name, last_name, username, email, is_active, role')
    .eq('is_active', true)
    .neq('user_id', userId);

  return profiles || [];
}

export const useMessagingOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Channels query with cache
  const {
    data: channels = [],
    isLoading: channelsLoading,
    refetch: refetchChannels
  } = useQuery({
    queryKey: QUERY_KEYS.channels(user?.id || ''),
    queryFn: () => fetchChannelsData(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000, // 30s - data considered fresh
    gcTime: 5 * 60_000, // 5min cache
  });

  // Available users query
  const { data: availableUsers = [] } = useQuery({
    queryKey: QUERY_KEYS.availableUsers(user?.id || ''),
    queryFn: () => fetchAvailableUsersData(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000, // 1min
    gcTime: 10 * 60_000, // 10min cache
  });

  // Messages are fetched per channel
  const fetchMessages = useCallback(async (channelId: string) => {
    if (!channelId) return;
    
    try {
      const messages = await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.messages(channelId),
        queryFn: () => fetchMessagesData(channelId),
        staleTime: 10_000, // 10s
      });
      return messages;
    } catch (error) {
      logger.error('Error fetching messages:', error);
      return [];
    }
  }, [queryClient]);

  // Get cached messages for a channel
  const getMessages = useCallback((channelId: string): Message[] => {
    return queryClient.getQueryData(QUERY_KEYS.messages(channelId)) || [];
  }, [queryClient]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ channelId, content }: { channelId: string; content: string }) => {
      if (!user) throw new Error('Non connecté');

      // Ensure membership first
      await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' })
        .then(() => {});

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
      return data;
    },
    onSuccess: (data, { channelId }) => {
      // Optimistic update
      queryClient.setQueryData<Message[]>(QUERY_KEYS.messages(channelId), (old = []) => {
        if (old.some(m => m.id === data.id)) return old;
        return [...old, {
          ...data,
          message_type: data.message_type as Message['message_type']
        }];
      });

      // Update channel timestamp and refresh channel list
      supabase
        .from('messaging_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId)
        .then(() => {
          // Invalidate channels cache to update sort order
          if (user) {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
          }
        });
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`);
    }
  });

  const sendMessage = useCallback(async (channelId: string, content: string) => {
    try {
      const result = await sendMessageMutation.mutateAsync({ channelId, content });
      return result;
    } catch {
      return null;
    }
  }, [sendMessageMutation]);

  // Ensure membership
  const ensureMembership = useCallback(async (channelId: string) => {
    if (!user) return false;
    try {
      await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      return true;
    } catch {
      return true; // Already member
    }
  }, [user]);

  // Mark channel as read
  const markChannelAsRead = useCallback(async (channelId: string) => {
    if (!user) return;
    await supabase
      .from('messaging_channel_members')
      .update({ last_read_at: new Date().toISOString() })
      .eq('channel_id', channelId)
      .eq('user_id', user.id);
  }, [user]);

  // Create channel
  const createChannel = useCallback(async (
    name: string,
    description = '',
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
        roadshow_ref_id: roadshowId,
      });

      if (!error && data) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
        return data as string;
      }

      // Fallback manual creation
      const { data: channelRow, error: insertErr } = await supabase
        .from('messaging_channels')
        .insert({ name, description, type, user_id: user.id, roadshow_id: roadshowId, is_active: true })
        .select('id')
        .single();

      if (insertErr || !channelRow) throw insertErr;

      const baseMembers = [user.id, ...memberIds.filter(id => id !== user.id)];
      for (const uid of baseMembers) {
        await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelRow.id, user_id: uid, role: uid === user.id ? 'admin' : 'member' });
      }

      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      return channelRow.id;
    } catch (error) {
      logger.error('Error creating channel:', error);
      return null;
    }
  }, [user, queryClient]);

  // Archive channel
  const archiveChannel = useCallback(async (channelId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('messaging_channels')
        .update({ is_active: false })
        .eq('id', channelId);

      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      toast.success('Canal archivé');
      return true;
    } catch {
      toast.error("Erreur lors de l'archivage");
      return false;
    }
  }, [user, queryClient]);

  // Real-time subscription
  useEffect(() => {
    if (!user?.id) return;

    const channelName = `msg-rt-${user.id}-${Date.now()}`;
    
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messaging_messages'
      }, async (payload) => {
        const newMessage = payload.new as Message;
        
        // Fetch user profile for the message sender
        let userProfile: UserProfile | undefined;
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, avatar_url')
          .eq('user_id', newMessage.user_id)
          .maybeSingle();
        if (profile) userProfile = profile;

        // Update cache
        queryClient.setQueryData<Message[]>(QUERY_KEYS.messages(newMessage.channel_id), (old = []) => {
          if (old.some(m => m.id === newMessage.id)) return old;
          return [...old, { ...newMessage, user_profile: userProfile }];
        });

        // Notification for others' messages
        if (newMessage.user_id !== user.id) {
          toast.info('Nouveau message', { 
            description: newMessage.content?.slice(0, 80) 
          });
        }
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messaging_channels'
      }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messaging_channel_members',
        filter: `user_id=eq.${user.id}`
      }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
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
    channels,
    loading: channelsLoading,
    availableUsers,
    fetchChannels: refetchChannels,
    fetchMessages,
    getMessages,
    sendMessage,
    ensureMembership,
    markChannelAsRead,
    createChannel,
    archiveChannel,
  };
};
