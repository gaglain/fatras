
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, MessageSquare, Users, Plus } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');

  const { channels, messages, addMessage, createChannel } = useMessaging();

  const sendMessage = () => {
    if (!message.trim()) return;

    addMessage(selectedChannel, {
      senderId: 'me',
      sender: 'Moi',
      message: message.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    });
    setMessage('');
  };

  const handleCreateChannel = () => {
    const channelName = prompt('Nom du nouveau canal :');
    if (channelName) {
      const newChannelId = createChannel(channelName);
      setSelectedChannel(newChannelId);
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r" style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        borderColor: 'var(--notification-border, #e5e7eb)'
      }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-lg" style={{ color: 'var(--app-card-text, #18181b)' }}>
              Messagerie Interne
            </h2>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCreateChannel}
              style={{
                borderColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-bg, #1632f4)'
              }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Canal
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--app-button-bg, #1632f4)' }}>
                Canaux
              </h3>
              {channels.filter(c => c.type === 'channel').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                    selectedChannel === channel.id 
                      ? 'text-white' 
                      : ''
                  }`}
                  style={{
                    backgroundColor: selectedChannel === channel.id ? 'var(--app-button-bg, #1632f4)' : 'transparent',
                    color: selectedChannel === channel.id ? 'var(--app-button-text, #ffffff)' : 'var(--app-card-text, #18181b)'
                  }}
                >
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--app-background, #ffffff)' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          borderColor: 'var(--notification-border, #e5e7eb)'
        }}>
          <div className="flex items-center">
            <Hash className="h-5 w-5 mr-2" style={{ color: 'var(--app-button-bg, #1632f4)' }} />
            <h1 className="text-xl font-semibold" style={{ color: 'var(--app-card-text, #18181b)' }}>
              {currentChannel?.name || 'Sélectionnez un canal'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--app-text, #666666)' }}>
                <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                <p className="text-sm">Commencez une conversation dans #{currentChannel?.name}</p>
              </div>
            ) : (
              currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[75%] rounded-lg p-3"
                    style={{
                      backgroundColor: msg.isMe
                        ? 'var(--app-button-bg, #1632f4)'
                        : 'var(--app-card-bg, #ffffff)',
                      color: msg.isMe
                        ? 'var(--app-button-text, #ffffff)'
                        : 'var(--app-card-text, #18181b)',
                      border: msg.isMe ? 'none' : '1px solid var(--notification-border, #e5e7eb)'
                    }}
                  >
                    {!msg.isMe && (
                      <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs mt-1 opacity-70">{msg.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t" style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          borderColor: 'var(--notification-border, #e5e7eb)'
        }}>
          <div className="flex space-x-2">
            <Input
              placeholder={`Message ${currentChannel ? '#' + currentChannel.name : ''}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
              style={{
                borderColor: 'var(--notification-border, #e5e7eb)',
                backgroundColor: 'var(--app-background, #ffffff)',
                color: 'var(--app-text, #18181b)'
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
