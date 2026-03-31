import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Channel, ChannelMember, MessagingUserProfile } from './types';

interface MemberRow {
  id: string;
  channel_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at?: string;
}

export const useChannels = (userId: string | undefined) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [availableUsers, setAvailableUsers] = useState<MessagingUserProfile[]>([]);

  const fetchChannels = async () => {
    if (!userId) return;

    try {
      const [memberResult, publicResult] = await Promise.all([
        supabase.from('messaging_channel_members').select('channel_id').eq('user_id', userId),
        supabase.from('messaging_channels').select('id').eq('type', 'public').eq('is_active', true),
      ]);

      if (memberResult.error) throw memberResult.error;
      if (publicResult.error) throw publicResult.error;

      const allChannelIds = [
        ...new Set([
          ...(memberResult.data || []).map((r) => r.channel_id),
          ...(publicResult.data || []).map((c) => c.id),
        ]),
      ];

      if (allChannelIds.length === 0) { setChannels([]); return; }

      const [channelResult, membersResult] = await Promise.all([
        supabase.from('messaging_channels')
          .select('id, name, description, type, user_id, roadshow_id, created_at, updated_at, is_active')
          .in('id', allChannelIds).eq('is_active', true).order('updated_at', { ascending: false }),
        supabase.from('messaging_channel_members')
          .select('id, channel_id, user_id, role, joined_at, last_read_at')
          .in('channel_id', allChannelIds),
      ]);

      if (channelResult.error) throw channelResult.error;
      if (membersResult.error) throw membersResult.error;

      const allMembers = membersResult.data || [];
      const allUserIds = [...new Set(allMembers.map((m: MemberRow) => m.user_id))];

      const profilesByUserId: Record<string, MessagingUserProfile> = {};
      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, email, avatar_url')
          .in('user_id', allUserIds);
        (profiles || []).forEach((p) => { profilesByUserId[p.user_id] = p; });
      }

      const membersByChannel: Record<string, (MemberRow & { user_profile?: MessagingUserProfile })[]> = {};
      allMembers.forEach((m: MemberRow) => {
        (membersByChannel[m.channel_id] ||= []).push({ ...m, user_profile: profilesByUserId[m.user_id] });
      });

      setChannels(
        (channelResult.data || []).map((ch) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          type: ch.type as Channel['type'],
          user_id: ch.user_id,
          roadshow_id: ch.roadshow_id,
          created_at: ch.created_at,
          updated_at: ch.updated_at,
          is_active: ch.is_active,
          members: (membersByChannel[ch.id] || []).map((m: any) => ({
            id: m.id, channel_id: ch.id, user_id: m.user_id,
            role: m.role as ChannelMember['role'],
            joined_at: m.joined_at, last_read_at: m.last_read_at,
            user_profile: m.user_profile,
          })),
        }))
      );
    } catch (error) {
      logger.error('Error fetching channels:', error);
    }
  };

  const fetchAvailableChannels = async () => {
    if (!userId) return [];
    try {
      const { data: publicChannels, error } = await supabase
        .from('messaging_channels').select('*').eq('type', 'public').eq('is_active', true).order('name');
      if (error) throw error;

      const ids = (publicChannels || []).map((c) => c.id);
      const membershipById: Record<string, boolean> = {};
      if (ids.length > 0) {
        const { data: myMemberships } = await supabase
          .from('messaging_channel_members').select('channel_id').eq('user_id', userId).in('channel_id', ids);
        (myMemberships || []).forEach((m) => { membershipById[m.channel_id] = true; });
      }
      return (publicChannels || []).map((ch) => ({ ...ch, is_member: !!membershipById[ch.id], member_count: undefined }));
    } catch (error) {
      logger.error('Error fetching available channels:', error);
      return [];
    }
  };

  const fetchAvailableUsers = async () => {
    if (!userId) { setAvailableUsers([]); return; }
    try {
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_active_users_basic');
      if (!rpcError && rpcData) { setAvailableUsers(rpcData || []); return; }
      logger.warn('RPC get_active_users_basic not available, using fallback', rpcError);
      const { data: profiles, error } = await supabase
        .from('user_profiles').select('user_id, first_name, last_name, username, email, is_active, role')
        .eq('is_active', true).neq('user_id', userId);
      if (error) throw error;
      setAvailableUsers(profiles || []);
    } catch (error) {
      logger.error('Error fetching available users:', error);
      setAvailableUsers([]);
    }
  };

  const createChannel = async (name: string, description = '', type: 'public' | 'private' = 'public', memberIds: string[] = [], roadshowId?: string) => {
    if (!userId) return null;
    try {
      const { data, error } = await supabase.rpc('create_messaging_channel', {
        channel_name: name, channel_description: description, channel_type: type,
        member_user_ids: memberIds, roadshow_ref_id: roadshowId,
      });
      if (!error && data) { await fetchChannels(); return data as string; }

      logger.warn('RPC create_messaging_channel not available, falling back', error);
      const { data: channelRow, error: insertErr } = await supabase
        .from('messaging_channels').insert({ name, description, type, user_id: userId, roadshow_id: roadshowId, is_active: true })
        .select('id').single();
      if (insertErr || !channelRow) throw insertErr;

      const baseMembers = [userId, ...memberIds.filter((id) => id !== userId)];
      for (const uid of baseMembers) {
        await supabase.from('messaging_channel_members')
          .insert({ channel_id: channelRow.id, user_id: uid, role: uid === userId ? 'admin' : 'member' })
          .then(({ error }) => { if (error && error.code !== '23505') logger.warn('Member insert warning:', error); });
      }
      await fetchChannels();
      return channelRow.id as string;
    } catch (error) {
      logger.error('Error creating channel:', error);
      return null;
    }
  };

  const createDirectMessage = async (otherUserId: string) => {
    if (!userId) return null;
    try {
      const { data: channelId, error } = await supabase.rpc('create_direct_message_channel', { other_user_id: otherUserId });
      if (!error && channelId) { setTimeout(() => fetchChannels(), 100); return channelId as string; }
      logger.warn('RPC create_direct_message_channel not available, falling back', error);
      const { data: row, error: insertErr } = await supabase
        .from('messaging_channels').insert({ name: `DM-${userId}-${otherUserId}`, type: 'direct', user_id: userId, is_active: true })
        .select('id').single();
      if (insertErr || !row) throw insertErr;
      await supabase.from('messaging_channel_members').insert({ channel_id: row.id, user_id: userId, role: 'admin' });
      await supabase.from('messaging_channel_members').insert({ channel_id: row.id, user_id: otherUserId, role: 'member' });
      setTimeout(() => fetchChannels(), 100);
      return row.id as string;
    } catch (error) {
      logger.error('Error creating DM:', error);
      return null;
    }
  };

  const deleteChannel = async (channelId: string) => {
    if (!userId) return false;
    try {
      const { data: updatedData, error: ownerError } = await supabase
        .from('messaging_channels').update({ is_active: false }).eq('id', channelId).eq('user_id', userId).select('id');
      if (!ownerError && updatedData && updatedData.length > 0) { await fetchChannels(); toast.success('Canal supprimé'); return true; }
      const { data: memberData } = await supabase
        .from('messaging_channel_members').select('role').eq('channel_id', channelId).eq('user_id', userId).single();
      if (memberData?.role === 'admin') {
        const { error } = await supabase.from('messaging_channels').update({ is_active: false }).eq('id', channelId);
        if (error) throw error;
        await fetchChannels(); toast.success('Canal supprimé'); return true;
      }
      toast.error("Vous n'avez pas les droits pour supprimer ce canal"); return false;
    } catch (error: unknown) {
      logger.error('Error deleting channel:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Impossible de supprimer'}`);
      return false;
    }
  };

  const deleteChannelsByRoadshow = async (roadshowId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('messaging_channels').update({ is_active: false }).eq('roadshow_id', roadshowId).eq('user_id', userId);
      if (error) throw error;
      await fetchChannels(); return true;
    } catch (error) { logger.error('Error deleting roadshow channels:', error); return false; }
  };

  const addChannelMembers = async (channelId: string, userIds: string[]) => {
    if (!userId) return false;
    try {
      for (const uid of userIds) {
        const { error } = await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: uid, role: 'member' });
        if (error && error.code !== '23505' && !error.message?.includes('duplicate')) logger.warn('Error adding member:', error);
      }
      await fetchChannels(); return true;
    } catch (error) { logger.error('Error adding members:', error); return false; }
  };

  const ensureMembership = async (channelId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { data: existing } = await supabase.from('messaging_channel_members')
        .select('id').eq('channel_id', channelId).eq('user_id', userId).maybeSingle();
      if (existing) return true;
      const { error } = await supabase.from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: userId, role: 'member' });
      if (error) { if (error.code === '23505' || error.message?.includes('duplicate')) return true; return false; }
      return true;
    } catch (e) { logger.error('ensureMembership error:', e); return false; }
  };

  const ensureDefaultGeneralMembership = async () => {
    if (!userId) return;
    try {
      const { data: generals } = await supabase.from('messaging_channels')
        .select('id, created_at').eq('type', 'public').eq('is_active', true)
        .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général')
        .order('created_at', { ascending: true });
      let channelId: string | undefined = generals?.[0]?.id;
      if (!channelId) {
        const { data: newId, error: rpcErr } = await (supabase as any).rpc('create_messaging_channel', {
          channel_name: 'Général', channel_description: 'Canal par défaut', channel_type: 'public',
          member_user_ids: [], roadshow_ref_id: null,
        });
        if (!rpcErr && newId) channelId = newId as string;
        else {
          const { data: againList } = await supabase.from('messaging_channels')
            .select('id, created_at').eq('type', 'public').eq('is_active', true)
            .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général')
            .order('created_at', { ascending: true });
          channelId = againList?.[0]?.id;
        }
      }
      if (!channelId) return;
      const { data: existing } = await supabase.from('messaging_channel_members')
        .select('id').eq('channel_id', channelId).eq('user_id', userId).maybeSingle();
      if (!existing) {
        await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: userId, role: 'member' });
      }
      try {
        const { data: others } = await supabase.from('messaging_channels').select('id')
          .eq('type', 'public').eq('is_active', true)
          .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général').neq('id', channelId);
        const otherIds = (others || []).map((c: { id: string }) => c.id);
        if (otherIds.length > 0) await supabase.from('messaging_channel_members').delete().in('channel_id', otherIds).eq('user_id', userId);
      } catch {}
      await fetchChannels();
    } catch (e) { logger.warn('ensureDefaultGeneralMembership error:', e); }
  };

  const removeChannelMember = async (channelId: string, memberId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('messaging_channel_members').delete().eq('channel_id', channelId).eq('user_id', memberId);
      if (error) throw error;
      await fetchChannels(); return true;
    } catch (error) { logger.error('Error removing member:', error); return false; }
  };

  const joinChannel = async (channelId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: userId, role: 'member' });
      if (error && error.code !== '23505' && !error.message?.includes('duplicate')) throw error;
      await fetchChannels(); return true;
    } catch (error) { logger.error('Error joining channel:', error); return false; }
  };

  const markChannelAsRead = async (channelId: string) => {
    if (!userId) return;
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase.from('messaging_channel_members')
        .update({ last_read_at: nowIso }).eq('channel_id', channelId).eq('user_id', userId);
      if (error) throw error;
      setChannels(prev => prev.map(ch => {
        if (ch.id !== channelId) return ch;
        return { ...ch, members: (ch.members || []).map(m => m.user_id === userId ? { ...m, last_read_at: nowIso } : m) };
      }));
    } catch (error) { logger.error('Error marking channel as read:', error); }
  };

  const archiveChannel = async (channelId: string) => {
    if (!userId) return false;
    try {
      const { error } = await supabase.from('messaging_channels').update({ is_active: false }).eq('id', channelId);
      if (error) throw error;
      await fetchChannels(); toast.success('Canal archivé'); return true;
    } catch (error) { logger.error('Error archiving channel:', error); toast.error("Erreur lors de l'archivage du canal"); return false; }
  };

  return {
    channels, setChannels, availableUsers,
    fetchChannels, fetchAvailableChannels, fetchAvailableUsers,
    createChannel, createDirectMessage, deleteChannel, deleteChannelsByRoadshow,
    addChannelMembers, ensureMembership, ensureDefaultGeneralMembership,
    removeChannelMember, joinChannel, markChannelAsRead, archiveChannel,
  };
};
