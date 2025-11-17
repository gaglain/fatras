import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, Plus, TestTube } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationTester: React.FC = () => {
  const { user } = useAuthContext();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const createTestNotification = async () => {
    if (!user) {
      toast.error('Utilisateur non connecté');
      return;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'test',
          title: 'Test de notification',
          message: `Notification de test créée à ${new Date().toLocaleTimeString()}`,
          read: false,
          data: { test: true, timestamp: Date.now() }
        });

      if (error) throw error;
      toast.success('Notification de test créée !');
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      toast.error('Erreur lors de la création de la notification');
    }
  };

  const markAllAsReadHandler = async () => {
    try {
      await markAllAsRead();
      toast.success('Toutes les notifications marquées comme lues');
    } catch (error) {
      toast.error('Erreur lors du marquage des notifications');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Testeur de notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm">
          <Bell className="h-4 w-4" />
          <span>Notifications non lues: <strong>{unreadCount}</strong></span>
        </div>

        <div className="flex gap-2">
          <Button onClick={createTestNotification} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Créer notification test
          </Button>
          
          {unreadCount > 0 && (
            <Button onClick={markAllAsReadHandler} variant="outline" size="sm">
              Marquer tout comme lu
            </Button>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Dernières notifications:</div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div 
                  key={notification.id} 
                  className={`text-xs p-2 rounded border ${
                    notification.read 
                      ? 'bg-muted text-muted-foreground' 
                      : 'bg-blue-50 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="font-medium">{notification.title}</div>
                  <div>{notification.message}</div>
                  <div className="text-xs opacity-60 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};