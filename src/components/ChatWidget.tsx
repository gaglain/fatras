
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

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

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen && (
        <Card className="w-80 h-96 mb-4 shadow-lg">
          <CardHeader className="pb-2" style={{
            background: 'var(--custom-buttonBg)',
            color: 'var(--custom-buttonText)'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center" style={{
                color: 'var(--custom-buttonText)'
              }}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Support
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--custom-buttonText)',
                  border: 'none'
                }}
                className="hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-full p-0">
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 ? (
                <div className="text-center py-8 opacity-50">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2" />
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
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs`} style={{
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
                        className="px-3 py-2 rounded-lg text-sm"
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
                  className="flex-1 px-3 py-2 text-sm border rounded-md"
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
                  style={{
                    background: 'var(--custom-chatWidgetBg)',
                    color: 'var(--custom-chatWidgetIcon)',
                    border: 'none'
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Widget button - ROND */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg chat-widget-button"
        style={{
          background: 'var(--custom-chatWidgetBg)',
          color: 'var(--custom-chatWidgetIcon)',
          border: 'none',
          borderRadius: '50%'
        }}
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </div>
  );
};
