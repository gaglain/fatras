
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Hash, MessageSquare, Users, Plus, Lock, Trash2 } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { ChannelManager } from '@/components/messaging/ChannelManager';
import { DirectMessageManager } from '@/components/messaging/DirectMessageManager';

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [message, setMessage] = useState('');
  
  const { 
    channels, 
    messages, 
    loading,
    fetchMessages, 
    sendMessage, 
    markChannelAsRead,
    deleteChannel 
  } = useMessaging();

  // Auto-select first channel if none selected
  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  // Fetch messages and mark as read when selecting a channel
  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel);
      markChannelAsRead(selectedChannel);
    }
  }, [selectedChannel, fetchMessages, markChannelAsRead]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChannel) return;

    const success = await sendMessage(selectedChannel, message.trim());
    if (success) {
      setMessage('');
    }
  };

  const handleChannelCreated = (channelId: string) => {
    setSelectedChannel(channelId);
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce canal ?')) {
      const success = await deleteChannel(channelId);
      if (success && selectedChannel === channelId) {
        setSelectedChannel(channels.length > 1 ? channels[0].id : '');
      }
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  const getChannelDisplayName = (channel: any) => {
    if (channel.type === 'direct') {
      // For DM channels, show the other user's name
      return channel.name.replace(/^DM-.*?-.*?$/, 'Message Direct');
    }
    return channel.name;
  };

  const getChannelIcon = (channel: any) => {
    switch (channel.type) {
      case 'private':
        return <Lock className="h-4 w-4" />;
      case 'direct':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
      {/* Sidebar */}
        <div className="w-full lg:w-80 border-r lg:border-b-0 border-b bg-card">
        <div className="p-4 border-b border-border">
          <div className="flex flex-col gap-2">
            <h2 className="font-semibold text-lg text-card-foreground">
              Messagerie Interne
            </h2>
            <div className="flex gap-2">
              <ChannelManager onChannelCreated={handleChannelCreated} />
              <DirectMessageManager />
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {loading ? (
              <div className="text-center py-4 text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <>
                {/* Public and Private Channels */}
                {channels.filter(c => c.type !== 'direct').length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-medium px-2 py-1 uppercase text-primary">
                      Canaux
                    </h3>
                    {channels.filter(c => c.type !== 'direct').map((channel) => (
                      <div key={channel.id} className="group flex items-center">
                        <button
                          onClick={() => setSelectedChannel(channel.id)}
                          className={`flex-1 flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                            selectedChannel === channel.id 
                              ? 'bg-primary text-primary-foreground' 
                              : 'hover:bg-accent text-card-foreground'
                          }`}
                        >
                          <div className="flex items-center">
                            {getChannelIcon(channel)}
                            <span className="text-sm ml-2">{getChannelDisplayName(channel)}</span>
                          </div>
                          {channel.unread_count && channel.unread_count > 0 && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                              {channel.unread_count}
                            </span>
                          )}
                        </button>
                        {channel.user_id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteChannel(channel.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 ml-1"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Direct Messages */}
                {channels.filter(c => c.type === 'direct').length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-medium px-2 py-1 uppercase text-primary">
                      Messages Directs
                    </h3>
                    {channels.filter(c => c.type === 'direct').map((channel) => (
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
                          {getChannelIcon(channel)}
                          <span className="text-sm ml-2">{getChannelDisplayName(channel)}</span>
                        </div>
                        {channel.unread_count && channel.unread_count > 0 && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-destructive text-destructive-foreground">
                            {channel.unread_count}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-background">
        {/* Header */}
        <div className="p-4 border-b border-border bg-card">
          <div className="flex items-center">
            {currentChannel && getChannelIcon(currentChannel)}
            <h1 className="text-xl font-semibold text-card-foreground ml-2">
              {currentChannel ? getChannelDisplayName(currentChannel) : 'Sélectionnez un canal'}
            </h1>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {currentMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                <p className="text-sm">
                  {currentChannel 
                    ? `Commencez une conversation dans ${currentChannel.type === 'direct' ? 'ce message direct' : '#' + getChannelDisplayName(currentChannel)}`
                    : 'Sélectionnez un canal pour commencer'
                  }
                </p>
              </div>
            ) : (
              currentMessages.map((msg) => {
                // We'll need to get the current user from auth context
                const isMe = false; // TODO: Compare with current user ID from auth
                const displayName = 'Utilisateur';
                
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card text-card-foreground border border-border'
                      }`}
                    >
                      {!isMe && (
                        <div className="text-xs font-medium mb-1 opacity-70">{displayName}</div>
                      )}
                      <div className="text-sm">{msg.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        {currentChannel && (
          <div className="p-2 sm:p-4 border-t border-border bg-card">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                placeholder={`Message ${getChannelDisplayName(currentChannel)}...`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!message.trim()}
                className="w-full sm:w-auto"
              >
                <Send className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Envoyer</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
