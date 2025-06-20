
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { channels } = useMessaging();

  const [teams] = useState([
    { id: 'all', name: 'Toute l\'équipe', count: 12 },
    { id: 'dev', name: 'Développement', count: 5 },
    { id: 'marketing', name: 'Marketing', count: 4 },
    { id: 'support', name: 'Support', count: 3 }
  ]);

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

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* POPUP DE CHAT */}
      {isOpen && (
        <div 
          className="mb-4 shadow-2xl rounded-xl overflow-hidden border"
          style={{
            width: '400px',
            height: '500px',
            position: 'absolute',
            bottom: '80px',
            right: '0',
            backgroundColor: 'var(--app-card-bg)',
            borderColor: 'var(--notification-border)'
          }}
        >
          {/* Header */}
          <div 
            className="p-4 border-b" 
            style={{
              borderColor: 'var(--notification-border)',
              backgroundColor: 'var(--app-card-bg)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare 
                  className="h-5 w-5" 
                  style={{ color: 'var(--app-chat-widget-bg)' }}
                />
                <span 
                  className="font-medium" 
                  style={{ color: 'var(--app-card-text)' }}
                >
                  Chat
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                style={{
                  color: 'var(--app-card-text)'
                }}
                className="hover:opacity-80"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Sélecteurs */}
            <div className="flex space-x-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger 
                  className="flex-1 h-8 text-xs"
                  style={{
                    backgroundColor: 'var(--app-background)',
                    borderColor: 'var(--notification-border)',
                    color: 'var(--app-text)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {channels.filter(c => c.type === 'channel').map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        {channel.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger 
                  className="flex-1 h-8 text-xs"
                  style={{
                    backgroundColor: 'var(--app-background)',
                    borderColor: 'var(--notification-border)',
                    color: 'var(--app-text)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {team.name}
                        </div>
                        <span className="text-xs opacity-70">({team.count})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea 
            className="h-80 p-4" 
            style={{ backgroundColor: 'var(--app-background)' }}
          >
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div 
                  className="text-center py-8" 
                  style={{ color: 'var(--app-text)', opacity: 0.7 }}
                >
                  <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-sm">Commencez une conversation</p>
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
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                        style={{
                          backgroundColor: message.sender === 'user' 
                            ? 'var(--app-chat-widget-bg)' 
                            : 'var(--notification-button-bg)',
                          color: message.sender === 'user' 
                            ? 'var(--app-chat-widget-icon)' 
                            : 'var(--notification-button-text)'
                        }}
                      >
                        {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </div>
                      <div
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{
                          backgroundColor: message.sender === 'user'
                            ? 'var(--app-chat-widget-bg)'
                            : 'var(--app-card-bg)',
                          color: message.sender === 'user'
                            ? 'var(--app-chat-widget-icon)'
                            : 'var(--app-card-text)',
                          border: message.sender === 'user' 
                            ? 'none' 
                            : `1px solid var(--notification-border)`
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
          <div 
            className="p-4 border-t" 
            style={{
              borderColor: 'var(--notification-border)',
              backgroundColor: 'var(--app-card-bg)'
            }}
          >
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--app-background)',
                  borderColor: 'var(--notification-border)',
                  color: 'var(--app-text)',
                  '--tw-ring-color': 'var(--app-chat-widget-bg)'
                } as React.CSSProperties}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="sm"
                className="px-4"
                style={{
                  backgroundColor: 'var(--app-chat-widget-bg)',
                  color: 'var(--app-chat-widget-icon)'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* BOUTON WIDGET ROND - FIXE ET BIEN POSITIONNÉ */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 1000,
          backgroundColor: 'var(--app-chat-widget-bg)',
          color: 'var(--app-chat-widget-icon)'
        }}
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};
