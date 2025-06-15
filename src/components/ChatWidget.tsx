
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
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 1000
    }}>
      {/* CHAT POPUP AVEC CLASSE SPÉCIFIQUE */}
      {isOpen && (
        <div 
          className="mb-4 shadow-lg rounded-xl overflow-hidden chat-widget-popup" 
          style={{
            background: 'var(--app-card-bg)',
            border: '1px solid rgba(0,0,0,0.1)',
            width: '400px',
            height: '500px',
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 999
          }}
        >
          {/* Header avec sélecteurs EN HAUT */}
          <div className="p-4 border-b" style={{
            background: 'var(--app-card-bg)',
            borderColor: 'rgba(0,0,0,0.1)'
          }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" style={{ color: '#ec5f65' }} />
                <span className="font-medium" style={{ color: 'var(--app-card-text)' }}>Chat</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                style={{ color: 'var(--app-card-text)' }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* SÉLECTEURS EN LIGNE (EN HAUT) */}
            <div className="flex space-x-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="flex-1 h-8 text-xs" style={{
                  background: 'var(--app-background)',
                  color: 'var(--app-text)',
                  borderColor: '#ec5f65'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  background: 'var(--app-card-bg)',
                  color: 'var(--app-card-text)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  zIndex: 10000
                }}>
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
                <SelectTrigger className="flex-1 h-8 text-xs" style={{
                  background: 'var(--app-background)',
                  color: 'var(--app-text)',
                  borderColor: '#ec5f65'
                }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  background: 'var(--app-card-bg)',
                  color: 'var(--app-card-text)',
                  border: '1px solid rgba(0,0,0,0.1)',
                  zIndex: 10000
                }}>
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
          <ScrollArea className="h-80 p-4" style={{ background: 'var(--app-background)' }}>
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 opacity-50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3" style={{ color: 'var(--app-text)' }} />
                  <p className="text-sm" style={{ color: 'var(--app-text)' }}>
                    Commencez une conversation
                  </p>
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
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{
                        background: message.sender === 'user' ? '#ec5f65' : 'var(--app-card-bg)',
                        color: message.sender === 'user' ? '#ffffff' : 'var(--app-text)'
                      }}>
                        {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </div>
                      <div
                        className="px-3 py-2 rounded-lg text-sm"
                        style={{
                          background: message.sender === 'user' ? '#ec5f65' : 'var(--app-card-bg)',
                          color: message.sender === 'user' ? '#ffffff' : 'var(--app-card-text)',
                          border: message.sender === 'user' ? 'none' : '1px solid rgba(0,0,0,0.1)'
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
          <div className="p-4 border-t" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 text-sm border rounded-md"
                style={{
                  background: 'var(--app-background)',
                  color: 'var(--app-text)',
                  borderColor: '#ec5f65'
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputValue.trim()}
                size="sm"
                className="w-10 h-10 p-0 rounded-full chat-widget-button"
                style={{
                  background: '#ec5f65',
                  color: '#ffffff',
                  minWidth: 'auto',
                  minHeight: 'auto',
                  width: '40px',
                  height: '40px',
                  position: 'relative'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* BOUTON WIDGET - FIXE, ROND ET ROSE (RESTAURÉ) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-widget-button"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    </div>
  );
};
