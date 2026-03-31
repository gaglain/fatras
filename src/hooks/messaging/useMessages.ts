import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Message, MessagingUserProfile } from './types';

export const useMessages = (userId: string | undefined) => {
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchMessages = async (channelId: string) => {
    if (!userId) return;
    try {
      const { data: msgRows, error } = await supabase
        .from('messaging_messages')
        .select('id, channel_id, user_id, content, message_type, created_at, edited_at, reply_to_id')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;

      const orderedMsgs = (msgRows || []).reverse();
      const userIds = [...new Set(orderedMsgs.map((m: any) => m.user_id))];

      const profilesByUserId: Record<string, MessagingUserProfile> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, avatar_url')
          .in('user_id', userIds);
        (profiles || []).forEach((p) => { profilesByUserId[p.user_id] = p; });
      }

      setMessages(prev => ({
        ...prev,
        [channelId]: orderedMsgs.map((msg) => ({
          id: msg.id, channel_id: msg.channel_id, user_id: msg.user_id,
          content: msg.content, message_type: msg.message_type as Message['message_type'],
          created_at: msg.created_at, edited_at: msg.edited_at, reply_to_id: msg.reply_to_id,
          metadata: undefined, user_profile: profilesByUserId[msg.user_id],
        })),
      }));
    } catch (error) {
      logger.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async (channelId: string, content: string) => {
    if (!userId) {
      setLastError('Utilisateur non connecté');
      toast.error('Vous devez être connecté pour envoyer un message');
      return null;
    }
    setLastError(null);
    try {
      try {
        await supabase.from('messaging_channel_members').insert({ channel_id: channelId, user_id: userId, role: 'member' });
      } catch {}

      const { data, error } = await supabase
        .from('messaging_messages')
        .insert({ channel_id: channelId, user_id: userId, content, message_type: 'text' })
        .select('*').single();

      if (error) {
        const errorMsg = error.message || 'Erreur inconnue';
        setLastError(errorMsg);
        toast.error(`Erreur: ${errorMsg}`);
        return null;
      }

      const transformedMessage: Message = {
        id: data.id, channel_id: data.channel_id, user_id: data.user_id,
        content: data.content, message_type: data.message_type as Message['message_type'],
        created_at: data.created_at, edited_at: data.edited_at,
        reply_to_id: data.reply_to_id, metadata: data.metadata,
      };

      setMessages(prev => ({
        ...prev,
        [channelId]: [...(prev[channelId] || []), transformedMessage],
      }));

      void supabase.from('messaging_channels').update({ updated_at: new Date().toISOString() }).eq('id', channelId);
      return transformedMessage;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur réseau';
      setLastError(errorMsg);
      toast.error(`Échec de l'envoi: ${errorMsg}`);
      return null;
    }
  };

  return { messages, setMessages, lastError, fetchMessages, sendMessage };
};
