import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, X, Users, Phone, Video, Minimize2, Maximize2, Hash, MessageSquare, Plus } from 'lucide-react';
import { useMessagingChannels } from '@/hooks/useMessagingChannels';
import { ChannelCreator } from '@/components/messaging/ChannelCreator';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  const { channels, messages, addMessage, createChannel } = useMessagingChannels();

  const [activeUsers] = useState([
    { id: 1, name: 'Marie Martin', status: 'online' },
    { id: 2, name: 'Jean Dupont', status: 'away' },
    { id: 3, name: 'Paul Leroy', status: 'online' },
    { id: 4, name: 'Sophie Durand', status: 'busy' }
  ]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const handleCreateChannel = (name: string) => {
    const newChannelId = createChannel(name);
    setSelectedChannel(newChannelId);
  };

  const onlineUsersCount = activeUsers.filter(u => u.status === 'online').length;
  const totalUnread = channels.reduce((sum, channel) => sum + channel.unread, 0);
  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setIsMinimized(false);
        }}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500 text-white text-xs p-0 flex items-center justify-center animate-pulse">
            {totalUnread}
          </Badge>
        )}
      </Button>

      {/* Chat Popup */}
      {isOpen && (
        <Card className={`absolute bottom-20 right-0 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`}>
          <CardHeader className="pb-3 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                {currentChannel?.type === 'channel' ? <Hash className="h-4 w-4 mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                {currentChannel?.name || 'Messagerie'}
                <Badge variant="secondary" className="ml-2 text-xs bg-primary-foreground/20 text-primary-foreground">
                  {onlineUsersCount} en ligne
                </Badge>
              </CardTitle>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20" 
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="flex flex-col h-full p-0">
              {/* Channel/Topic Selection */}
              <div className="p-3 border-b bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1">CHANNELS</div>
                      {channels.filter(c => c.type === 'channel').map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              {channel.name}
                            </div>
                            {channel.unread > 0 && (
                              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                                {channel.unread}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      <div className="text-xs font-medium text-muted-foreground px-2 py-1 mt-2">MESSAGES PRIVÉS</div>
                      {channels.filter(c => c.type === 'dm').map((channel) => (
                        <SelectItem key={channel.id} value={channel.id}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {channel.name}
                            </div>
                            {channel.unread > 0 && (
                              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                                {channel.unread}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="ml-2">
                    <ChannelCreator onCreateChannel={handleCreateChannel} />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {currentMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-lg p-3 ${
                          msg.isMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-foreground'
                        }`}
                      >
                        {!msg.isMe && (
                          <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>
                        )}
                        <div className="text-sm">{msg.message}</div>
                        <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message Input */}
              <div className="border-t p-3 bg-background">
                <div className="flex space-x-2">
                  <Input
                    placeholder={`Message ${currentChannel?.type === 'channel' ? '#' + currentChannel.name : currentChannel?.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="sm" 
                    className="bg-primary hover:bg-primary/90"
                    disabled={!message.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                {currentChannel?.type === 'dm' && (
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-3 w-3 mr-1" />
                      Appel
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Video className="h-3 w-3 mr-1" />
                      Vidéo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
