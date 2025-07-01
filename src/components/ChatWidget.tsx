
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');

  const { channels } = useMessaging();

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
        text: 'Message reçu ! Notre équipe vous répondra bientôt.',
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
      {isOpen && (
        <div className="mb-4 shadow-2xl rounded-xl overflow-hidden border bg-white" style={{ width: '400px', height: '500px' }}>
          <div className="p-4 border-b bg-blue-600 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Chat Interne</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700">
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger className="flex-1 h-8 text-xs bg-white text-black">
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
            </div>
          </div>

          <ScrollArea className="h-80 p-4 bg-gray-50">
            <div className="space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquare className="h-8 w-8 mx-auto mb-3" />
                  <p className="text-sm">Commencez une conversation dans #{selectedChannel}</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex items-start space-x-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                        {message.sender === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                      </div>
                      <div className={`px-3 py-2 rounded-lg text-sm ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white border'}`}>
                        {message.text}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tapez votre message..."
                className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group bg-blue-500 text-white"
      >
        <MessageSquare className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
      </button>
    </div>
  );
};
