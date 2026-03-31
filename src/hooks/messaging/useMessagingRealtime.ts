import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { Message, Channel } from './types';

const playNotificationSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.frequency.value = 800; osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
  } catch (error) { logger.warn('Could not play notification sound:', error); }
};

export const useMessagingRealtime = (
  userId: string | undefined,
  setMessages: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>,
  fetchChannels: () => Promise<void>
) => {
  useEffect(() => {
    if (!userId) return;

    const uniqueSuffix = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
      ? (crypto as any).randomUUID() : Math.random().toString(36).slice(2);
    const channelName = `messaging-realtime-${userId}-${Date.now()}-${uniqueSuffix}`;

    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_messages' }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => {
          const existing = prev[newMessage.channel_id] || [];
          if (existing.some(m => m.id === newMessage.id)) return prev;
          return { ...prev, [newMessage.channel_id]: [...existing, newMessage] };
        });
        if (newMessage.user_id !== userId) {
          toast.info('Nouveau message', { description: newMessage.content?.slice(0, 120) || 'Nouveau message' });
          playNotificationSound();
        }
        setChannels(prev => prev.map(ch =>
          ch.id === newMessage.channel_id ? { ...ch, updated_at: newMessage.created_at } : ch
        ));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_channels' }, () => { fetchChannels(); })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messaging_channel_members', filter: `user_id=eq.${userId}` }, () => { fetchChannels(); });

    try { channel.subscribe((status) => { logger.log('📡 Messaging subscription status:', status); }); }
    catch (err) { logger.error('❌ Messaging realtime subscribe error:', err); }

    return () => {
      setTimeout(() => { try { supabase.removeChannel(channel); } catch (err) { logger.warn('⚠️ Warning during messaging cleanup:', err); } }, 100);
    };
  }, [userId]);
};
