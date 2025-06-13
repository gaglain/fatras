
import { useState } from 'react';

export interface Channel {
  id: string;
  name: string;
  type: 'channel' | 'dm';
  unread: number;
}

export interface Message {
  id: string;
  senderId: string;
  sender: string;
  message: string;
  time: string;
  isMe: boolean;
}

export const useMessagingChannels = () => {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 'general', name: 'Général', type: 'channel', unread: 3 },
    { id: 'booking', name: 'Booking', type: 'channel', unread: 1 },
    { id: 'production', name: 'Production', type: 'channel', unread: 0 },
    { id: 'tech', name: 'Technique', type: 'channel', unread: 2 },
    { id: 'marie-martin', name: 'Marie Martin', type: 'dm', unread: 1 },
    { id: 'jean-dupont', name: 'Jean Dupont', type: 'dm', unread: 0 }
  ]);

  const [messages, setMessages] = useState<Record<string, Message[]>>({
    general: [
      {
        id: '1',
        senderId: 'marie-martin',
        sender: 'Marie Martin',
        message: 'Salut ! As-tu les détails pour le contrat de demain ?',
        time: '14:30',
        isMe: false
      },
      {
        id: '2',
        senderId: 'me',
        sender: 'Moi',
        message: 'Oui, je viens de l\'envoyer par email.',
        time: '14:32',
        isMe: true
      }
    ],
    booking: [
      {
        id: '1',
        senderId: 'jean-dupont',
        sender: 'Jean Dupont',
        message: 'Nouveau contrat signé pour la tournée d\'été !',
        time: '15:15',
        isMe: false
      }
    ],
    production: [],
    tech: [
      {
        id: '1',
        senderId: 'sophie-tech',
        sender: 'Sophie Tech',
        message: 'Le matériel son est prêt pour ce soir',
        time: '16:00',
        isMe: false
      }
    ],
    'marie-martin': [
      {
        id: '1',
        senderId: 'marie-martin',
        sender: 'Marie Martin',
        message: 'Peux-tu me rappeler demain ?',
        time: '17:30',
        isMe: false
      }
    ],
    'jean-dupont': []
  });

  const addMessage = (channelId: string, message: Omit<Message, 'id'>) => {
    const newMessage = {
      ...message,
      id: Date.now().toString(),
    };
    
    setMessages(prev => ({
      ...prev,
      [channelId]: [...(prev[channelId] || []), newMessage]
    }));
  };

  const createChannel = (name: string) => {
    const channelId = name.toLowerCase().replace(/\s+/g, '-');
    const newChannel: Channel = {
      id: channelId,
      name,
      type: 'channel',
      unread: 0
    };

    setChannels(prev => [...prev, newChannel]);
    setMessages(prev => ({
      ...prev,
      [channelId]: []
    }));

    return channelId;
  };

  return {
    channels,
    messages,
    addMessage,
    createChannel
  };
};
