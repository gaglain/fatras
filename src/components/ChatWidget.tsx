
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, X, Users, Phone, Video, Minimize2, Maximize2 } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
    },
    {
      id: 3,
      sender: 'Jean Dupont',
      message: 'L\'équipe technique est prête pour ce soir. Tout est OK côté son.',
      time: '15:15',
      isMe: false
    }
  ]);

  const [activeUsers] = useState([
    { id: 1, name: 'Marie Martin', status: 'online' },
    { id: 2, name: 'Jean Dupont', status: 'away' },
    { id: 3, name: 'Paul Leroy', status: 'online' },
    { id: 4, name: 'Sophie Durand', status: 'busy' }
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

  const onlineUsersCount = activeUsers.filter(u => u.status === 'online').length;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Button - Always visible */}
      <Button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setIsMinimized(false);
        }}
        className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110"
      >
        <MessageCircle className="h-6 w-6 text-primary-foreground" />
        {onlineUsersCount > 0 && (
          <Badge className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-green-500 text-white text-xs p-0 flex items-center justify-center animate-pulse">
            {onlineUsersCount}
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
                <Users className="h-4 w-4 mr-2" />
                Messagerie Interne
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
              {/* Active Users */}
              <div className="p-3 border-b bg-muted/50">
                <div className="flex flex-wrap gap-2">
                  {activeUsers.slice(0, 4).map((user) => (
                    <div key={user.id} className="flex items-center space-x-1 text-xs bg-background rounded-full px-2 py-1">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(user.status)}`} />
                      <span className="text-muted-foreground">{user.name.split(' ')[0]}</span>
                    </div>
                  ))}
                  {activeUsers.length > 4 && (
                    <div className="text-xs text-muted-foreground bg-background rounded-full px-2 py-1">
                      +{activeUsers.length - 4} autres
                    </div>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-3">
                  {messages.map((msg) => (
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
                    placeholder="Tapez votre message..."
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
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};
