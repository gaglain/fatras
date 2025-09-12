import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, Server, Settings, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface EmailProvider {
  id: string;
  name: string;
  type: 'smtp' | 'api';
  icon: React.ReactNode;
  description: string;
}

const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: 'ovh',
    name: 'OVH SMTP',
    type: 'smtp',
    icon: <Server className="h-5 w-5" />,
    description: 'Configuration SMTP OVH pour l\'envoi d\'emails'
  },
  {
    id: 'resend',
    name: 'Resend API',
    type: 'api',
    icon: <Send className="h-5 w-5" />,
    description: 'Service Resend pour l\'envoi d\'emails transactionnels'
  },
  {
    id: 'gmail',
    name: 'Gmail API',
    type: 'api',
    icon: <Mail className="h-5 w-5" />,
    description: 'Intégration Gmail pour réception et envoi'
  }
];

interface EmailConfig {
  provider: string;
  isActive: boolean;
  settings: Record<string, string>;
}

export const EmailProviderConfig: React.FC = () => {
  const { user } = useAuth();
  const [configs, setConfigs] = useState<Record<string, EmailConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);

  // Charger les configurations existantes
  useEffect(() => {
    if (!user) return;

    const loadConfigs = async () => {
      try {
        const { data: settings } = await supabase
          .from('app_settings')
          .select('*')
          .eq('user_id', user.id)
          .like('setting_key', 'email_%');

        const configsByProvider: Record<string, EmailConfig> = {};
        
        EMAIL_PROVIDERS.forEach(provider => {
          configsByProvider[provider.id] = {
            provider: provider.id,
            isActive: false,
            settings: {}
          };
        });

        settings?.forEach(setting => {
          const [, provider, key] = setting.setting_key.split('_');
          if (configsByProvider[provider]) {
            if (key === 'active') {
              configsByProvider[provider].isActive = setting.setting_value === 'true';
            } else {
              configsByProvider[provider].settings[key] = setting.setting_value;
            }
          }
        });

        setConfigs(configsByProvider);
      } catch (error) {
        console.error('Erreur lors du chargement des configurations:', error);
        toast.error('Erreur lors du chargement des configurations');
      } finally {
        setLoading(false);
      }
    };

    loadConfigs();
  }, [user]);

  const updateConfig = (providerId: string, updates: Partial<EmailConfig>) => {
    setConfigs(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        ...updates,
        settings: {
          ...prev[providerId]?.settings,
          ...updates.settings
        }
      }
    }));
  };

  const saveConfig = async (providerId: string) => {
    if (!user) return;

    setSaving(true);
    try {
      const config = configs[providerId];
      const settingsToSave = [
        {
          setting_key: `email_${providerId}_active`,
          setting_value: config.isActive.toString()
        },
        ...Object.entries(config.settings).map(([key, value]) => ({
          setting_key: `email_${providerId}_${key}`,
          setting_value: value
        }))
      ];

      // Supprimer les anciennes configurations
      await supabase
        .from('app_settings')
        .delete()
        .eq('user_id', user.id)
        .like('setting_key', `email_${providerId}_%`);

      // Insérer les nouvelles configurations
      const { error } = await supabase
        .from('app_settings')
        .insert(
          settingsToSave.map(setting => ({
            user_id: user.id,
            ...setting
          }))
        );

      if (error) throw error;

      toast.success(`Configuration ${EMAIL_PROVIDERS.find(p => p.id === providerId)?.name} sauvegardée`);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de la configuration');
    } finally {
      setSaving(false);
    }
  };

  const testProvider = async (providerId: string) => {
    if (!user) return;

    setTestingProvider(providerId);
    try {
      const testEmail = {
        to: [user.email || 'test@example.com'],
        subject: `Test ${EMAIL_PROVIDERS.find(p => p.id === providerId)?.name}`,
        html: `
          <h2>Test d'envoi d'email</h2>
          <p>Ceci est un test de la configuration email via ${EMAIL_PROVIDERS.find(p => p.id === providerId)?.name}.</p>
          <p>Si vous recevez cet email, la configuration fonctionne correctement !</p>
        `,
        userId: user.id
      };

      const functionName = providerId === 'ovh' ? 'send-email-ovh' : 
                          providerId === 'resend' ? 'send-email-resend' : 
                          'send-email';

      const { data, error } = await supabase.functions.invoke(functionName, {
        body: testEmail
      });

      if (error) throw error;

      toast.success(`Email de test envoyé avec succès via ${EMAIL_PROVIDERS.find(p => p.id === providerId)?.name}`);
    } catch (error) {
      console.error('Erreur lors du test:', error);
      toast.error(`Erreur lors du test : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setTestingProvider(null);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Configuration des fournisseurs d'email</h2>
      </div>

      <Tabs defaultValue="ovh" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          {EMAIL_PROVIDERS.map(provider => (
            <TabsTrigger key={provider.id} value={provider.id} className="flex items-center gap-2">
              {provider.icon}
              {provider.name}
              {configs[provider.id]?.isActive && (
                <Badge variant="secondary" className="ml-1 text-xs">Actif</Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {EMAIL_PROVIDERS.map(provider => (
          <TabsContent key={provider.id} value={provider.id}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {provider.icon}
                    <div>
                      <CardTitle>{provider.name}</CardTitle>
                      <CardDescription>{provider.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`${provider.id}-active`}>Actif</Label>
                    <Switch
                      id={`${provider.id}-active`}
                      checked={configs[provider.id]?.isActive || false}
                      onCheckedChange={(checked) => 
                        updateConfig(provider.id, { isActive: checked })
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.id === 'ovh' && (
                  <OVHConfig 
                    config={configs[provider.id] || { provider: 'ovh', isActive: false, settings: {} }}
                    onChange={(settings) => updateConfig(provider.id, { settings })}
                  />
                )}
                {provider.id === 'resend' && (
                  <ResendConfig 
                    config={configs[provider.id] || { provider: 'resend', isActive: false, settings: {} }}
                    onChange={(settings) => updateConfig(provider.id, { settings })}
                  />
                )}
                {provider.id === 'gmail' && (
                  <GmailConfig 
                    config={configs[provider.id] || { provider: 'gmail', isActive: false, settings: {} }}
                    onChange={(settings) => updateConfig(provider.id, { settings })}
                  />
                )}

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    onClick={() => saveConfig(provider.id)}
                    disabled={saving}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                  
                  {configs[provider.id]?.isActive && (
                    <Button 
                      variant="outline"
                      onClick={() => testProvider(provider.id)}
                      disabled={testingProvider === provider.id}
                      className="flex items-center gap-2"
                    >
                      <TestTube className="h-4 w-4" />
                      {testingProvider === provider.id ? 'Test en cours...' : 'Tester'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

// Composants de configuration spécifiques

const OVHConfig: React.FC<{
  config: EmailConfig;
  onChange: (settings: Record<string, string>) => void;
}> = ({ config, onChange }) => {
  const updateSetting = (key: string, value: string) => {
    onChange({ ...config.settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="smtp_host">Serveur SMTP</Label>
          <Input
            id="smtp_host"
            value={config.settings.host || 'ssl0.ovh.net'}
            onChange={(e) => updateSetting('host', e.target.value)}
            placeholder="ssl0.ovh.net"
          />
        </div>
        <div>
          <Label htmlFor="smtp_port">Port</Label>
          <Select 
            value={config.settings.port || '587'} 
            onValueChange={(value) => updateSetting('port', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="587">587 (STARTTLS)</SelectItem>
              <SelectItem value="465">465 (SSL)</SelectItem>
              <SelectItem value="25">25 (Non sécurisé)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
        <Input
          id="smtp_username"
          type="email"
          value={config.settings.username || ''}
          onChange={(e) => updateSetting('username', e.target.value)}
          placeholder="votre-email@domaine.com"
        />
      </div>
      
      <div>
        <Label htmlFor="smtp_password">Mot de passe</Label>
        <Input
          id="smtp_password"
          type="password"
          value={config.settings.password || ''}
          onChange={(e) => updateSetting('password', e.target.value)}
          placeholder="Votre mot de passe SMTP"
        />
      </div>
    </div>
  );
};

const ResendConfig: React.FC<{
  config: EmailConfig;
  onChange: (settings: Record<string, string>) => void;
}> = ({ config, onChange }) => {
  const updateSetting = (key: string, value: string) => {
    onChange({ ...config.settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="resend_api_key">Clé API Resend</Label>
        <Input
          id="resend_api_key"
          type="password"
          value={config.settings.api_key || ''}
          onChange={(e) => updateSetting('api_key', e.target.value)}
          placeholder="re_..."
        />
        <p className="text-sm text-muted-foreground mt-1">
          Obtenez votre clé API sur{' '}
          <a href="https://resend.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            resend.com/api-keys
          </a>
        </p>
      </div>
      
      <div>
        <Label htmlFor="from_email">Email expéditeur</Label>
        <Input
          id="from_email"
          type="email"
          value={config.settings.from_email || ''}
          onChange={(e) => updateSetting('from_email', e.target.value)}
          placeholder="noreply@votredomaine.com"
        />
        <p className="text-sm text-muted-foreground mt-1">
          Vérifiez votre domaine sur{' '}
          <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            resend.com/domains
          </a>
        </p>
      </div>
    </div>
  );
};

const GmailConfig: React.FC<{
  config: EmailConfig;
  onChange: (settings: Record<string, string>) => void;
}> = ({ config, onChange }) => {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Configuration Gmail API
        </h4>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Pour configurer Gmail API, vous devez créer des identifiants OAuth dans Google Cloud Console.
          Cette fonctionnalité sera disponible dans une prochaine mise à jour.
        </p>
      </div>
    </div>
  );
};