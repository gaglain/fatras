
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Smartphone, 
  Download, 
  Share2, 
  Globe, 
  ExternalLink,
  QrCode,
  TestTube,
  Monitor,
  Tablet
} from 'lucide-react';

export const Application: React.FC = () => {
  const handleTestDesktop = () => {
    window.open(window.location.origin, '_blank');
  };

  const handleTestMobile = () => {
    // Ouvrir dans un nouvel onglet avec simulation mobile
    const mobileUrl = `${window.location.origin}?mobile=true`;
    window.open(mobileUrl, '_blank');
  };

  const handleGenerateQR = () => {
    // Générer un QR code pour l'application
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`;
    window.open(qrUrl, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'MusiConnect',
          text: 'Découvrez MusiConnect - Gestion d\'artistes et d\'événements',
          url: window.location.origin
        });
      } catch (error) {
        console.log('Partage annulé');
      }
    } else {
      // Fallback pour les navigateurs qui ne supportent pas l'API de partage
      navigator.clipboard.writeText(window.location.origin);
      alert('Lien copié dans le presse-papiers');
    }
  };

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Test de l'Application
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Testez votre application sur différents appareils et partagez-la
          </p>
        </div>
        <Badge className="px-3 py-1 text-sm" style={{
          backgroundColor: 'var(--app-button-bg, #1632f4)',
          color: 'var(--app-button-text, #ffffff)'
        }}>
          Version 1.0.0
        </Badge>
      </div>

      {/* Test Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="h-5 w-5 mr-2" />
              Test Desktop
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              Ouvrez l'application dans un nouvel onglet pour tester l'expérience desktop
            </p>
            <Button 
              onClick={handleTestDesktop}
              className="w-full"
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Tester sur Desktop
            </Button>
          </CardContent>
        </Card>

        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="h-5 w-5 mr-2" />
              Test Mobile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              Testez l'application en mode mobile ou scannez le QR code avec votre téléphone
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleTestMobile}
                className="w-full"
                variant="outline"
                style={{
                  borderColor: 'var(--app-button-bg, #1632f4)',
                  color: 'var(--app-button-bg, #1632f4)'
                }}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Mode Mobile
              </Button>
              <Button 
                onClick={handleGenerateQR}
                className="w-full"
                variant="outline"
                style={{
                  borderColor: 'var(--app-button-bg, #1632f4)',
                  color: 'var(--app-button-bg, #1632f4)'
                }}
              >
                <QrCode className="h-4 w-4 mr-2" />
                QR Code
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Share2 className="h-5 w-5 mr-2" />
              Partage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              Partagez votre application avec d'autres utilisateurs pour obtenir des retours
            </p>
            <Button 
              onClick={handleShare}
              className="w-full"
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Partager l'App
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Test Instructions */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TestTube className="h-5 w-5 mr-2" />
            Instructions de Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">🖥️ Test Desktop</h3>
              <ul className="text-sm space-y-1" style={{ color: 'var(--app-text, #666666)' }}>
                <li>• Testez toutes les fonctionnalités principales</li>
                <li>• Vérifiez la responsive design en redimensionnant la fenêtre</li>
                <li>• Testez les raccourcis clavier</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">📱 Test Mobile</h3>
              <ul className="text-sm space-y-1" style={{ color: 'var(--app-text, #666666)' }}>
                <li>• Testez les gestes tactiles (swipe, pinch, etc.)</li>
                <li>• Vérifiez l'adaptation à différentes tailles d'écran</li>
                <li>• Testez en mode portrait et paysage</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-2">🔗 Partage et Feedback</h3>
              <ul className="text-sm space-y-1" style={{ color: 'var(--app-text, #666666)' }}>
                <li>• Partagez avec vos collègues ou clients</li>
                <li>• Collectez les retours utilisateurs</li>
                <li>• Notez les bugs ou améliorations possibles</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current URL Info */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Informations de l'Application
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">URL de l'application :</span>
              <code className="text-xs px-2 py-1 rounded" style={{
                backgroundColor: 'var(--app-background, #f5f5f5)',
                color: 'var(--app-text, #333333)'
              }}>
                {window.location.origin}
              </code>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Environnement :</span>
              <Badge variant="outline">
                {window.location.hostname === 'localhost' ? 'Développement' : 'Production'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
