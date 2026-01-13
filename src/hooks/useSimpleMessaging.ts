import { useState, useEffect } from 'react';

export interface Channel {
  id: string;
  name: string;
  type: 'channel';
  unread: number;
}

export interface Message {
  id: string;
  senderId: string;
  sender: string;
  message: string;
  time: string;
  isMe: boolean;
  channel: string;
}

// État global partagé (simple singleton)
class SimpleMessagingStore {
  private channels: Channel[] = [
    { id: 'general', name: 'general', type: 'channel', unread: 0 },
    { id: 'dev', name: 'dev', type: 'channel', unread: 0 },
    { id: 'marketing', name: 'marketing', type: 'channel', unread: 0 }
  ];

  private messages: Record<string, Message[]> = {
    general: [
      {
        id: '1',
        senderId: 'bot',
        sender: 'System',
        message: 'Bienvenue dans le canal général !',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        isMe: false,
        channel: 'general'
      }
    ],
    dev: [],
    marketing: []
  };

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  getChannels(): Channel[] {
    return [...this.channels];
  }

  getMessages(channelId: string): Message[] {
    return [...(this.messages[channelId] || [])];
  }

  getAllMessages(): Record<string, Message[]> {
    return { ...this.messages };
  }

  addMessage(channelId: string, message: Omit<Message, 'id'>) {
    const messageWithId: Message = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };

    if (!this.messages[channelId]) {
      this.messages[channelId] = [];
    }

    this.messages[channelId].push(messageWithId);
    
    // Marquer comme non lu si ce n'est pas notre message
    if (!message.isMe) {
      const channel = this.channels.find(c => c.id === channelId);
      if (channel) {
        channel.unread += 1;
      }
      
      // Play notification sound for new messages
      this.playNotificationSound();
    }

    this.notify();
    return messageWithId;
  }

  private playNotificationSound() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioContext = new AudioContextClass();
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
    } catch {
      // Notification sound unavailable - silent fail
    }
  }

  markChannelAsRead(channelId: string) {
    const channel = this.channels.find(c => c.id === channelId);
    if (channel) {
      channel.unread = 0;
      this.notify();
    }
  }

  createChannel(name: string): string {
    const newChannel: Channel = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      type: 'channel',
      unread: 0
    };

    this.channels.push(newChannel);
    this.messages[newChannel.id] = [];
    this.notify();
    
    return newChannel.id;
  }
}

// Instance globale partagée
const messagingStore = new SimpleMessagingStore();

export const useSimpleMessaging = () => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = messagingStore.subscribe(() => {
      forceUpdate({});
    });

    return unsubscribe;
  }, []);

  return {
    channels: messagingStore.getChannels(),
    messages: messagingStore.getAllMessages(),
    addMessage: (channelId: string, message: Omit<Message, 'id'>) => 
      messagingStore.addMessage(channelId, message),
    getMessages: (channelId: string) => 
      messagingStore.getMessages(channelId),
    markChannelAsRead: (channelId: string) => 
      messagingStore.markChannelAsRead(channelId),
    createChannel: (name: string) => 
      messagingStore.createChannel(name)
  };
};