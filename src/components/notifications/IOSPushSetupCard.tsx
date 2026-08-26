import React, { useEffect, useState } from 'react';
import { Bell, Share, PlusSquare, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWebPushNotifications } from '@/hooks/useWebPushNotifications';

const isIOS = (): boolean => {
  const ua = navigator.userAgent;
  const iOSDevice = /iPhone|iPad|iPod/.test(ua);
  // iPadOS 13+ se présente comme un Mac tactile
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return iOSDevice || iPadOS;
};

const isStandalone = (): boolean => {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
};

export const IOSPushSetupCard: React.FC = () => {
  const { permission, isSupported, isSubscribed, requestPermission, isLoading } = useWebPushNotifications();
  const [ios, setIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    setIos(isIOS());
    setStandalone(isStandalone());
  }, []);

  if (!ios) return null;

  const needsInstall = !standalone;
  const ready = isSupported && permission === 'granted' && isSubscribed;

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center text-base">
          <Bell className="h-5 w-5 mr-2" />
          Notifications push sur iPhone / iPad
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {ready ? (
          <p className="flex items-start gap-2 text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            Cet appareil est bien enregistré : vous recevrez les notifications même
            application fermée.
          </p>
        ) : needsInstall ? (
          <div className="space-y-3">
            <p className="flex items-start gap-2 text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              Sur iOS, Apple n'autorise les notifications push que depuis l'app
              installée sur l'écran d'accueil (pas depuis Safari).
            </p>
            <ol className="space-y-2 pl-1">
              <li className="flex items-start gap-2">
                <Share className="h-4 w-4 mt-0.5 shrink-0" />
                <span>1. Dans Safari, touchez le bouton <strong>Partager</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <PlusSquare className="h-4 w-4 mt-0.5 shrink-0" />
                <span>2. Choisissez <strong>Sur l'écran d'accueil</strong>, puis <strong>Ajouter</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <Bell className="h-4 w-4 mt-0.5 shrink-0" />
                <span>
                  3. Ouvrez Fatras depuis l'icône ajoutée, revenez ici et touchez
                  <strong> Activer les notifications</strong>.
                </span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground">
              {permission === 'denied'
                ? "Les notifications ont été refusées. Ouvrez Réglages iOS > Notifications > Fatras et autorisez-les, puis revenez ici."
                : "L'app est bien installée. Touchez le bouton ci-dessous pour enregistrer cet iPhone."}
            </p>
            <Button onClick={requestPermission} disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? 'Activation...' : 'Activer les notifications'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
