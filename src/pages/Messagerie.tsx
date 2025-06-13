
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Hash, MessageSquare, Users, Phone, Video, Plus } from 'lucide-react';
import { DirectMessage } from '@/components/messaging/DirectMessage';
import { PollCreator } from '@/components/messaging/PollCreator';
import { useMessagingChannels } from '@/hooks/useMessagingChannels';

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);

  const { channels, messages, addMessage } = useMessagingChannels();

  const [users] = useState([
    { id: 'marie-martin', name: 'Marie Martin', email: 'marie@example.com', status: 'online' },
    { id: 'jean-dupont', name: 'Jean Dupont', email: 'jean@example.com', status: 'away' },
    { id: 'paul-leroy', name: 'Paul Leroy', email: 'paul@example.com', status: 'online' },
    { id: 'sophie-tech', name: 'Sophie Tech', email: 'sophie@example.com', status: 'busy' }
  ]);

  const currentChannel = channels.find(c => c.id === selectedChannel);
  const currentMessages = messages[selectedChannel] || [];

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
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const openDirectMessage = (user: any) => {
    setSelectedUser(user);
    setShowDirectMessage(true);
  };

  if (showDirectMessage && selectedUser) {
    return (
      <DirectMessage
        user={selectedUser}
        onBack={() => setShowDirectMessage(false)}
      />
    );
  }

  if (showPollCreator) {
    return (
      <PollCreator onBack={() => setShowPollCreator(false)} />
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-80 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg">Messagerie</h2>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs">
              {users.filter(u => u.status === 'online').length} en ligne
            </Badge>
            <Button size="sm" variant="outline" onClick={() => setShowPollCreator(true)}>
              <Plus className="h-3 w-3 mr-1" />
              Sondage
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Channels */}
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">Channels</h3>
              {channels.filter(c => c.type === 'channel').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent ${
                    selectedChannel === channel.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Direct Messages */}
            <div className="mb-4">
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">Messages privés</h3>
              {channels.filter(c => c.type === 'dm').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left hover:bg-accent ${
                    selectedChannel === channel.id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm">{channel.name}</span>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="h-5 w-5 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                      {channel.unread}
                    </Badge>
                  )}
                </button>
              ))}
            </div>

            {/* Users List */}
            <div>
              <h3 className="text-xs font-medium text-muted-foreground px-2 py-1 uppercase">
                <Users className="h-3 w-3 inline mr-1" />
                Équipe ({users.length})
              </h3>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => openDirectMessage(user)}
                  className="w-full flex items-center p-2 rounded-md text-left hover:bg-accent"
                >
                  <div className="relative mr-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.status}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentChannel?.type === 'channel' ? (
                <Hash className="h-5 w-5 mr-2 text-muted-foreground" />
              ) : (
                <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
              )}
              <h1 className="text-xl font-semibold">{currentChannel?.name}</h1>
            </div>
            {currentChannel?.type === 'dm' && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Phone className="h-4 w-4 mr-1" />
                  Appel
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4 mr-1" />
                  Vidéo
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
                  <div className={`text-xs mt-1 ${msg.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-background">
          <div className="flex space-x-2">
            <Input
              placeholder={`Message ${currentChannel?.type === 'channel' ? '#' + currentChannel.name : currentChannel?.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
