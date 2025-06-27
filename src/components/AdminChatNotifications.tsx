
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Eye, Reply } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ChatNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ChatMessage {
  id: string;
  user_name: string;
  message: string;
  timestamp: string;
  is_admin: boolean;
}

export const AdminChatNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<ChatNotification[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [adminReply, setAdminReply] = useState('');

  useEffect(() => {
    const loadNotifications = () => {
      const saved = localStorage.getItem('adminNotifications');
      if (saved) {
        try {
          setNotifications(JSON.parse(saved));
        } catch (error) {
          console.error('Erreur chargement notifications:', error);
        }
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 2000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    localStorage.setItem('adminNotifications', JSON.stringify(updated));
  };

  const sendAdminReply = () => {
    if (!adminReply.trim()) return;

    const messages: ChatMessage[] = JSON.parse(
      localStorage.getItem('publicChatMessages') || '[]'
    );

    const newMessage: ChatMessage = {
      id: `admin-${Date.now()}`,
      user_name: 'Support',
      message: adminReply.trim(),
      timestamp: new Date().toISOString(),
      is_admin: true
    };

    messages.push(newMessage);
    localStorage.setItem('publicChatMessages', JSON.stringify(messages));
    setAdminReply('');
    toast.success('Réponse envoyée !');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Notifications Chat Public
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </h3>
        <Button
          variant="outline"
          onClick={() => setShowChat(!showChat)}
        >
          {showChat ? 'Masquer' : 'Voir le chat'}
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            Aucune notification de chat pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.slice(0, 5).map((notification) => (
            <Card key={notification.id} className={notification.read ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{notification.title}</h4>
                      {!notification.read && (
                        <Badge variant="secondary">Nouveau</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notification.id)}
                    disabled={notification.read}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showChat && (
        <Card>
          <CardHeader>
            <CardTitle>Répondre au chat public</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-2">
              <Input
                value={adminReply}
                onChange={(e) => setAdminReply(e.target.value)}
                placeholder="Tapez votre réponse..."
                className="flex-1"
              />
              <Button onClick={sendAdminReply} disabled={!adminReply.trim()}>
                <Reply className="h-4 w-4 mr-2" />
                Envoyer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
