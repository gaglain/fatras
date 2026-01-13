
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, X, Send, User, Hash, Plus } from 'lucide-react';
import { useMessaging } from '@/hooks/useMessaging';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useMessagingUnreadCount } from '@/hooks/useMessagingUnreadCount';
import { ChannelManager } from '@/components/messaging/ChannelManager';
import { DirectMessageManager } from '@/components/messaging/DirectMessageManager';
import { ChannelBrowser } from '@/components/messaging/ChannelBrowser';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('');
  const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const { createNotification } = useNotifications();
  const isMobile = useIsMobile();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const messagingUnreadCount = useMessagingUnreadCount();

  const { 
    channels, 
    messages, 
    loading,
    fetchChannels,
    fetchMessages, 
    ensureMembership,
    sendMessage, 
    markChannelAsRead,
    createChannel
  } = useMessaging();

  // Auto-select first channel when opening
  useEffect(() => {
    if (isOpen && channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [isOpen, channels, selectedChannel]);

  // Auto-create a default #general channel if none exists
  useEffect(() => {
    const createDefault = async () => {
      try {
        if (isOpen && !loading && channels.length === 0) {
          const id = await createChannel('general', 'Canal par défaut', 'public', []);
          if (id) { setSelectedChannel(id); await fetchChannels(); }
        }
      } catch {
        // Channel creation failed silently
      }
    };
    createDefault();
  }, [isOpen, loading, channels.length, createChannel]);

  // Fetch messages when selecting a channel (with auto-join)
  useEffect(() => {
    if (selectedChannel && isOpen) {
      ensureMembership(selectedChannel).finally(() => {
        fetchMessages(selectedChannel);
        markChannelAsRead(selectedChannel);
      });
    }
  }, [selectedChannel, isOpen, ensureMembership, fetchMessages, markChannelAsRead]);

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  // Mark channel as read and clear notifications when widget is opened
  useEffect(() => {
    if (isOpen && selectedChannel && user?.id) {
      markChannelAsRead(selectedChannel);
      
      // Marquer les notifications de ce canal comme lues
      const markNotificationsAsRead = async () => {
        try {
          // Use data column (not metadata) and proper JSONB filter syntax
          const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('type', 'message')
            .filter('data->>channel_id', 'eq', selectedChannel);
          
          // Ignore notification update errors
        } catch {
          // Ignore notification update errors
        }
      };
      
      markNotificationsAsRead();
    }
  }, [isOpen, selectedChannel, markChannelAsRead, user?.id]);

  // Scroll automatique vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChannel) return;

    const res = await sendMessage(selectedChannel, inputValue.trim());
    if (!res) {
      toast.error("L'envoi du message a échoué. Réessayez plus tard.");
      return;
    }
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getChannelDisplayName = (channel: any) => {
    if (channel.type === 'direct') {
      const otherMember = channel.members?.find((m: any) => m.user_id !== user?.id);
      if (otherMember?.user_profile) {
        const { first_name, last_name, username, email } = otherMember.user_profile;
        const fullName = `${first_name || ''} ${last_name || ''}`.trim();
        if (fullName) return fullName;
        if (username) return username;
        if (email) return email.split('@')[0];
      }
      return 'Conversation privée';
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

  // Utiliser le compteur de notifications de messagerie
  const totalUnreadCount = messagingUnreadCount;

  return (
    <div className={cn(
      "fixed z-50",
      isMobile && isOpen 
        ? "inset-0 p-2" 
        : isMobile 
          ? "bottom-20 right-4"
          : "bottom-6 right-6"
    )}>
      {isOpen && (
        <div 
          className={cn(
            "shadow-2xl overflow-hidden border bg-card text-card-foreground flex flex-col",
            isMobile 
              ? "h-full w-full rounded-lg" 
              : "mb-4 rounded-xl"
          )}
          style={!isMobile ? { width: '420px', height: '600px' } : undefined}
        >
          <div className={cn("border-b bg-primary text-primary-foreground shrink-0", isMobile ? "p-2" : "p-4")}>
            <div className="flex items-center justify-between mb-2">
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
                Masquer
              </Button>
            </div>
            
            <div className="space-y-2">
              <Select value={selectedChannel} onValueChange={(v) => { setSelectedChannel(v); }}>
                <SelectTrigger className="w-full h-9 text-sm bg-background text-foreground">
                  <SelectValue placeholder="Sélectionner un canal" />
                </SelectTrigger>
                <SelectContent className="bg-card text-card-foreground max-h-60">
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
              
              <div className="flex gap-1 overflow-x-auto pb-1">
                <ChannelManager onChannelCreated={(channelId) => setSelectedChannel(channelId)} />
                <DirectMessageManager
                  onChannelCreated={(channelId) => setSelectedChannel(channelId)}
                  trigger={
                    <Button size="sm" variant="secondary" className="shrink-0 h-8 px-2 text-xs">
                      <MessageSquare className="h-3 w-3 mr-1" />
                      DM
                    </Button>
                  }
                />
                <ChannelBrowser
                  trigger={
                    <Button size="sm" variant="secondary" className="shrink-0 h-8 px-2 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Parcourir
                    </Button>
                  }
                  onChannelJoined={(channelId) => setSelectedChannel(channelId)}
                />
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4 bg-background">
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3 animate-pulse" />
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
                    <div 
                      key={message.id} 
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`flex items-start space-x-2 max-w-[80%] ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${
                          isMe ? 'bg-primary' : 'bg-muted-foreground'
                        }`}>
                          <User className="h-3 w-3" />
                        </div>
                        <div className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-md ${
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
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-card">
            {selectedChannel ? (
              <div className="flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Message ${currentChannel ? getChannelDisplayName(currentChannel) : 'canal'}...`}
                  className="flex-1 text-sm bg-background text-foreground"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!inputValue.trim()} 
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm text-muted-foreground">Aucun canal sélectionné. Créez #general pour commencer.</p>
                <Button
                  size="sm"
                  variant="secondary"
                    onClick={async () => {
                      const id = await createChannel('general', 'Canal par défaut', 'public', []);
                      if (id) { setSelectedChannel(id); await fetchChannels(); }
                    }}
                >
                  <Plus className="h-3 w-3 mr-1" /> Créer #general
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group bg-primary text-primary-foreground hover:bg-primary/90",
          isOpen && isMobile && "hidden"
        )}
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
        {totalUnreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
          </span>
        )}
      </button>
    </div>
  );
};
