
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Phone, Video, MoreVertical, ArrowLeft } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface DirectMessageProps {
  user: {
    id: string;
    name: string;
    email: string;
    status: 'online' | 'away' | 'busy' | 'offline';
  };
  onBack: () => void;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'file';
}

export const DirectMessage: React.FC<DirectMessageProps> = ({ user, onBack }) => {
  const { currentUser } = useUser();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: user.id,
      content: `Salut ! Comment ça va ?`,
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      type: 'text'
    },
    {
      id: '2',
      senderId: currentUser?.id || 'me',
      content: 'Ça va bien, merci ! Et toi ?',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      type: 'text'
    }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser?.id || 'me',
      content: message,
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    setMessages(prev => [...prev, newMessage]);
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

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback className="bg-purple-600 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(user.status)}`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{user.status}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isMe = msg.senderId === (currentUser?.id || 'me');
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isMe
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className={`text-xs mt-1 ${isMe ? 'text-purple-200' : 'text-gray-500'}`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <Input
            placeholder={`Message à ${user.name}...`}
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
  );
};
