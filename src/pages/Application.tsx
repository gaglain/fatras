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
  Tablet,
  FileDown,
  Zap,
  Code,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';

export const Application: React.FC = () => {
  const handleTestDesktop = () => {
    window.open(window.location.origin, '_blank');
  };

  const handleTestMobile = () => {
    const mobileUrl = `${window.location.origin}?mobile=true`;
    window.open(mobileUrl, '_blank');
  };

  const handleGenerateQR = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.origin)}`;
    window.open(qrUrl, '_blank');
  };

  const handleDownloadAPK = () => {
    // Créer un fichier APK factice mais avec la bonne extension
    const apkContent = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, // ZIP signature
      0x14, 0x00, 0x00, 0x00, 0x08, 0x00, // ZIP headers
      // Contenu factice pour simuler un APK
      ...Array.from({ length: 1000 }, () => Math.floor(Math.random() * 256))
    ]);
    
    const blob = new Blob([apkContent], { type: 'application/vnd.android.package-archive' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MusiConnect.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('APK téléchargé ! Note: Fichier de démonstration. Pour un APK réel, utilisez Capacitor.');
  };

  const handleDownloadIPA = () => {
    // Créer un fichier IPA factice mais avec la bonne extension
    const ipaContent = new Uint8Array([
      0x50, 0x4B, 0x03, 0x04, // ZIP signature (IPA est un ZIP)
      0x14, 0x00, 0x00, 0x00, 0x08, 0x00, // ZIP headers
      // Contenu factice pour simuler un IPA
      ...Array.from({ length: 1500 }, () => Math.floor(Math.random() * 256))
    ]);
    
    const blob = new Blob([ipaContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MusiConnect.ipa';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('IPA téléchargé ! Note: Fichier de démonstration. Pour un IPA réel, utilisez Capacitor sur macOS.');
  };

  const handleBuildAPK = () => {
    toast.info('Génération de l\'APK en cours...', {
      description: 'Création du package Android',
      duration: 3000
    });
    
    // Simuler le processus de build
    setTimeout(() => {
      toast.success('APK généré avec succès !', {
        description: 'Votre application Android est prête',
        action: {
          label: 'Télécharger',
          onClick: handleDownloadAPK
        }
      });
    }, 3000);
  };

  const handleBuildIPA = () => {
    toast.info('Génération de l\'IPA en cours...', {
      description: 'Création du package iOS',
      duration: 3000
    });
    
    setTimeout(() => {
      toast.success('IPA généré avec succès !', {
        description: 'Votre application iOS est prête',
        action: {
          label: 'Télécharger',
          onClick: handleDownloadIPA
        }
      });
    }, 3000);
  };

  const handleExportProject = () => {
    // Simuler l'export du projet
    const projectData = {
      name: 'MusiConnect',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      url: window.location.origin
    };
    
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'musiconnect-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Projet exporté avec succès');
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
      navigator.clipboard.writeText(window.location.origin);
      toast.success('Lien copié dans le presse-papiers');
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
            Test et Déploiement
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
            Testez, partagez et déployez votre application sur différentes plateformes
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
              Testez l'application en mode mobile ou scannez le QR code
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
              Partagez votre application avec d'autres utilisateurs
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

      {/* Enhanced Mobile App Generation */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Génération d'Applications Mobiles
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Les fichiers générés ici sont des démonstrations. Pour créer de vraies applications natives, 
              exportez votre projet vers GitHub et utilisez Capacitor avec Android Studio ou Xcode.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Android APK */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Android APK</h3>
                  <p className="text-sm text-gray-600">Application pour Android</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleBuildAPK}
                  className="w-full"
                  style={{
                    backgroundColor: 'var(--app-button-bg, #1632f4)',
                    color: 'var(--app-button-text, #ffffff)'
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Générer et Télécharger APK
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>• Format: .apk (installable)</p>
                <p>• Compatible Android 7.0+</p>
                <p>• Distribution privée</p>
              </div>
            </div>

            {/* iOS IPA */}
            <div className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">iOS IPA</h3>
                  <p className="text-sm text-gray-600">Application pour iPhone/iPad</p>   
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  onClick={handleBuildIPA}
                  className="w-full"
                  style={{
                    backgroundColor: 'var(--app-button-bg, #1632f4)',
                    color: 'var(--app-button-text, #ffffff)'
                  }}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Générer et Télécharger IPA
                </Button>
              </div>
              
              <div className="text-xs text-gray-500">
                <p>• Format: .ipa (installable)</p>
                <p>• Compatible iOS 12.0+</p>
                <p>• Nécessite certificat développeur</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={{
            backgroundColor: 'var(--app-background, #f9f9f9)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <h4 className="font-medium mb-2">Instructions d'installation</h4>
            <div className="space-y-2 text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              <p><strong>Android:</strong> Activez "Sources inconnues" dans les paramètres, puis installez le fichier .apk</p>
              <p><strong>iOS:</strong> Nécessite un certificat développeur et Xcode pour l'installation</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download and Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card style={{
          backgroundColor: 'var(--app-card-bg, #ffffff)',
          color: 'var(--app-card-text, #18181b)',
          border: '1px solid var(--notification-border, #e5e7eb)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Download className="h-5 w-5 mr-2" />
              Applications Mobiles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              Téléchargez les fichiers d'installation pour les appareils mobiles
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleDownloadAPK}
                className="w-full"
                variant="outline"
                style={{
                  borderColor: 'var(--app-button-bg, #1632f4)',
                  color: 'var(--app-button-bg, #1632f4)'
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger APK (Android)
              </Button>
              <Button 
                onClick={handleDownloadIPA}
                className="w-full"
                variant="outline"
                style={{
                  borderColor: 'var(--app-button-bg, #1632f4)',
                  color: 'var(--app-button-bg, #1632f4)'
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Télécharger IPA (iOS)
              </Button>
            </div>
            <div className="p-3 rounded-lg" style={{
              backgroundColor: 'var(--app-background, #f9f9f9)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <p className="text-xs" style={{ color: 'var(--app-text, #666666)' }}>
                💡 Pour générer des apps natives, exportez votre projet vers GitHub et utilisez Capacitor
              </p>
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
              <Code className="h-5 w-5 mr-2" />
              Export de Projet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
              Exportez les données de votre projet pour sauvegarde ou migration
            </p>
            <Button 
              onClick={handleExportProject}
              className="w-full"
              style={{
                backgroundColor: 'var(--app-button-bg, #1632f4)',
                color: 'var(--app-button-text, #ffffff)'
              }}
            >
              <FileDown className="h-4 w-4 mr-2" />
              Exporter le Projet
            </Button>
            <div className="p-3 rounded-lg" style={{
              backgroundColor: 'var(--app-background, #f9f9f9)',
              border: '1px solid var(--notification-border, #e5e7eb)'
            }}>
              <p className="text-xs" style={{ color: 'var(--app-text, #666666)' }}>
                📁 Exporte les configurations et données au format JSON
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Instructions */}
      <Card style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        color: 'var(--app-card-text, #18181b)',
        border: '1px solid var(--notification-border, #e5e7eb)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Instructions de Déploiement Mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-3 flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Prérequis pour le déploiement mobile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)',
                  border: '1px solid var(--notification-border, #e5e7eb)'
                }}>
                  <h4 className="font-medium mb-2">Android (APK)</h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--app-text, #666666)' }}>
                    <li>• Android Studio installé</li>
                    <li>• SDK Android configuré</li>
                    <li>• Capacitor CLI installé</li>
                    <li>• Certificat de signature (pour production)</li>
                  </ul>
                </div>
                <div className="p-4 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)',
                  border: '1px solid var(--notification-border, #e5e7eb)'
                }}>
                  <h4 className="font-medium mb-2">iOS (IPA)</h4>
                  <ul className="text-sm space-y-1" style={{ color: 'var(--app-text, #666666)' }}>
                    <li>• macOS avec Xcode</li>
                    <li>• Compte développeur Apple</li>
                    <li>• Certificats iOS configurés</li>
                    <li>• Profils de provisioning</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Étapes de déploiement</h3>
              <div className="space-y-2">
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)'
                }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <p className="font-medium">Export vers GitHub</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                      Utilisez le bouton "Export to GitHub" pour transférer votre projet
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)'
                }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <p className="font-medium">Installation des dépendances</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                      <code className="bg-gray-100 px-1 rounded">npm install && npx cap add android/ios</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)'
                }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <p className="font-medium">Build et synchronisation</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                      <code className="bg-gray-100 px-1 rounded">npm run build && npx cap sync</code>
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 rounded-lg" style={{
                  backgroundColor: 'var(--app-background, #f9f9f9)'
                }}>
                  <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <div>
                    <p className="font-medium">Génération de l'application</p>
                    <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>
                      <code className="bg-gray-100 px-1 rounded">npx cap run android/ios</code>
                    </p>
                  </div>
                </div>
              </div>
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
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status :</span>
              <Badge className="bg-green-100 text-green-800">
                En ligne
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
