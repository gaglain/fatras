import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Mail, Save, TestTube } from 'lucide-react';

export const SmtpTab = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [config, setConfig] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_user: '',
    smtp_password: '',
    smtp_from: '',
  });

  useEffect(() => {
    loadConfig();
  }, [user]);

  const loadConfig = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('app_settings')
      .select('setting_key, setting_value')
      .eq('user_id', user.id)
      .in('setting_key', Object.keys(config));

    if (data) {
      const newConfig = { ...config };
      data.forEach(item => {
        newConfig[item.setting_key as keyof typeof config] = item.setting_value;
      });
      setConfig(newConfig);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Supprimer les anciennes configs
      await supabase
        .from('app_settings')
        .delete()
        .eq('user_id', user.id)
        .in('setting_key', Object.keys(config));

      // Insérer les nouvelles
      const settings = Object.entries(config).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        setting_value: value,
      }));

      const { error } = await supabase
        .from('app_settings')
        .insert(settings);

      if (error) throw error;

      toast.success('Configuration SMTP enregistrée');
    } catch (error: any) {
      toast.error(`Erreur: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConfig = async () => {
    if (!user) return;

    setTesting(true);
    try {
      const { invokeEdgeFunction } = await import('@/lib/edgeFunctionClient');
      const result = await invokeEdgeFunction<{ success: boolean; error?: string }>({
        functionName: 'send-email-smtp',
        body: {
          to: [config.smtp_from],
          subject: 'Test SMTP Fatras',
          html: '<h1>Test réussi !</h1><p>Votre configuration SMTP fonctionne correctement.</p>',
          from: config.smtp_from,
          userId: user.id,
        }
      });

      if (!result.success || !result.data?.success) throw new Error(result.error || result.data?.error || 'Échec du test');
      toast.success('Email de test envoyé avec succès !');
    } catch (error: any) {
      toast.error(`Échec du test: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Configuration SMTP
          </CardTitle>
          <CardDescription>
            Configurez votre serveur SMTP pour envoyer des emails. 
            Les emails envoyés seront automatiquement synchronisés avec votre compte IMAP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="smtp_host">Serveur SMTP</Label>
              <Input
                id="smtp_host"
                placeholder="pro1.mail.ovh.net"
                value={config.smtp_host}
                onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp_port">Port SMTP</Label>
              <Input
                id="smtp_port"
                type="number"
                placeholder="587"
                value={config.smtp_port}
                onChange={(e) => setConfig({ ...config, smtp_port: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Port 587 (STARTTLS) recommandé, ou 465 (SSL)
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp_user">Nom d'utilisateur</Label>
              <Input
                id="smtp_user"
                placeholder="booking@fatras.net"
                value={config.smtp_user}
                onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp_password">Mot de passe</Label>
              <Input
                id="smtp_password"
                type="password"
                placeholder="••••••••"
                value={config.smtp_password}
                onChange={(e) => setConfig({ ...config, smtp_password: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="smtp_from">Email expéditeur par défaut</Label>
              <Input
                id="smtp_from"
                type="email"
                placeholder="booking@fatras.net"
                value={config.smtp_from}
                onChange={(e) => setConfig({ ...config, smtp_from: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={saveConfig}
              disabled={loading}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
            <Button
              onClick={testConfig}
              disabled={testing || !config.smtp_host}
              variant="outline"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {testing ? 'Test...' : 'Tester'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            ✅ Les emails envoyés via l'application seront envoyés via SMTP
          </p>
          <p>
            ✅ Les emails envoyés seront enregistrés dans la base de données
          </p>
          <p>
            ✅ La synchronisation IMAP récupère automatiquement les nouveaux emails
          </p>
          <p>
            ✅ Des notifications sont créées pour chaque nouvel email reçu
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
