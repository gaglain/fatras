
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, MessageSquare, Users, Plus } from 'lucide-react';
import { useSimpleMessaging } from '@/hooks/useSimpleMessaging';

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  
  const { channels, messages, addMessage, createChannel, markChannelAsRead } = useSimpleMessaging();

  // Marquer le canal comme lu lorsqu'on le sélectionne
  useEffect(() => {
    if (selectedChannel) {
      markChannelAsRead(selectedChannel);
    }
  }, [selectedChannel, markChannelAsRead]);

  const sendMessage = () => {
    if (!message.trim()) return;

    addMessage(selectedChannel, {
      senderId: 'me',
      sender: 'Moi',
      message: message.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      channel: selectedChannel
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
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
      <div className="w-full lg:w-80 border-r lg:border-b-0 border-b bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <h2 className="font-semibold text-lg text-card-foreground">
              Messagerie Interne
            </h2>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleCreateChannel}
              className="w-full sm:w-auto"
            >
              <Plus className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">Canal</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            <div className="mb-4">
              <h3 className="text-xs font-medium px-2 py-1 uppercase text-primary">
                Canaux
              </h3>
              {channels.filter(c => c.type === 'channel').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                    selectedChannel === channel.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'hover:bg-accent text-card-foreground'
                  }`}
                >
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                      {channel.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center">
            <Hash className="h-5 w-5 mr-2 text-primary" />
            <h1 className="text-xl font-semibold text-card-foreground">
              {currentChannel?.name || 'Sélectionnez un canal'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
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
                    className={`max-w-[75%] rounded-lg p-3 ${
                      msg.isMe
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card text-card-foreground border border-border'
                    }`}
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
        <div className="p-2 sm:p-4 border-t border-border bg-card">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <Input
              placeholder={`Message ${currentChannel ? '#' + currentChannel.name : ''}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              className="w-full sm:w-auto"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Envoyer</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
