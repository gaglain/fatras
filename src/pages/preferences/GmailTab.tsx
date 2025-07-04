
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Mail, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

export const GmailTab: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [syncInterval, setSyncInterval] = useState(5);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const handleConnectGmail = () => {
    // Simuler la connexion Google OAuth
    toast.info('Redirection vers Google...', {
      description: 'Vous allez être redirigé vers Google pour autoriser l\'accès à Gmail'
    });
    
    setTimeout(() => {
      setIsConnected(true);
      setLastSync(new Date());
      toast.success('Gmail connecté avec succès !', {
        description: 'Votre boîte mail est maintenant synchronisée'
      });
    }, 2000);
  };

  const handleDisconnectGmail = () => {
    if (confirm('Êtes-vous sûr de vouloir déconnecter Gmail ?')) {
      setIsConnected(false);
      setLastSync(null);
      toast.success('Gmail déconnecté');
    }
  };

  const handleManualSync = () => {
    toast.info('Synchronisation en cours...', {
      description: 'Importation des nouveaux emails'
    });
    
    setTimeout(() => {
      setLastSync(new Date());
      toast.success('Synchronisation terminée', {
        description: '12 nouveaux emails importés'
      });
    }, 1500);
  };

  const handleTestConnection = () => {
    toast.info('Test de connexion...', {
      description: 'Vérification de l\'accès à Gmail'
    });
    
    setTimeout(() => {
      toast.success('Connexion OK', {
        description: 'L\'accès à Gmail fonctionne correctement'
      });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* État de la connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Connexion Gmail
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  {isConnected ? 'Gmail connecté' : 'Gmail non connecté'}
                </p>
                <p className="text-sm text-gray-600">
                  {isConnected 
                    ? 'Synchronisation active avec votre compte Google'
                    : 'Connectez votre compte Gmail pour synchroniser vos emails'
                  }
                </p>
              </div>
            </div>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Actif' : 'Inactif'}
            </Badge>
          </div>

          <div className="flex space-x-2">
            {!isConnected ? (
              <Button onClick={handleConnectGmail} className="bg-blue-600 hover:bg-blue-700">
                <LinkIcon className="h-4 w-4 mr-2" />
                Connecter Gmail
              </Button>
            ) : (
              <>
                <Button onClick={handleTestConnection} variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tester la connexion
                </Button>
                <Button onClick={handleDisconnectGmail} variant="outline" className="text-red-600">
                  Déconnecter
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Paramètres de synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Synchronisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sync-enabled">Synchronisation activée</Label>
              <p className="text-sm text-gray-600">
                Importer automatiquement les emails de Gmail
              </p>
            </div>
            <Switch
              id="sync-enabled"
              checked={syncEnabled}
              onCheckedChange={setSyncEnabled}
              disabled={!isConnected}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-sync">Synchronisation automatique</Label>
              <p className="text-sm text-gray-600">
                Synchroniser périodiquement sans intervention
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={setAutoSync}
              disabled={!isConnected || !syncEnabled}
            />
          </div>

          {autoSync && syncEnabled && (
            <div>
              <Label htmlFor="sync-interval">Intervalle de synchronisation (minutes)</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  id="sync-interval"
                  type="number"
                  min="1"
                  max="60"
                  value={syncInterval}
                  onChange={(e) => setSyncInterval(parseInt(e.target.value) || 5)}
                  className="w-20"
                  disabled={!isConnected}
                />
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="flex items-center justify-between pt-4 border-t">
              <div>
                <p className="text-sm font-medium">Dernière synchronisation</p>
                <p className="text-sm text-gray-600">
                  {lastSync ? lastSync.toLocaleString('fr-FR') : 'Jamais'}
                </p>
              </div>
              <Button onClick={handleManualSync} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Synchroniser maintenant
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration avancée */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configuration avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Synchroniser les emails envoyés</Label>
              <Switch defaultChecked disabled={!isConnected} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Synchroniser les brouillons</Label>
              <Switch defaultChecked disabled={!isConnected} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Synchroniser les emails archivés</Label>
              <Switch disabled={!isConnected} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Notification des nouveaux emails</Label>
              <Switch defaultChecked disabled={!isConnected} />
            </div>
          </div>

          {isConnected && (
            <div className="pt-4 border-t">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Permissions accordées:</strong> Lecture et envoi d'emails, 
                  accès aux contacts, gestion des libellés
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informations et aide */}
      <Card>
        <CardHeader>
          <CardTitle>Informations importantes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <p>
                La synchronisation Gmail utilise l'API Google et respecte toutes les 
                politiques de sécurité et de confidentialité de Google.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <p>
                Vos emails sont synchronisés de manière sécurisée et ne sont stockés 
                que le temps nécessaire au traitement.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5" />
              <p>
                Vous pouvez révoquer l'accès à tout moment depuis votre compte Google 
                ou depuis cette interface.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
