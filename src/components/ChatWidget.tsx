
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageCircle, Send, X, Users, Phone, Video, Minimize2, Maximize2, Hash, MessageSquare, Plus } from 'lucide-react';
import { useMessaging } from '@/contexts/MessagingContext';
import { ChannelCreator } from '@/components/messaging/ChannelCreator';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedChannel, setSelectedChannel] = useState('general');

  const { channels, messages, addMessage, createChannel } = useMessaging();

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
        className="h-14 w-14 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          borderRadius: '50%',
          backgroundColor: 'var(--custom-chatWidgetBg, #ec5f65)',
          color: 'var(--custom-chatWidgetIcon, #ffffff)',
          border: 'none'
        }}
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 text-white text-xs p-0 flex items-center justify-center animate-pulse" style={{
            borderRadius: '50%',
            border: 'none'
          }}>
            {totalUnread}
          </Badge>
        )}
      </Button>

      {/* Chat Popup */}
      {isOpen && (
        <Card className={`absolute bottom-20 right-0 shadow-2xl transition-all duration-300 ${
          isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
        }`} style={{
          background: 'var(--custom-cardBg, #ffffff)',
          borderRadius: '0',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <CardHeader className="pb-3 border-b" style={{
            background: 'var(--custom-chatWidgetBg, #ec5f65)',
            borderRadius: '0',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center" style={{
                color: 'var(--custom-chatWidgetIcon, #ffffff)'
              }}>
                {currentChannel?.type === 'channel' ? (
                  <Hash className="h-4 w-4 mr-2" />
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                {currentChannel?.name || 'Messagerie'}
                <Badge variant="secondary" className="ml-2 text-xs" style={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'var(--custom-chatWidgetIcon, #ffffff)',
                  border: 'none',
                  borderRadius: '0'
                }}>
                  {onlineUsersCount} en ligne
                </Badge>
              </CardTitle>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  onClick={() => setIsMinimized(!isMinimized)}
                  style={{
                    color: 'var(--custom-chatWidgetIcon, #ffffff)',
                    borderRadius: '0',
                    border: 'none'
                  }}
                >
                  {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 hover:bg-white/20" 
                  onClick={() => setIsOpen(false)}
                  style={{
                    color: 'var(--custom-chatWidgetIcon, #ffffff)',
                    borderRadius: '0',
                    border: 'none'
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          
          {!isMinimized && (
            <CardContent className="flex flex-col h-full p-0" style={{
              background: 'var(--custom-cardBg, #ffffff)'
            }}>
              {/* Channel/Topic Selection */}
              <div className="p-3 border-b" style={{
                background: 'var(--custom-background, #f5f5f5)',
                borderBottom: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div className="flex items-center justify-between mb-2">
                  <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                    <SelectTrigger className="flex-1" style={{
                      background: 'var(--custom-cardBg, #ffffff)',
                      color: 'var(--custom-cardText, #18181b)',
                      borderRadius: '0',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{
                      background: 'var(--custom-cardBg, #ffffff)',
                      border: '1px solid rgba(0,0,0,0.1)',
                      borderRadius: '0'
                    }}>
                      <div className="text-xs font-medium px-2 py-1" style={{
                        color: 'var(--custom-text, #666666)'
                      }}>CHANNELS</div>
                      {channels.filter(c => c.type === 'channel').map((channel) => (
                        <SelectItem key={channel.id} value={channel.id} style={{
                          color: 'var(--custom-cardText, #18181b)'
                        }}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              {channel.name}
                            </div>
                            {channel.unread > 0 && (
                              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-red-500 text-white flex items-center justify-center" style={{
                                borderRadius: '50%',
                                border: 'none'
                              }}>
                                {channel.unread}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                      <div className="text-xs font-medium px-2 py-1 mt-2" style={{
                        color: 'var(--custom-text, #666666)'
                      }}>MESSAGES PRIVÉS</div>
                      {channels.filter(c => c.type === 'dm').map((channel) => (
                        <SelectItem key={channel.id} value={channel.id} style={{
                          color: 'var(--custom-cardText, #18181b)'
                        }}>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {channel.name}
                            </div>
                            {channel.unread > 0 && (
                              <Badge className="ml-2 h-4 w-4 p-0 text-xs bg-red-500 text-white flex items-center justify-center" style={{
                                borderRadius: '50%',
                                border: 'none'
                              }}>
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
                        className="max-w-[75%] p-3"
                        style={{
                          borderRadius: '0',
                          background: msg.isMe 
                            ? 'var(--custom-chatWidgetBg, #ec5f65)' 
                            : 'var(--custom-background, #f5f5f5)',
                          color: msg.isMe 
                            ? 'var(--custom-chatWidgetIcon, #ffffff)' 
                            : 'var(--custom-text, #18181b)'
                        }}
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
              <div className="border-t p-3" style={{
                background: 'var(--custom-cardBg, #ffffff)',
                borderTop: '1px solid rgba(0,0,0,0.1)'
              }}>
                <div className="flex space-x-2">
                  <Input
                    placeholder={`Message ${currentChannel?.type === 'channel' ? '#' + currentChannel.name : currentChannel?.name}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="flex-1"
                    style={{
                      background: 'var(--custom-background, #f5f5f5)',
                      color: 'var(--custom-text, #18181b)',
                      borderRadius: '0',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}
                  />
                  <Button 
                    onClick={sendMessage} 
                    size="sm" 
                    disabled={!message.trim()}
                    className="hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--custom-chatWidgetBg, #ec5f65)',
                      color: 'var(--custom-chatWidgetIcon, #ffffff)',
                      borderRadius: '0',
                      border: 'none'
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Quick Actions */}
                {currentChannel?.type === 'dm' && (
                  <div className="flex space-x-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1" style={{
                      color: 'var(--custom-buttonBg, #1632f4)',
                      borderColor: 'var(--custom-buttonBg, #1632f4)',
                      borderRadius: '0',
                      background: 'transparent'
                    }}>
                      <Phone className="h-3 w-3 mr-1" />
                      Appel
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1" style={{
                      color: 'var(--custom-buttonBg, #1632f4)',
                      borderColor: 'var(--custom-buttonBg, #1632f4)',
                      borderRadius: '0',
                      background: 'transparent'
                    }}>
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
