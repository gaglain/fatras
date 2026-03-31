import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/lib/logger';
import { useChannels } from './messaging/useChannels';
import { useMessages } from './messaging/useMessages';
import { useMessagingRealtime } from './messaging/useMessagingRealtime';

// Re-export types for consumers
export type { Channel, ChannelMember, Message } from './messaging/types';

export const useMessaging = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const {
    channels, setChannels, availableUsers,
    fetchChannels, fetchAvailableChannels, fetchAvailableUsers,
    createChannel, createDirectMessage, deleteChannel, deleteChannelsByRoadshow,
    addChannelMembers, ensureMembership, ensureDefaultGeneralMembership,
    removeChannelMember, joinChannel, markChannelAsRead, archiveChannel,
  } = useChannels(user?.id);

  const { messages, setMessages, lastError, fetchMessages, sendMessage } = useMessages(user?.id);

  // Real-time subscriptions
  useMessagingRealtime(user?.id, setMessages, setChannels, fetchChannels);

  // Initial data load
  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    logger.log('🔄 Fetching messaging data for user:', user.id);
    fetchChannels();
    fetchAvailableUsers();
    ensureDefaultGeneralMembership();
    setLoading(false);
  }, [user?.id]);

  return {
    channels, messages, availableUsers, loading,
    fetchChannels, fetchAvailableChannels, fetchMessages,
    createChannel, createDirectMessage, sendMessage,
    deleteChannel, deleteChannelsByRoadshow,
    addChannelMembers, ensureMembership, removeChannelMember,
    joinChannel, markChannelAsRead, archiveChannel,
  };
};
