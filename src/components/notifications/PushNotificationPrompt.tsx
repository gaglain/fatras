import React, { useEffect, useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

export const PushNotificationPrompt: React.FC = () => {
  const { permission, isSupported, requestPermission, isLoading, isSubscribed } = useWebPushNotifications();
  const [isDismissed, setIsDismissed] = useState(false);

  const needsResubscribe = permission === 'granted' && !isSubscribed;

  useEffect(() => {
    // Check if user has already dismissed the prompt
    const dismissed = localStorage.getItem('push-notification-prompt-dismissed');
    setIsDismissed(dismissed === 'true');
  }, []);

  const handleEnable = async () => {
    const granted = await requestPermission();
    if (granted) {
      setIsDismissed(true);
      localStorage.setItem('push-notification-prompt-dismissed', 'true');
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('push-notification-prompt-dismissed', 'true');
  };

  // Show if permission is not granted OR permission granted but subscription missing
  if (!isSupported || (permission === 'granted' && isSubscribed) || (!needsResubscribe && isDismissed)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="relative pb-3">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-lg">
              {needsResubscribe ? 'Réactiver les notifications' : 'Activer les notifications'}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <CardDescription>
            {needsResubscribe
              ? "L'autorisation est active, mais l'abonnement push est manquant. Réactivez-le pour recevoir les notifications sans ouvrir l'app."
              : "Recevez des notifications push sur votre appareil pour ne manquer aucun message ou mise à jour importante, même quand l'app est fermée."}
          </CardDescription>
          <div className="flex gap-2">
            <Button 
              onClick={handleEnable} 
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Activation...' : needsResubscribe ? 'Réactiver' : 'Activer'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="flex-1"
            >
              Plus tard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
