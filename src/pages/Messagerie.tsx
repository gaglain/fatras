
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
import { ChannelCreator } from '@/components/messaging/ChannelCreator';
import { useMessaging } from '@/contexts/MessagingContext';

export const Messagerie: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [message, setMessage] = useState('');
  const [showDirectMessage, setShowDirectMessage] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showPollCreator, setShowPollCreator] = useState(false);

  const { channels, messages, addMessage, createChannel } = useMessaging();

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

  const handleCreateChannel = (name: string) => {
    const newChannelId = createChannel(name);
    setSelectedChannel(newChannelId);
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
      <div className="w-80 border-r" style={{
        background: 'var(--custom-cardBg)',
        borderColor: 'rgba(0,0,0,0.1)'
      }}>
        <div className="p-4 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
          <h2 className="font-semibold text-lg" style={{ color: 'var(--custom-buttonBg)' }}>Messagerie</h2>
          <div className="flex items-center justify-between mt-2">
            <Badge variant="secondary" className="text-xs" style={{
              background: 'var(--custom-buttonBg)',
              color: 'var(--custom-buttonText)'
            }}>
              {users.filter(u => u.status === 'online').length} en ligne
            </Badge>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowPollCreator(true)}
              style={{
                borderColor: 'var(--custom-buttonBg)',
                color: 'var(--custom-buttonBg)'
              }}
              className="hover:bg-[var(--custom-buttonBg)] hover:text-[var(--custom-buttonText)]"
            >
              <Plus className="h-3 w-3 mr-1" />
              Sondage
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2">
            {/* Channels */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--custom-buttonBg)' }}>
                  Channels
                </h3>
                <ChannelCreator onCreateChannel={handleCreateChannel} />
              </div>
              {channels.filter(c => c.type === 'channel').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                    selectedChannel === channel.id 
                      ? 'bg-[var(--custom-buttonBg)] text-[var(--custom-buttonText)]' 
                      : 'hover:bg-[rgba(var(--custom-buttonBg),0.1)]'
                  }`}
                >
                  <div className="flex items-center">
                    <Hash className="h-4 w-4 mr-2" style={{ 
                      color: selectedChannel === channel.id ? 'var(--custom-buttonText)' : 'var(--custom-buttonBg)' 
                    }} />
                    <span className="text-sm" style={{ 
                      color: selectedChannel === channel.id ? 'var(--custom-buttonText)' : 'var(--custom-cardText)' 
                    }}>
                      {channel.name}
                    </span>
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
              <h3 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--custom-buttonBg)' }}>
                Messages privés
              </h3>
              {channels.filter(c => c.type === 'dm').map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                    selectedChannel === channel.id 
                      ? 'bg-[var(--custom-buttonBg)] text-[var(--custom-buttonText)]' 
                      : 'hover:bg-[rgba(var(--custom-buttonBg),0.1)]'
                  }`}
                >
                  <div className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" style={{ 
                      color: selectedChannel === channel.id ? 'var(--custom-buttonText)' : 'var(--custom-buttonBg)' 
                    }} />
                    <span className="text-sm" style={{ 
                      color: selectedChannel === channel.id ? 'var(--custom-buttonText)' : 'var(--custom-cardText)' 
                    }}>
                      {channel.name}
                    </span>
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
              <h3 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--custom-buttonBg)' }}>
                <Users className="h-3 w-3 inline mr-1" />
                Équipe ({users.length})
              </h3>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => openDirectMessage(user)}
                  className="w-full flex items-center p-2 rounded-md text-left hover:bg-[rgba(var(--custom-buttonBg),0.1)] transition-colors"
                >
                  <div className="relative mr-3">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src="" alt={user.name} />
                      <AvatarFallback className="text-xs" style={{
                        background: 'var(--custom-buttonBg)',
                        color: 'var(--custom-buttonText)'
                      }}>
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 ${getStatusColor(user.status)}`} style={{
                      borderColor: 'var(--custom-cardBg)'
                    }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--custom-cardText)' }}>
                      {user.name}
                    </p>
                    <p className="text-xs capitalize opacity-70" style={{ color: 'var(--custom-cardText)' }}>
                      {user.status}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col" style={{ background: 'var(--custom-background)' }}>
        {/* Header */}
        <div className="p-4 border-b" style={{
          background: 'var(--custom-cardBg)',
          borderColor: 'rgba(0,0,0,0.1)'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentChannel?.type === 'channel' ? (
                <Hash className="h-5 w-5 mr-2" style={{ color: 'var(--custom-buttonBg)' }} />
              ) : (
                <MessageSquare className="h-5 w-5 mr-2" style={{ color: 'var(--custom-buttonBg)' }} />
              )}
              <h1 className="text-xl font-semibold" style={{ color: 'var(--custom-cardText)' }}>
                {currentChannel?.name}
              </h1>
            </div>
            {currentChannel?.type === 'dm' && (
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  style={{
                    borderColor: 'var(--custom-buttonBg)',
                    color: 'var(--custom-buttonBg)'
                  }}
                  className="hover:bg-[var(--custom-buttonBg)] hover:text-[var(--custom-buttonText)]"
                >
                  <Phone className="h-4 w-4 mr-1" />
                  Appel
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  style={{
                    borderColor: 'var(--custom-buttonBg)',
                    color: 'var(--custom-buttonBg)'
                  }}
                  className="hover:bg-[var(--custom-buttonBg)] hover:text-[var(--custom-buttonText)]"
                >
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
                  className="max-w-[75%] rounded-lg p-3"
                  style={{
                    background: msg.isMe
                      ? 'var(--custom-buttonBg)'
                      : 'var(--custom-cardBg)',
                    color: msg.isMe
                      ? 'var(--custom-buttonText)'
                      : 'var(--custom-cardText)',
                    border: msg.isMe ? 'none' : '1px solid rgba(0,0,0,0.1)'
                  }}
                >
                  {!msg.isMe && (
                    <div className="text-xs font-medium mb-1 opacity-70">{msg.sender}</div>
                  )}
                  <div className="text-sm">{msg.message}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t" style={{
          background: 'var(--custom-cardBg)',
          borderColor: 'rgba(0,0,0,0.1)'
        }}>
          <div className="flex space-x-2">
            <Input
              placeholder={`Message ${currentChannel?.type === 'channel' ? '#' + currentChannel.name : currentChannel?.name}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              className="flex-1"
              style={{
                borderColor: 'var(--custom-buttonBg)',
                background: 'var(--custom-background)',
                color: 'var(--custom-text)'
              }}
            />
            <Button 
              onClick={sendMessage} 
              disabled={!message.trim()}
              style={{
                background: 'var(--custom-buttonBg)',
                color: 'var(--custom-buttonText)'
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
