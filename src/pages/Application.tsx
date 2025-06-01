
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, Apple, Bot, QrCode, Settings, CheckCircle, AlertCircle } from 'lucide-react';

export const Application: React.FC = () => {
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'success' | 'error'>('idle');

  const handleBuildApp = () => {
    setBuildStatus('building');
    
    // Simulation du processus de build
    setTimeout(() => {
      setBuildStatus('success');
      setTimeout(() => setBuildStatus('idle'), 5000);
    }, 3000);
  };

  const initializeCapacitor = () => {
    console.log('Initializing Capacitor...');
    // En production, ceci exécuterait: npx cap init
    alert('Capacitor initialisé ! Consultez la console pour les prochaines étapes.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Application Mobile</h1>
          <p className="text-gray-600 mt-2">Gérez et distribuez votre application mobile iOS et Android</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          Capacitor Ready
        </Badge>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Apple className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">iOS App</h3>
                <p className="text-sm text-gray-600">Version 1.0.0</p>
                <Badge variant="outline" className="mt-1">En développement</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Android App</h3>
                <p className="text-sm text-gray-600">Version 1.0.0</p>
                <Badge variant="outline" className="mt-1">En développement</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">PWA</h3>
                <p className="text-sm text-gray-600">Progressive Web App</p>
                <Badge className="mt-1 bg-green-500">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Build Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Configuration Capacitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Configuration actuelle :</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p>• App ID: app.lovable.1430f060d6304b55b692677815f70ace</p>
              <p>• App Name: ShowManager Mobile</p>
              <p>• Bundle ID: com.showmanager.mobile</p>
              <p>• Version: 1.0.0</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <Button onClick={initializeCapacitor} variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Initialiser Capacitor
            </Button>
            <Button onClick={handleBuildApp} disabled={buildStatus === 'building'}>
              {buildStatus === 'building' ? (
                <>
                  <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                  Construction...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Construire l'App
                </>
              )}
            </Button>
          </div>

          {buildStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span>Application construite avec succès ! Prête pour le déploiement.</span>
            </div>
          )}

          {buildStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <span>Erreur lors de la construction. Vérifiez les logs.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Download Links */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Téléchargements</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button size="lg" className="h-16 flex-col space-y-1" variant="outline">
              <Apple className="h-6 w-6" />
              <span>Télécharger pour iOS</span>
              <span className="text-xs text-gray-500">App Store</span>
            </Button>
            
            <Button size="lg" className="h-16 flex-col space-y-1" variant="outline">
              <Bot className="h-6 w-6" />
              <span>Télécharger pour Android</span>
              <span className="text-xs text-gray-500">Google Play</span>
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-4 p-6 bg-gray-50 rounded-lg">
            <QrCode className="h-24 w-24 text-gray-400" />
            <div>
              <h4 className="font-medium">QR Code de téléchargement</h4>
              <p className="text-sm text-gray-600">Scannez pour télécharger directement</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions de Déploiement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Pour tester sur un appareil physique :</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                <li>Exportez le projet vers GitHub</li>
                <li>Clonez le projet localement</li>
                <li>Exécutez <code className="bg-blue-100 px-1 rounded">npm install</code></li>
                <li>Ajoutez les plateformes : <code className="bg-blue-100 px-1 rounded">npx cap add ios android</code></li>
                <li>Construisez : <code className="bg-blue-100 px-1 rounded">npm run build</code></li>
                <li>Synchronisez : <code className="bg-blue-100 px-1 rounded">npx cap sync</code></li>
                <li>Lancez : <code className="bg-blue-100 px-1 rounded">npx cap run ios/android</code></li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-yellow-900 mb-2">Prérequis :</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                <li>macOS avec Xcode pour iOS</li>
                <li>Android Studio pour Android</li>
                <li>Compte développeur Apple (iOS)</li>
                <li>Compte développeur Google Play (Android)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
