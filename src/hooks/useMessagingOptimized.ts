import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { QUERY_KEYS, fetchChannelsData, fetchMessagesData, fetchAvailableUsersData } from './useMessagingData';

export type { Channel, ChannelMember, Message } from './useMessagingData';

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

export const useMessagingOptimized = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const realtimeChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const { data: channels = [], isLoading: channelsLoading, refetch: refetchChannels } = useQuery({
    queryKey: QUERY_KEYS.channels(user?.id || ''),
    queryFn: () => fetchChannelsData(user!.id),
    enabled: !!user?.id,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const { data: availableUsers = [] } = useQuery({
    queryKey: QUERY_KEYS.availableUsers(user?.id || ''),
    queryFn: () => fetchAvailableUsersData(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
    gcTime: 10 * 60_000,
  });

  const fetchMessages = useCallback(async (channelId: string) => {
    if (!channelId) return;
    try {
      return await queryClient.fetchQuery({
        queryKey: QUERY_KEYS.messages(channelId),
        queryFn: () => fetchMessagesData(channelId),
        staleTime: 10_000,
      });
    } catch (error) {
      logger.error('Error fetching messages:', error);
      return [];
    }
  }, [queryClient]);

  const getMessages = useCallback((channelId: string): Message[] => {
    return queryClient.getQueryData(QUERY_KEYS.messages(channelId)) || [];
  }, [queryClient]);

  const sendMessageMutation = useMutation({
    mutationFn: async ({ channelId, content }: { channelId: string; content: string }) => {
      if (!user) throw new Error('Non connecté');
      await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: user.id, role: 'member' }).then(() => {});
      const { data, error } = await supabase.from('messaging_messages').insert({ channel_id: channelId, user_id: user.id, content, message_type: 'text' }).select('*').single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (data, { channelId }) => {
      let senderProfile: UserProfile | undefined;
      if (user) {
        const { data: profile } = await supabase.from('user_profiles').select('user_id, first_name, last_name, username, avatar_url').eq('user_id', user.id).maybeSingle();
        if (profile) senderProfile = profile;
      }
      queryClient.setQueryData<Message[]>(QUERY_KEYS.messages(channelId), (old = []) => {
        if (old.some(m => m.id === data.id)) return old;
        return [...old, { ...data, message_type: data.message_type as Message['message_type'], user_profile: senderProfile }];
      });
      supabase.from('messaging_channels').update({ updated_at: new Date().toISOString() }).eq('id', channelId).then(() => {
        if (user) queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      });
    },
    onError: (error: Error) => { toast.error(`Erreur: ${error.message}`); }
  });

  const sendMessage = useCallback(async (channelId: string, content: string) => {
    try { return await sendMessageMutation.mutateAsync({ channelId, content }); } catch { return null; }
  }, [sendMessageMutation]);

  const ensureMembership = useCallback(async (channelId: string) => {
    if (!user) return false;
    try { await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: user.id, role: 'member' }); return true; } catch { return true; }
  }, [user]);

  const markChannelAsRead = useCallback(async (channelId: string) => {
    if (!user) return;
    await supabase.from('messaging_channel_members').update({ last_read_at: new Date().toISOString() }).eq('channel_id', channelId).eq('user_id', user.id);
  }, [user]);

  const createChannel = useCallback(async (name: string, description = '', type: 'public' | 'private' = 'public', memberIds: string[] = [], roadshowId?: string) => {
    if (!user) return null;
    try {
      const { data, error } = await supabase.rpc('create_messaging_channel', { channel_name: name, channel_description: description, channel_type: type, member_user_ids: memberIds, roadshow_ref_id: roadshowId });
      if (!error && data) { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) }); return data as string; }
      const { data: channelRow, error: insertErr } = await supabase.from('messaging_channels').insert({ name, description, type, user_id: user.id, roadshow_id: roadshowId, is_active: true }).select('id').single();
      if (insertErr || !channelRow) throw insertErr;
      const baseMembers = [user.id, ...memberIds.filter(id => id !== user.id)];
      for (const uid of baseMembers) { await supabase.from('messaging_channel_members').insert({ channel_id: channelRow.id, user_id: uid, role: uid === user.id ? 'admin' : 'member' }); }
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      return channelRow.id;
    } catch (error) { logger.error('Error creating channel:', error); return null; }
  }, [user, queryClient]);

  const archiveChannel = useCallback(async (channelId: string) => {
    if (!user) return false;
    try {
      const { error } = await supabase.from('messaging_channels').update({ is_active: false }).eq('id', channelId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) });
      toast.success('Canal archivé');
      return true;
    } catch { toast.error("Erreur lors de l'archivage"); return false; }
  }, [user, queryClient]);

  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase.channel(`msg-rt-${user.id}-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_messages' }, async (payload) => {
        const newMessage = payload.new as Message;
        let userProfile: UserProfile | undefined;
        const { data: profile } = await supabase.from('user_profiles').select('user_id, first_name, last_name, username, avatar_url').eq('user_id', newMessage.user_id).maybeSingle();
        if (profile) userProfile = profile;
        queryClient.setQueryData<Message[]>(QUERY_KEYS.messages(newMessage.channel_id), (old = []) => {
          if (old.some(m => m.id === newMessage.id)) return old;
          return [...old, { ...newMessage, user_profile: userProfile }];
        });
        if (newMessage.user_id !== user.id) { toast.info('Nouveau message', { description: newMessage.content?.slice(0, 80) }); }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_channels' }, () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) }); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_channel_members', filter: `user_id=eq.${user.id}` }, () => { queryClient.invalidateQueries({ queryKey: QUERY_KEYS.channels(user.id) }); })
      .subscribe();
    realtimeChannelRef.current = channel;
    return () => { if (realtimeChannelRef.current) { supabase.removeChannel(realtimeChannelRef.current); realtimeChannelRef.current = null; } };
  }, [user?.id, queryClient]);

  return { channels, loading: channelsLoading, availableUsers, fetchChannels: refetchChannels, fetchMessages, getMessages, sendMessage, ensureMembership, markChannelAsRead, createChannel, archiveChannel };
};
