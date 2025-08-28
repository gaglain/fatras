import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, TestTube } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';

export const NotificationTest: React.FC = () => {
  const { createTestNotification } = useTasks();

  const handleCreateTestNotification = async () => {
    try {
      await createTestNotification();
      toast.success('Notification de test créée ! Regardez la cloche en haut à droite.');
      // Pas de rechargement, les notifications en temps réel devraient fonctionner
    } catch (error) {
      toast.error('Erreur lors de la création de la notification');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Test des notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Cliquez sur ce bouton pour créer une notification de test et voir le point rouge apparaître sur la cloche.
        </p>
        <Button onClick={handleCreateTestNotification} className="w-full">
          <TestTube className="h-4 w-4 mr-2" />
          Créer une notification de test
        </Button>
      </CardContent>
    </Card>
  );
};