import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const useWebPushNotifications = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isSupported, setIsSupported] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if push notifications are supported
    const supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      loadExistingSubscription();
    }
  }, []);

  const loadExistingSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await (registration as any).pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      logger.error('Error loading existing subscription:', error);
    }
  };

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error('Les notifications push ne sont pas supportées sur cet appareil');
      return false;
    }

    setIsLoading(true);
    
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        await subscribeToPush();
        toast.success('Notifications activées avec succès!');
        return true;
      } else if (result === 'denied') {
        toast.error('Permission refusée pour les notifications');
        return false;
      }
      
      return false;
    } catch (error) {
      logger.error('Error requesting permission:', error);
      toast.error('Erreur lors de la demande de permission');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribeToPush = async () => {
    try {
      logger.debug('Attempting to subscribe to push notifications...');
      
      // Check if service worker is registered
      if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
      }

      const registration = await navigator.serviceWorker.ready as any;
      logger.debug('Service Worker ready');
      
      // Check if PushManager is available
      if (!registration.pushManager) {
        throw new Error('Push Manager not supported');
      }

      // For iOS, check if standalone mode (PWA installed)
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      logger.debug('Standalone mode (PWA):', isStandalone);

      // Fetch VAPID public key from Edge Function
      logger.debug('Fetching VAPID public key...');
      const { data: vapidData, error: vapidError } = await supabase.functions.invoke('get-vapid-key');
      
      if (vapidError || !vapidData?.success || !vapidData?.publicKey) {
        logger.error('Failed to fetch VAPID key:', vapidError || vapidData?.error);
        throw new Error('Clé VAPID non configurée. Contactez l\'administrateur.');
      }
      
      const vapidPublicKey = vapidData.publicKey;
      logger.debug('VAPID key received');
      
      const convertedKey = urlBase64ToUint8Array(vapidPublicKey);
      logger.debug('VAPID key converted successfully');
      
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey as BufferSource
      });

      logger.debug('Push subscription created');
      setSubscription(pushSubscription);
      
      // Save subscription to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const subscriptionData: PushSubscriptionData = {
          endpoint: pushSubscription.endpoint,
          keys: {
            p256dh: arrayBufferToBase64(pushSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(pushSubscription.getKey('auth')!)
          }
        };

        const { error: dbError } = await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            setting_key: 'push_subscription',
            setting_value: JSON.stringify(subscriptionData)
          }, {
            onConflict: 'user_id,setting_key'
          });

        if (dbError) {
          logger.error('Error saving subscription to database:', dbError);
          throw dbError;
        }

        logger.debug('Subscription saved to database');
      }

      return pushSubscription;
    } catch (error) {
      logger.error('Error subscribing to push:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          toast.error('Les notifications push ne sont pas supportées sur cet appareil');
        } else if (error.name === 'NotAllowedError') {
          toast.error('Permission refusée. Veuillez autoriser les notifications dans les paramètres de votre navigateur');
        } else if (error.name === 'NotSupportedError') {
          toast.error('Les notifications push ne sont pas supportées. Assurez-vous que l\'app est installée comme PWA');
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      }
      
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);
      
      // Remove from database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('app_settings')
          .delete()
          .eq('user_id', user.id)
          .eq('setting_key', 'push_subscription');
      }
      
      toast.success('Notifications désactivées');
    } catch (error) {
      logger.error('Error unsubscribing:', error);
      toast.error('Erreur lors de la désactivation des notifications');
    }
  };

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    requestPermission,
    unsubscribeFromPush,
    isSubscribed: !!subscription
  };
};

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
