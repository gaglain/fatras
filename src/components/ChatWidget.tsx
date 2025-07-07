
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
  const [inputValue, setInputValue] = useState('');

  const { channels, messages, addMessage } = useMessaging();

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    addMessage(selectedChannel, {
      senderId: 'me',
      sender: 'Moi',
      message: inputValue,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true
    });

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const currentMessages = messages[selectedChannel] || [];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div 
          className="mb-4 shadow-2xl rounded-xl overflow-hidden border"
          style={{ 
            width: '400px', 
            height: '500px',
            backgroundColor: 'var(--app-widget-bg)',
            color: 'var(--app-widget-text)',
            borderColor: 'var(--app-border)'
          }}
        >
          <div 
            className="p-4 border-b"
            style={{ 
              backgroundColor: 'var(--app-widget-bg)',
              borderColor: 'var(--app-border)'
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Chat Interne</span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20"
                style={{ color: 'var(--app-widget-text)' }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger 
                  className="flex-1 h-8 text-xs"
                  style={{ 
                    backgroundColor: 'var(--app-input-bg)',
                    color: 'var(--app-input-text)',
                    borderColor: 'var(--app-border)'
                  }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{
                  backgroundColor: 'var(--app-card-bg)',
                  color: 'var(--app-card-text)',
                  borderColor: 'var(--app-border)'
                }}>
                  {channels.filter(c => c.type === 'channel').map((channel) => (
                    <SelectItem key={channel.id} value={channel.id}>
                      <div className="flex items-center">
                        <Hash className="h-3 w-3 mr-1" />
                        {channel.name}
                        {channel.unread > 0 && (
                          <span 
                            className="ml-2 px-1 py-0.5 text-xs rounded-full text-white"
                            style={{ backgroundColor: 'var(--app-button-bg)' }}
                          >
                            {channel.unread}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea 
            className="h-80 p-4"
            style={{ backgroundColor: 'var(--app-background)' }}
          >
            <div className="space-y-3">
              {currentMessages.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--app-text)' }}>
                  <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-sm">Commencez une conversation dans #{selectedChannel}</p>
                </div>
              ) : (
                currentMessages.map((message) => (
                  <div key={message.id} className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div 
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs text-white"
                        style={{ 
                          backgroundColor: message.isMe ? 'var(--app-button-bg)' : 'var(--app-text)'
                        }}
                      >
                        <User className="h-3 w-3" />
                      </div>
                      <div 
                        className={`px-3 py-2 rounded-lg text-sm ${
                          message.isMe 
                            ? 'text-white' 
                            : 'border'
                        }`}
                        style={{ 
                          backgroundColor: message.isMe 
                            ? 'var(--app-button-bg)' 
                            : 'var(--app-card-bg)',
                          color: message.isMe 
                            ? 'var(--app-button-text)' 
                            : 'var(--app-card-text)',
                          borderColor: message.isMe 
                            ? 'transparent' 
                            : 'var(--app-border)'
                        }}
                      >
                        <div className="flex items-center space-x-1 mb-1">
                          <span className="font-medium text-xs">{message.sender}</span>
                          <span className="text-xs opacity-70">{message.time}</span>
                        </div>
                        <div>{message.message}</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div 
            className="p-4 border-t"
            style={{ 
              backgroundColor: 'var(--app-card-bg)',
              borderColor: 'var(--app-border)'
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
                  backgroundColor: 'var(--app-input-bg)',
                  color: 'var(--app-input-text)',
                  borderColor: 'var(--app-border)',
                  '--tw-ring-color': 'var(--app-button-bg)'
                } as React.CSSProperties}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim()} 
                size="sm"
                style={{
                  backgroundColor: 'var(--app-button-bg)',
                  color: 'var(--app-button-text)'
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        style={{
          backgroundColor: 'var(--app-widget-bg)',
          color: 'var(--app-widget-text)'
        }}
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};
