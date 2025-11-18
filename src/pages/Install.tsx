import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Smartphone, Download, QrCode, CheckCircle2 } from 'lucide-react';

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Smartphone className="h-6 w-6" />
            Installer ArtistCRM
          </CardTitle>
          <CardDescription>
            Installez l'application sur votre appareil pour un accès rapide et une expérience optimale
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isInstalled ? (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                <strong>Application installée !</strong><br />
                Vous pouvez maintenant utiliser ArtistCRM depuis votre écran d'accueil.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {deferredPrompt && (
                <div className="text-center space-y-4">
                  <Alert>
                    <QrCode className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Installation disponible !</strong><br />
                      Cliquez sur le bouton ci-dessous pour installer l'application.
                    </AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={handleInstall}
                    size="lg"
                    className="w-full"
                  >
                    <Download className="h-5 w-5 mr-2" />
                    Installer l'application
                  </Button>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Installation sur iOS (Safari)</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Ouvrez cette page dans Safari</li>
                    <li>Appuyez sur l'icône de partage <span className="inline-flex items-center mx-1">📤</span></li>
                    <li>Faites défiler et sélectionnez "Sur l'écran d'accueil"</li>
                    <li>Confirmez l'installation</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Installation sur Android (Chrome)</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Ouvrez cette page dans Chrome</li>
                    <li>Appuyez sur le menu (trois points verticaux)</li>
                    <li>Sélectionnez "Installer l'application" ou "Ajouter à l'écran d'accueil"</li>
                    <li>Confirmez l'installation</li>
                  </ol>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Installation sur ordinateur</h3>
                  <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
                    <li>Ouvrez cette page dans Chrome, Edge ou un navigateur compatible</li>
                    <li>Cliquez sur l'icône d'installation dans la barre d'adresse</li>
                    <li>Confirmez l'installation</li>
                  </ol>
                </div>
              </div>
            </>
          )}

          <div className="pt-6 border-t space-y-3">
            <h3 className="font-semibold">Avantages de l'installation</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Accès rapide depuis votre écran d'accueil</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Fonctionne hors ligne pour une meilleure performance</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Interface optimisée en plein écran</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                <span>Mises à jour automatiques</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
