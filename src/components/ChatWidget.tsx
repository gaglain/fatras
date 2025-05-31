
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Users } from 'lucide-react';

export const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const sendMessage = () => {
    if (!message.trim()) return;
    console.log('Message envoyé:', message);
    setMessage('');
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-purple-600 hover:bg-purple-700 shadow-lg z-40"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>

      {/* Chat Popup */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-80 h-96 shadow-lg z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center">
                <Users className="h-4 w-4 mr-2" />
                Chat Rapide
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-80">
            <div className="flex-1 overflow-y-auto mb-4 space-y-2">
              <div className="bg-gray-100 p-2 rounded text-sm">
                Bienvenue dans le chat rapide !
              </div>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
