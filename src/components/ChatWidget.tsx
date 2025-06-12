
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, X, Users, Phone, Video } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Marie Martin',
      message: 'Salut ! As-tu les détails pour le contrat de demain ?',
      time: '14:30',
      isMe: false
    },
    {
      id: 2,
      sender: 'Moi',
      message: 'Oui, je viens de l\'envoyer par email.',
      time: '14:32',
      isMe: true
    }
  ]);

  const [activeUsers] = useState([
    { id: 1, name: 'Marie Martin', status: 'online' },
    { id: 2, name: 'Jean Dupont', status: 'away' },
    { id: 3, name: 'Paul Leroy', status: 'online' }
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'Moi',
      message: message.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    };
    
    setMessages(prev => [...prev, newMessage]);
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

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-40 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6 text-white" />
        {activeUsers.filter(u => u.status === 'online').length > 0 && (
          <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-green-500 text-white text-xs p-0 flex items-center justify-center">
            {activeUsers.filter(u => u.status === 'online').length}
          </Badge>
        )}
      </Button>

      {/* Chat Popup */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Messagerie Interne
              </CardTitle>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Phone className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Video className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setIsOpen(false)}>
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Active Users */}
            <div className="flex flex-wrap gap-2 mt-2">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-1 text-xs">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                  <span className="text-muted-foreground">{user.name}</span>
                </div>
              ))}
            </div>
          </CardHeader>
          
          <CardContent className="flex flex-col h-full p-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-2 ${
                      msg.isMe
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {!msg.isMe && (
                      <div className="text-xs font-medium mb-1">{msg.sender}</div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                    <div className="text-xs opacity-70 mt-1">{msg.time}</div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Message Input */}
            <div className="border-t p-3">
              <div className="flex space-x-2">
                <Input
                  placeholder="Tapez votre message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
