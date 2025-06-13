
import React, { createContext, useContext, ReactNode } from 'react';
import { useMessagingChannels, Channel, Message } from '@/hooks/useMessagingChannels';

interface MessagingContextType {
  channels: Channel[];
  messages: Record<string, Message[]>;
  addMessage: (channelId: string, message: Omit<Message, 'id'>) => void;
  createChannel: (name: string) => string;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const MessagingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const messagingData = useMessagingChannels();

  return (
    <MessagingContext.Provider value={messagingData}>
      {children}
    </MessagingContext.Provider>
  );
};

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (context === undefined) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};
