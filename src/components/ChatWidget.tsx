
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, X, Send, User, Bot, Hash, Users } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { channels } = useMessaging();

  const [users] = useState([
    { id: 'marie-martin', name: 'Marie Martin', email: 'marie@example.com', status: 'online' },
    { id: 'jean-dupont', name: 'Jean Dupont', email: 'jean@example.com', status: 'away' },
    { id: 'paul-leroy', name: 'Paul Leroy', email: 'paul@example.com', status: 'online' },
    { id: 'sophie-tech', name: 'Sophie Tech', email: 'sophie@example.com', status: 'busy' }
  ]);

  const currentChannel = channels.find(c => c.id === selectedChannel);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Merci pour votre message ! Notre équipe vous répondra bientôt.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <div className="flex h-96 mb-4 shadow-lg rounded-xl overflow-hidden" style={{
          background: 'var(--custom-background)',
          border: '1px solid rgba(0,0,0,0.1)',
          width: '640px'
        }}>
          {/* Sidebar */}
          <div className="w-64 border-r" style={{
            background: 'var(--custom-cardBg)',
            borderColor: 'rgba(0,0,0,0.1)'
          }}>
            <div className="p-3 border-b" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--custom-buttonBg)' }}>
                Messagerie
              </h3>
              <Badge variant="secondary" className="text-xs mt-1" style={{
                background: 'var(--custom-buttonBg)',
                color: 'var(--custom-buttonText)'
              }}>
                {users.filter(u => u.status === 'online').length} en ligne
              </Badge>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2">
                {/* Channels */}
                <div className="mb-3">
                  <h4 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--custom-buttonBg)' }}>
                    Topics
                  </h4>
                  {channels.filter(c => c.type === 'channel').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full flex items-center justify-between p-2 rounded-md text-left transition-colors ${
                        selectedChannel === channel.id 
                          ? 'text-white' 
                          : 'hover:bg-opacity-10'
                      }`}
                      style={{
                        background: selectedChannel === channel.id ? 'var(--custom-buttonBg)' : 'transparent',
                        color: selectedChannel === channel.id ? 'var(--custom-buttonText)' : 'var(--custom-cardText)'
                      }}
                    >
                      <div className="flex items-center">
                        <Hash className="h-3 w-3 mr-2" />
                        <span className="text-xs">{channel.name}</span>
                      </div>
                      {channel.unread > 0 && (
                        <Badge className="h-4 w-4 p-0 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
                          {channel.unread}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>

                {/* Users List */}
                <div>
                  <h4 className="text-xs font-medium px-2 py-1 uppercase" style={{ color: 'var(--custom-buttonBg)' }}>
                    <Users className="h-3 w-3 inline mr-1" />
                    Équipe ({users.length})
                  </h4>
                  {users.map((user) => (
                    <button
                      key={user.id}
                      className="w-full flex items-center p-2 rounded-md text-left transition-colors"
                      style={{
                        color: 'var(--custom-cardText)'
                      }}
                    >
                      <div className="relative mr-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src="" alt={user.name} />
                          <AvatarFallback className="text-xs" style={{
                            background: 'var(--custom-buttonBg)',
                            color: 'var(--custom-buttonText)'
                          }}>
                            {user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border ${getStatusColor(user.status)}`} style={{
                          borderColor: 'var(--custom-cardBg)'
                        }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: 'var(--custom-cardText)' }}>
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

          {/* Chat Area */}
          <div className="flex-1 flex flex-col" style={{ background: 'var(--custom-background)' }}>
            {/* Header */}
            <div className="p-3 border-b flex items-center justify-between" style={{
              background: 'var(--custom-cardBg)',
              borderColor: 'rgba(0,0,0,0.1)'
            }}>
              <div className="flex items-center">
                {currentChannel?.type === 'channel' ? (
                  <Hash className="h-4 w-4 mr-2" style={{ color: 'var(--custom-buttonBg)' }} />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" style={{ color: 'var(--custom-buttonBg)' }} />
                )}
                <h3 className="text-sm font-semibold" style={{ color: 'var(--custom-cardText)' }}>
                  {currentChannel?.name || 'Support'}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                style={{
                  color: 'var(--custom-cardText)'
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-2">
                {messages.length === 0 ? (
                  <div className="text-center py-8 opacity-50">
                    <MessageSquare className="h-6 w-6 mx-auto mb-2" />
                    <p className="text-xs">Commencez une conversation</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                          message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{
                          background: message.sender === 'user' 
                            ? 'var(--custom-buttonBg)' 
                            : 'var(--custom-background)',
                          color: message.sender === 'user' 
                            ? 'var(--custom-buttonText)' 
                            : 'var(--custom-text)'
                        }}>
                          {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                        </div>
                        <div
                          className="px-2 py-1 rounded-lg text-xs"
                          style={{
                            background: message.sender === 'user'
                              ? 'var(--custom-buttonBg)'
                              : 'var(--custom-cardBg)',
                            color: message.sender === 'user'
                              ? 'var(--custom-buttonText)'
                              : 'var(--custom-cardText)',
                            border: message.sender === 'user' 
                              ? 'none' 
                              : '1px solid rgba(0,0,0,0.1)'
                          }}
                        >
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-3 border-t" style={{
              borderColor: 'rgba(0,0,0,0.1)'
            }}>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-2 py-1 text-xs border rounded-md"
                  style={{
                    background: 'var(--custom-background)',
                    color: 'var(--custom-text)',
                    border: '1px solid var(--custom-buttonBg)'
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim()}
                  size="sm"
                  className="rounded-full w-8 h-8 p-0"
                  style={{
                    background: '#ec5f65',
                    color: '#ffffff'
                  }}
                >
                  <Send className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Widget button - ROND et ROSE OBLIGATOIRE */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full shadow-lg hover:scale-105 transition-all duration-200"
        style={{
          background: '#ec5f65 !important',
          color: '#ffffff !important',
          border: 'none !important',
          borderRadius: '50% !important',
          width: '56px !important',
          height: '56px !important',
          minWidth: '56px !important',
          minHeight: '56px !important',
          padding: '0 !important'
        }}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};
