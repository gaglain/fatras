
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, ExternalLink, Check, AlertCircle } from 'lucide-react';

export const GoogleCalendarSetup: React.FC = () => {
  const [config, setConfig] = useState({
    clientId: '',
    clientSecret: '',
    redirectUri: `${window.location.origin}/oauth/calendar/callback`,
    isConfigured: false
  });

  React.useEffect(() => {
    // Charger la configuration sauvegardée
    const savedConfig = localStorage.getItem('calendarConfig');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig({ ...config, ...parsed });
      } catch (error) {
        console.error('Error loading Calendar config:', error);
      }
    }
  }, []);

  const saveConfiguration = () => {
    if (!config.clientId || !config.clientSecret) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const configToSave = {
      ...config,
      isConfigured: true
    };

    localStorage.setItem('calendarConfig', JSON.stringify(configToSave));
    setConfig(configToSave);
    toast.success('Configuration Google Calendar sauvegardée !');
  };

  const testConnection = () => {
    if (!config.isConfigured) {
      toast.error('Veuillez d\'abord sauvegarder la configuration');
      return;
    }

    toast.success('Test de connexion réussi ! (simulation)');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5" />
          <span>Configuration Google Calendar</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-lg space-y-2">
          <h4 className="font-medium text-blue-900 flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Étapes de configuration
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 ml-6 list-decimal">
            <li>Allez sur <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
            <li>Créez un nouveau projet ou sélectionnez un projet existant</li>
            <li>Activez l'API Google Calendar</li>
            <li>Créez des identifiants OAuth 2.0</li>
            <li>Copiez le Client ID et Client Secret ci-dessous</li>
          </ol>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              type="text"
              placeholder="xxx.apps.googleusercontent.com"
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="clientSecret">Client Secret *</Label>
            <Input
              id="clientSecret"
              type="password"
              placeholder="GOCSPX-xxxxx"
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="redirectUri">URI de redirection (à copier dans Google Cloud)</Label>
            <div className="flex space-x-2">
              <Input
                id="redirectUri"
                type="text"
                value={config.redirectUri}
                readOnly
                className="bg-gray-50"
              />
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(config.redirectUri);
                  toast.success('URI copiée !');
                }}
              >
                Copier
              </Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 pt-4">
          <Button onClick={saveConfiguration} className="flex-1">
            Sauvegarder la configuration
          </Button>
          <Button 
            variant="outline" 
            onClick={testConnection}
            disabled={!config.isConfigured}
          >
            <Check className="h-4 w-4 mr-2" />
            Tester
          </Button>
        </div>

        {config.isConfigured && (
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-green-800 text-sm flex items-center">
              <Check className="h-4 w-4 mr-2" />
              Google Calendar est configuré et prêt à être utilisé
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
