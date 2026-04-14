import { supabase } from '@/integrations/supabase/client';
import { Channel, ChannelMember, Message } from './useMessagingOptimized';

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

export const QUERY_KEYS = {
  channels: (userId: string) => ['messaging', 'channels', userId],
  messages: (channelId: string) => ['messaging', 'messages', channelId],
  availableUsers: (userId: string) => ['messaging', 'users', userId],
};

export async function fetchChannelsData(userId: string): Promise<Channel[]> {
  const [memberResult, publicResult] = await Promise.all([
    supabase.from('messaging_channel_members').select('channel_id').eq('user_id', userId),
    supabase.from('messaging_channels').select('id').eq('type', 'public').eq('is_active', true)
  ]);

  if (memberResult.error) throw memberResult.error;
  if (publicResult.error) throw publicResult.error;

  const allChannelIds = [...new Set([
    ...(memberResult.data || []).map(r => r.channel_id),
    ...(publicResult.data || []).map(c => c.id)
  ])];

  if (allChannelIds.length === 0) return [];

  const [channelResult, membersResult] = await Promise.all([
    supabase.from('messaging_channels')
      .select('id, name, description, type, user_id, roadshow_id, created_at, updated_at, is_active')
      .in('id', allChannelIds).eq('is_active', true).order('updated_at', { ascending: false }),
    supabase.from('messaging_channel_members')
      .select('id, channel_id, user_id, role, joined_at, last_read_at')
      .in('channel_id', allChannelIds)
  ]);

  if (channelResult.error) throw channelResult.error;

  const allMembers = membersResult.data || [];
  const allUserIds = [...new Set(allMembers.map(m => m.user_id))];
  const profilesByUserId: Record<string, UserProfile> = {};

  if (allUserIds.length > 0) {
    const { data: profiles } = await supabase.from('user_profiles')
      .select('user_id, first_name, last_name, username, email, avatar_url')
      .in('user_id', allUserIds);
    (profiles || []).forEach(p => { profilesByUserId[p.user_id] = p; });
  }

  const membersByChannel: Record<string, ChannelMember[]> = {};
  allMembers.forEach(m => {
    (membersByChannel[m.channel_id] ||= []).push({
      ...m, role: m.role as 'admin' | 'member', user_profile: profilesByUserId[m.user_id]
    });
  });

  return (channelResult.data || []).map(ch => ({
    id: ch.id, name: ch.name, description: ch.description,
    type: ch.type as 'public' | 'private' | 'direct',
    user_id: ch.user_id, roadshow_id: ch.roadshow_id,
    created_at: ch.created_at, updated_at: ch.updated_at, is_active: ch.is_active,
    members: membersByChannel[ch.id] || [],
  }));
}

export async function fetchMessagesData(channelId: string): Promise<Message[]> {
  const { data: msgRows, error } = await supabase.from('messaging_messages')
    .select('id, channel_id, user_id, content, message_type, created_at, edited_at, reply_to_id')
    .eq('channel_id', channelId).order('created_at', { ascending: false }).limit(50);

  if (error) throw error;

  const orderedMsgs = (msgRows || []).reverse();
  const userIds = [...new Set(orderedMsgs.map(m => m.user_id))];
  const profilesByUserId: Record<string, UserProfile> = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabase.from('user_profiles')
      .select('user_id, first_name, last_name, username, avatar_url')
      .in('user_id', userIds);
    (profiles || []).forEach(p => { profilesByUserId[p.user_id] = p; });
  }

  return orderedMsgs.map(msg => ({
    id: msg.id, channel_id: msg.channel_id, user_id: msg.user_id,
    content: msg.content, message_type: msg.message_type as Message['message_type'],
    created_at: msg.created_at, edited_at: msg.edited_at, reply_to_id: msg.reply_to_id,
    user_profile: profilesByUserId[msg.user_id]
  }));
}

export async function fetchAvailableUsersData(userId: string): Promise<UserProfile[]> {
  try {
    const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_active_users_basic');
    if (!rpcError && rpcData) return rpcData || [];
  } catch { /* RPC not available */ }

  const { data: profiles } = await supabase.from('user_profiles')
    .select('user_id, first_name, last_name, username, email, is_active, role')
    .eq('is_active', true).neq('user_id', userId);
  return profiles || [];
}
