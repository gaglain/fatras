import { useState, useEffect } from 'react';
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
  metadata?: unknown;
  user_profile?: {
    first_name?: string;
    last_name?: string;
    username?: string;
    avatar_url?: string;
  };
}

export const useMessaging = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<string | null>(null);

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

  // Fetch user channels (joined channels + all public channels)
  const fetchChannels = async () => {
    if (!user) return;

    try {
      // 1) Récupérer les IDs des canaux dont l'utilisateur est membre
      const { data: memberRows, error: memberErr } = await supabase
        .from('messaging_channel_members')
        .select('channel_id')
        .eq('user_id', user.id);

      if (memberErr) throw memberErr;
      const memberChannelIds = (memberRows || []).map((r: { channel_id: string }) => r.channel_id);

      // 2) Récupérer aussi TOUS les canaux publics actifs
      const { data: publicChannels, error: publicErr } = await supabase
        .from('messaging_channels')
        .select('id')
        .eq('type', 'public')
        .eq('is_active', true);

      if (publicErr) throw publicErr;
      const publicChannelIds = (publicChannels || []).map((c: { id: string }) => c.id);

      // 3) Fusionner les IDs (membres + publics) sans doublons
      const allChannelIds = [...new Set([...memberChannelIds, ...publicChannelIds])];

      if (allChannelIds.length === 0) {
        setChannels([]);
        return;
      }

      // 4) Charger les canaux
      const { data: channelRows, error: channelsErr } = await supabase
        .from('messaging_channels')
        .select('*')
        .in('id', allChannelIds)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (channelsErr) throw channelsErr;

      // 5) Charger tous les membres de ces canaux
      const { data: allMembers, error: membersErr } = await supabase
        .from('messaging_channel_members')
        .select('id, channel_id, user_id, role, joined_at, last_read_at')
        .in('channel_id', allChannelIds);

      if (membersErr) throw membersErr;

      // 4) Récupérer les profils utilisateurs pour tous les membres
      interface MemberRow { id: string; channel_id: string; user_id: string; role: string; joined_at: string; last_read_at?: string }
      const allUserIds = [...new Set((allMembers || []).map((m: MemberRow) => m.user_id))];
      const { data: profiles, error: profilesErr } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, username, email')
        .in('user_id', allUserIds);

      if (profilesErr) logger.warn('Error fetching profiles:', profilesErr);

      const profilesByUserId: Record<string, UserProfile> = {};
      (profiles || []).forEach((p) => {
        profilesByUserId[p.user_id] = p;
      });

      // 5) Transformer
      interface MemberWithProfile extends MemberRow { user_profile?: UserProfile }
      const membersByChannel: Record<string, MemberWithProfile[]> = {};
      (allMembers || []).forEach((m: MemberRow) => {
        (membersByChannel[m.channel_id] ||= []).push({
          ...m,
          user_profile: profilesByUserId[m.user_id]
        });
      });

      const transformedChannels: Channel[] = (channelRows || []).map((ch) => ({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        type: ch.type as 'public' | 'private' | 'direct',
        user_id: ch.user_id,
        roadshow_id: ch.roadshow_id,
        created_at: ch.created_at,
        updated_at: ch.updated_at,
        is_active: ch.is_active,
        members: (membersByChannel[ch.id] || []).map((member: any) => ({
          id: member.id,
          channel_id: ch.id,
          user_id: member.user_id,
          role: member.role as 'admin' | 'member',
          joined_at: member.joined_at,
          last_read_at: member.last_read_at,
          user_profile: member.user_profile
        })),
      }));

      setChannels(transformedChannels);
    } catch (error) {
      logger.error('Error fetching channels:', error);
    }
  };

  // Fetch all available public channels (Slack-style discovery)
  const fetchAvailableChannels = async () => {
    if (!user) return [];

    try {
      const { data: publicChannels, error: pubErr } = await supabase
        .from('messaging_channels')
        .select('*')
        .eq('type', 'public')
        .eq('is_active', true)
        .order('name');

      if (pubErr) throw pubErr;

      const ids = (publicChannels || []).map((c) => c.id);
      const membershipById: Record<string, boolean> = {};

      if (ids.length > 0) {
        const { data: myMemberships } = await supabase
          .from('messaging_channel_members')
          .select('channel_id')
          .eq('user_id', user.id)
          .in('channel_id', ids);
        (myMemberships || []).forEach((m) => { membershipById[m.channel_id] = true; });
      }

      return (publicChannels || []).map((ch) => ({
        ...ch,
        is_member: !!membershipById[ch.id],
        member_count: undefined
      }));
    } catch (error) {
      logger.error('Error fetching available channels:', error);
      return [];
    }
  };

  // Fetch messages for a channel
  const fetchMessages = async (channelId: string) => {
    if (!user) return;

    try {
      const { data: msgRows, error: msgErr } = await supabase
        .from('messaging_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (msgErr) throw msgErr;

      // Récupérer les profils des auteurs
      const userIds = [...new Set((msgRows || []).map((m: any) => m.user_id))];
      const { data: profiles, error: profilesErr } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesErr) logger.warn('Error fetching message author profiles:', profilesErr);

      const profilesByUserId: Record<string, UserProfile> = {};
      (profiles || []).forEach((p) => {
        profilesByUserId[p.user_id] = p;
      });

      // Transform data to match our Message interface
      const transformedMessages: Message[] = (msgRows || []).map(msg => ({
        id: msg.id,
        channel_id: msg.channel_id,
        user_id: msg.user_id,
        content: msg.content,
        message_type: msg.message_type as 'text' | 'image' | 'file' | 'system',
        created_at: msg.created_at,
        edited_at: msg.edited_at,
        reply_to_id: msg.reply_to_id,
        metadata: msg.metadata,
        user_profile: profilesByUserId[msg.user_id]
      }));

      setMessages(prev => ({
        ...prev,
        [channelId]: transformedMessages
      }));
    } catch (error) {
      logger.error('Error fetching messages:', error);
    }
  };

  // Fetch available users for adding to channels
  const fetchAvailableUsers = async () => {
    if (!user) {
      setAvailableUsers([]);
      return;
    }

    try {
      // Try RPC first
      const { data: rpcData, error: rpcError } = await (supabase as any).rpc('get_active_users_basic');
      if (!rpcError && rpcData) {
        setAvailableUsers(rpcData || []);
        return;
      }

      // Fallback: fetch from user_profiles directly
      logger.warn('RPC get_active_users_basic not available, using fallback', rpcError);
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('user_id, first_name, last_name, username, email, is_active, role')
        .eq('is_active', true)
        .neq('user_id', user.id);

      if (profilesError) throw profilesError;
      setAvailableUsers(profiles || []);
    } catch (error) {
      logger.error('Error fetching available users:', error);
      setAvailableUsers([]);
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
      logger.warn('RPC create_messaging_channel not available, falling back to manual insert', error);

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
        // Insert members - ignore duplicate errors
        for (const payload of membersPayload) {
          await supabase
            .from('messaging_channel_members')
            .insert(payload)
            .then(({ error }) => {
              if (error && error.code !== '23505') logger.warn('Member insert warning:', error);
            });
        }
      }

      await fetchChannels();
      return channelRow.id as string;
    } catch (error) {
      logger.error('Error creating channel (RPC + fallback failed):', error);
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
      logger.warn('RPC create_direct_message_channel not available, falling back to manual insert', rpcErr);

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

      // Insert DM members - ignore duplicate errors
      await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelRow.id, user_id: user.id, role: 'admin' });
      await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelRow.id, user_id: otherUserId, role: 'member' });

      setTimeout(() => { fetchChannels(); }, 100);
      return channelRow.id as string;
    } catch (error) {
      logger.error('Error creating DM (RPC + fallback failed):', error);
      return null;
    }
  };

  // Send a message (auto-join channel if not a member)
  const sendMessage = async (channelId: string, content: string) => {
    if (!user) {
      setLastError('Utilisateur non connecté');
      toast.error('Vous devez être connecté pour envoyer un message');
      return null;
    }

    setLastError(null);

    try {
      // First, ensure membership (ignore duplicate errors - member might already exist)
      try {
        await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      } catch {
        // Ignore membership errors
      }

      // Now send the message
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

      if (error) {
        const errorMsg = error.message || 'Erreur inconnue';
        setLastError(errorMsg);
        toast.error(`Erreur: ${errorMsg}`);
        logger.error('Error sending message:', error);
        return null;
      }

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

      // Best-effort: update channel ordering (fire and forget)
      void supabase
        .from('messaging_channels')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', channelId);

      return transformedMessage;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur réseau';
      setLastError(errorMsg);
      toast.error(`Échec de l'envoi: ${errorMsg}`);
      logger.error('Error sending message:', error);
      return null;
    }
  };

  // Delete a channel (owner or admin member can delete)
  const deleteChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      // First try as owner
      const { data: updatedData, error: ownerError } = await supabase
        .from('messaging_channels')
        .update({ is_active: false })
        .eq('id', channelId)
        .eq('user_id', user.id)
        .select('id');

      if (!ownerError && updatedData && updatedData.length > 0) {
        await fetchChannels();
        toast.success('Canal supprimé');
        return true;
      }

      // If not owner, check if admin member
      const { data: memberData } = await supabase
        .from('messaging_channel_members')
        .select('role')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .single();

      if (memberData?.role === 'admin') {
        const { error } = await supabase
          .from('messaging_channels')
          .update({ is_active: false })
          .eq('id', channelId);

        if (error) throw error;
        await fetchChannels();
        toast.success('Canal supprimé');
        return true;
      }

      toast.error('Vous n\'avez pas les droits pour supprimer ce canal');
      return false;
    } catch (error: unknown) {
      logger.error('Error deleting channel:', error);
      toast.error(`Erreur: ${error instanceof Error ? error.message : 'Impossible de supprimer'}`);
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
      logger.error('Error deleting roadshow channels:', error);
      return false;
    }
  };

  // Add members to channel
  const addChannelMembers = async (channelId: string, userIds: string[]) => {
    if (!user) return false;

    try {
      // Insert members one by one to handle duplicates gracefully
      for (const userId of userIds) {
        const { error } = await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelId, user_id: userId, role: 'member' });
        
        // Ignore duplicate key errors
        if (error && error.code !== '23505' && !error.message?.includes('duplicate')) {
          logger.warn('Error adding member:', error);
        }
      }

      await fetchChannels();
      return true;
    } catch (error) {
      logger.error('Error adding members:', error);
      return false;
    }
  };

  // Ensure current user is a member of the channel (join-on-view)
  const ensureMembership = async (channelId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      // First check if already a member
      const { data: existing, error: checkErr } = await supabase
        .from('messaging_channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (checkErr) {
        logger.warn('ensureMembership check warning:', checkErr);
      }
      
      if (existing) return true;
      
      // Try to insert - ignore duplicate key errors (23505)
      const { error: insertErr } = await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      
      if (insertErr) {
        // Duplicate key = already a member = success
        if (insertErr.code === '23505' || insertErr.message?.includes('duplicate')) {
          return true;
        }
        logger.warn('ensureMembership insert warning:', insertErr);
        return false;
      }
      return true;
    } catch (e) {
      logger.error('ensureMembership error:', e);
      return false;
    }
  };

  // Ensure user is in #general (default public channel)
  const ensureDefaultGeneralMembership = async () => {
    if (!user) return;
    try {
      // Prefer oldest active public channel named "general" or "général" (case-sensitive variants included)
      const { data: generals } = await supabase
        .from('messaging_channels')
        .select('id, created_at')
        .eq('type', 'public')
        .eq('is_active', true)
        .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général')
        .order('created_at', { ascending: true });

      let channelId: string | undefined = generals?.[0]?.id;

      // Create it if missing (use a friendly French label by default)
      if (!channelId) {
        const { data: newId, error: rpcErr } = await (supabase as any).rpc('create_messaging_channel', {
          channel_name: 'Général',
          channel_description: 'Canal par défaut',
          channel_type: 'public',
          member_user_ids: [],
          roadshow_ref_id: null,
        });
        if (!rpcErr && newId) {
          channelId = newId as string;
        } else {
          // Re-check in case it was created concurrently
          const { data: againList } = await supabase
            .from('messaging_channels')
            .select('id, created_at')
            .eq('type', 'public')
            .eq('is_active', true)
            .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général')
            .order('created_at', { ascending: true });
          channelId = againList?.[0]?.id;
        }
      }

      if (!channelId) return;

      // Ensure current user is a member
      const { data: existing } = await supabase
        .from('messaging_channel_members')
        .select('id')
        .eq('channel_id', channelId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        // Ignore duplicate errors
        await supabase
          .from('messaging_channel_members')
          .insert({ channel_id: channelId, user_id: user.id, role: 'member' });
      }

      // Optional cleanup: leave other "general" duplicates for this user
      try {
        const { data: others } = await supabase
          .from('messaging_channels')
          .select('id')
          .eq('type', 'public')
          .eq('is_active', true)
          .or('name.eq.general,name.eq.General,name.eq.général,name.eq.Général')
          .neq('id', channelId);
        const otherIds = (others || []).map((c: { id: string }) => c.id);
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

      // Refresh channels list to include the default if it was just created
      await fetchChannels();
    } catch (e) {
      logger.warn('ensureDefaultGeneralMembership error:', e);
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
      logger.error('Error removing member:', error);
      return false;
    }
  };

  // Mark channel as read
  const markChannelAsRead = async (channelId: string) => {
    if (!user) return;

    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from('messaging_channel_members')
        .update({ last_read_at: nowIso })
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state immediately so badges drop without needing a refetch
      setChannels(prev => prev.map(ch => {
        if (ch.id !== channelId) return ch;
        const updatedMembers = (ch.members || []).map(m =>
          m.user_id === user.id ? { ...m, last_read_at: nowIso } : m
        );
        return { ...ch, members: updatedMembers } as Channel;
      }));
    } catch (error) {
      logger.error('Error marking channel as read:', error);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    logger.log('🔄 Fetching messaging data for user:', user.id);
    fetchChannels();
    fetchAvailableUsers();
    ensureDefaultGeneralMembership();
    setLoading(false);
  }, [user?.id]);

  // Fixed real-time subscriptions with proper cleanup
  useEffect(() => {
    if (!user?.id) return;

    logger.log('📡 Setting up real-time subscription for messaging');
    
    // Audio notification helper
    const playNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (error) {
        logger.warn('Could not play notification sound:', error);
      }
    };
    
    // Keep existing channels; avoid removing other components' subscriptions

    // Create a truly unique channel name to avoid conflicts across multiple mounts
    const uniqueSuffix = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID()
      : Math.random().toString(36).slice(2);
    const channelName = `messaging-realtime-${user.id}-${Date.now()}-${uniqueSuffix}`;
    
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
          const newMessage = payload.new as Message;

          // De-dupe by message id and append
          setMessages(prev => {
            const existing = prev[newMessage.channel_id] || [];
            if (existing.some(m => m.id === newMessage.id)) return prev;
            return {
              ...prev,
              [newMessage.channel_id]: [...existing, newMessage]
            };
          });

          // Notify only for messages from others with sound
          if (newMessage.user_id !== user!.id) {
            const preview = newMessage.content?.slice(0, 120) || 'Nouveau message';
            toast.info('Nouveau message', { description: preview });
            playNotificationSound();
          }

          // Update channel ordering timestamp locally
          setChannels(prev => prev.map(ch =>
            ch.id === newMessage.channel_id
              ? { ...ch, updated_at: newMessage.created_at }
              : ch
          ));
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
          logger.log('📢 New channel created:', payload.new);
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
          logger.log('👤 You were added to a channel, refreshing channels');
          fetchChannels();
        }
      );

    try {
      channel.subscribe((status) => {
        logger.log('📡 Messaging subscription status:', status);
      });
    } catch (err) {
      logger.error('❌ Messaging realtime subscribe error:', err);
    }

    return () => {
      logger.log('🧹 Cleaning up messaging subscription');
      setTimeout(() => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          logger.warn('⚠️ Warning during messaging cleanup:', err);
        }
      }, 100);
    };
  }, [user?.id]);

  // Join a public channel (Slack-style)
  const joinChannel = async (channelId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('messaging_channel_members')
        .insert({ channel_id: channelId, user_id: user.id, role: 'member' });

      // Duplicate key = already a member = success
      if (error && error.code !== '23505' && !error.message?.includes('duplicate')) {
        throw error;
      }

      await fetchChannels();
      return true;
    } catch (error) {
      logger.error('Error joining channel:', error);
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