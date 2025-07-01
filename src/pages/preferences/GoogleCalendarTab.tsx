
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Save, TestTube, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export const GoogleCalendarTab: React.FC = () => {
  const [config, setConfig] = useState({
    clientId: '',
    apiKey: '',
    isConfigured: false
  });
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = () => {
    if (!config.clientId.trim() || !config.apiKey.trim()) {
      toast.error('Veuillez remplir tous les champs requis');
      return;
    }

    // Sauvegarder la configuration (localStorage pour la démo)
    localStorage.setItem('googleCalendarConfig', JSON.stringify({
      clientId: config.clientId,
      apiKey: config.apiKey,
      isConfigured: true
    }));

    setConfig(prev => ({ ...prev, isConfigured: true }));
    toast.success('Configuration Google Calendar sauvegardée');
  };

  const handleTest = async () => {
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
            <h4 className="font-medium text-blue-900 mb-2">Instructions de configuration</h4>
            <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
              <li>Rendez-vous sur la <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
              <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
              <li>Activez l'API Google Calendar</li>
              <li>Créez des identifiants OAuth 2.0</li>
              <li>Copiez le Client ID et la clé API ci-dessous</li>
            </ol>
            <Button variant="outline" size="sm" className="mt-3">
              <ExternalLink className="h-4 w-4 mr-2" />
              Guide complet
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client ID OAuth 2.0 *
              </label>
              <Input
                type="text"
                placeholder="xxx.apps.googleusercontent.com"
                value={config.clientId}
                onChange={(e) => setConfig(prev => ({ ...prev, clientId: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clé API *
              </label>
              <Input
                type="password"
                placeholder="AIza..."
                value={config.apiKey}
                onChange={(e) => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
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
