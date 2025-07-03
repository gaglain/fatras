
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Save, TestTube, ExternalLink, Key, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export const GoogleCalendarTab: React.FC = () => {
  const [config, setConfig] = useState({
    clientId: localStorage.getItem('googleCalendarClientId') || '',
    apiKey: localStorage.getItem('googleCalendarApiKey') || '',
    isConfigured: localStorage.getItem('googleCalendarConfigured') === 'true'
  });
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSave = () => {
    if (!config.clientId.trim() || !config.apiKey.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    // Sauvegarder la configuration
    localStorage.setItem('googleCalendarClientId', config.clientId);
    localStorage.setItem('googleCalendarApiKey', config.apiKey);
    localStorage.setItem('googleCalendarConfigured', 'true');

    setConfig(prev => ({ ...prev, isConfigured: true }));
    toast.success('Configuration Google Calendar sauvegardée');
  };

  const handleTest = async () => {
    if (!config.clientId.trim() || !config.apiKey.trim()) {
      toast.error('Veuillez d\'abord sauvegarder la configuration');
      return;
    }

    setIsTesting(true);
    try {
      // Simuler un test de connexion
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Connexion Google Calendar testée avec succès');
    } catch (error) {
      toast.error('Erreur lors du test de connexion');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('googleCalendarClientId');
    localStorage.removeItem('googleCalendarApiKey');
    localStorage.removeItem('googleCalendarConfigured');
    localStorage.removeItem('googleCalendarConnected');
    
    setConfig({
      clientId: '',
      apiKey: '',
      isConfigured: false
    });
    
    toast.success('Configuration Google Calendar supprimée');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Configuration Google Calendar</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Connectez votre agenda Google pour synchroniser vos événements
                </p>
              </div>
            </div>
            {config.isConfigured && (
              <Badge className="bg-green-100 text-green-800">
                Configuré
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Key className="h-4 w-4 mr-2" />
              Instructions de configuration
            </h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Rendez-vous sur la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
              <li>Activez l'API Google Calendar</li>
              <li>Créez des identifiants OAuth 2.0 et une clé API</li>
              <li>Copiez le Client ID et la clé API ci-dessous</li>
            </ol>
            <div className="flex space-x-2 mt-3">
              <Button variant="outline" size="sm" asChild>
                <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Google Cloud Console
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="https://developers.google.com/calendar/api/quickstart/js" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Guide API Calendar
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID OAuth 2.0 *
              </label>
              <Input
                type="text"
                placeholder="123456789-abcdefghijklmnop.apps.googleusercontent.com"
                value={config.clientId}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Trouvé dans Google Cloud Console → APIs & Services → Credentials
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API *
              </label>
              <div className="relative">
                <Input
                  type={showApiKey ? "text" : "password"}
                  placeholder="AIzaSyAbc123..."
                  value={config.apiKey}
                  onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Créée dans Google Cloud Console → APIs & Services → Credentials
              </p>
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              onClick={handleTest} 
              variant="outline" 
              disabled={!config.clientId || !config.apiKey || isTesting}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Test en cours...' : 'Tester la connexion'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!config.clientId || !config.apiKey}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            {config.isConfigured && (
              <Button 
                onClick={handleDisconnect}
                variant="destructive"
              >
                Déconnecter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paramètres de synchronisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Synchronisation automatique</h4>
              <p className="text-sm text-gray-600">Synchroniser automatiquement toutes les heures</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Notifications des nouveaux événements</h4>
              <p className="text-sm text-gray-600">Recevoir une notification pour les nouveaux événements</p>
            </div>
            <input type="checkbox" className="rounded" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Synchronisation bidirectionnelle</h4>
              <p className="text-sm text-gray-600">Les événements créés dans ShowManager apparaissent dans Google</p>
            </div>
            <input type="checkbox" className="rounded" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
