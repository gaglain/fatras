
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, X, Send, User, Hash, Plus } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { ChannelManager } from '@/components/messaging/ChannelManager';
import { DirectMessageManager } from '@/components/messaging/DirectMessageManager';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const { createNotification } = useNotifications();

  const { 
    channels, 
    messages, 
    loading,
    fetchMessages, 
    sendMessage, 
    markChannelAsRead 
  } = useMessaging();

  // Auto-select first channel when opening
  useEffect(() => {
    if (isOpen && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [isOpen, channels, selectedChannel]);

  // Fetch messages when selecting a channel
  useEffect(() => {
    if (selectedChannel && isOpen) {
      fetchMessages(selectedChannel);
      markChannelAsRead(selectedChannel);
    }
  }, [selectedChannel, isOpen, fetchMessages, markChannelAsRead]);

  // Listen for new messages and create notifications when widget is closed
  useEffect(() => {
    if (!isOpen && selectedChannel) {
      const currentMessages = messages[selectedChannel] || [];
      const lastMessage = currentMessages[currentMessages.length - 1];
      
      if (lastMessage && lastMessage.user_id !== user?.id) {
        // Create notification for new message when widget is closed
        createNotification({
          user_id: user?.id || '',
          type: 'new_message',
          title: 'Nouveau message',
          message: `Nouveau message dans #${channels.find(c => c.id === selectedChannel)?.name || 'canal'}`,
          read: false,
          data: { 
            channel_id: selectedChannel, 
            message_id: lastMessage.id,
            sender: lastMessage.user_profile?.first_name || 'Utilisateur'
          }
        });
      }
    }
  }, [messages, selectedChannel, isOpen, user?.id, createNotification, channels]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChannel) return;

    const success = await sendMessage(selectedChannel, inputValue.trim());
    if (success) {
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  const getChannelDisplayName = (channel: any) => {
    if (channel.type === 'direct') {
      return 'Message Direct';
    }
    return channel.name;
  };

  const getChannelIcon = (channel: any) => {
    switch (channel.type) {
      case 'direct':
        return <MessageSquare className="h-3 w-3" />;
      default:
        return <Hash className="h-3 w-3" />;
    }
  };

  // Count unread messages across all channels
  const totalUnreadCount = channels.reduce((total, channel) => {
    const channelMessages = messages[channel.id] || [];
    const unreadCount = channelMessages.filter(msg => 
      msg.user_id !== user?.id && !msg.metadata?.read_by?.includes(user?.id)
    ).length;
    return total + unreadCount;
  }, 0);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div 
          className="mb-4 shadow-2xl rounded-xl overflow-hidden border bg-card text-card-foreground"
          style={{ width: '420px', height: '600px' }}
        >
          <div className="p-4 border-b bg-primary text-primary-foreground">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Chat Interne</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)} 
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="flex-1 h-8 text-xs bg-background text-foreground">
                  <SelectValue placeholder="Sélectionner un canal" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground">
                  {channels.map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center">
                        {getChannelIcon(channel)}
                        <span className="ml-2">{getChannelDisplayName(channel)}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <ChannelManager onChannelCreated={(channelId) => setSelectedChannel(channelId)} />
                <DirectMessageManager
                  trigger={
                    <Button size="sm" variant="secondary" className="flex-1">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      DM
                    </Button>
                  }
                />
              </div>
            </div>
          </div>

          <ScrollArea className="h-96 p-4 bg-background">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-sm">Chargement...</p>
                </div>
              ) : currentMessages.length === 0 ? (
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
                currentMessages.map((message) => {
                  const isMe = message.user_id === user?.id;
                  const displayName = message.user_profile?.first_name || 'Utilisateur';
                  
                  return (
                    <div key={message.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex items-start space-x-2 max-w-[80%] ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                          isMe ? 'bg-primary' : 'bg-muted-foreground'
                        }`}>
                          <User className="h-3 w-3" />
                        </div>
                        <div className={`px-3 py-2 rounded-lg text-sm ${
                          isMe 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground border'
                        }`}>
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="font-medium text-xs">{isMe ? 'Moi' : displayName}</span>
                            <span className="text-xs opacity-70">
                              {new Date(message.created_at).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <div>{message.content}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${currentChannel ? getChannelDisplayName(currentChannel) : ''}...`}
                className="flex-1 text-sm bg-background text-foreground"
                disabled={!currentChannel}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || !currentChannel} 
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
