import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Send, TestTube } from 'lucide-react';

export const EmailSmtpConfig = () => {
  const { user } = useAuth();
  const [config, setConfig] = useState({
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadConfig();
    }
  }, [user]);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user!.id)
        .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password']);

      if (error) throw error;

      const configMap = data?.reduce((acc: any, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {}) || {};

      setConfig({
        smtp_host: configMap.smtp_host || '',
        smtp_port: configMap.smtp_port || '587',
        smtp_username: configMap.smtp_username || '',
        smtp_password: configMap.smtp_password || ''
      });
    } catch (error) {
      console.error('Error loading SMTP config:', error);
    }
  };

  const saveConfig = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Supprimer les anciens paramètres
      await supabase
        .from('app_settings')
        .delete()
        .eq('user_id', user.id)
        .in('setting_key', ['smtp_host', 'smtp_port', 'smtp_username', 'smtp_password']);

      // Insérer les nouveaux paramètres
      const settings = Object.entries(config).map(([key, value]) => ({
        user_id: user.id,
        setting_key: key,
        setting_value: value
      }));

      const { error } = await supabase
        .from('app_settings')
        .insert(settings);

      if (error) throw error;

      toast.success('Configuration SMTP sauvegardée');
    } catch (error) {
      console.error('Error saving SMTP config:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const testEmail = async () => {
    if (!user) return;

    setTestLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-email-ovh', {
        body: {
          to: [user.email],
          subject: 'Test de configuration SMTP',
          html: `
            <h2>Test de configuration SMTP</h2>
            <p>Si vous recevez cet email, votre configuration SMTP fonctionne correctement !</p>
            <p>Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
          `,
          fromName: 'Test SMTP',
          userId: user.id
        }
      });

      if (error) throw error;

      toast.success('Email de test envoyé ! Vérifiez votre boîte mail.');
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error(`Erreur lors de l'envoi : ${error.message}`);
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Configuration SMTP
        </CardTitle>
        <CardDescription>
          Configurez votre serveur SMTP pour envoyer des emails. OVH recommandé.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            <strong>Configuration OVH recommandée :</strong><br />
            • Serveur SMTP : ssl0.ovh.net<br />
            • Port : 587<br />
            • Utilisateur : votre adresse email complète<br />
            • Mot de passe : votre mot de passe email
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="smtp_host">Serveur SMTP</Label>
            <Input
              id="smtp_host"
              value={config.smtp_host}
              onChange={(e) => setConfig(prev => ({ ...prev, smtp_host: e.target.value }))}
              placeholder="ssl0.ovh.net"
            />
          </div>
          <div>
            <Label htmlFor="smtp_port">Port</Label>
            <Input
              id="smtp_port"
              value={config.smtp_port}
              onChange={(e) => setConfig(prev => ({ ...prev, smtp_port: e.target.value }))}
              placeholder="587"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="smtp_username">Utilisateur (email)</Label>
          <Input
            id="smtp_username"
            type="email"
            value={config.smtp_username}
            onChange={(e) => setConfig(prev => ({ ...prev, smtp_username: e.target.value }))}
            placeholder="votre@email.com"
          />
        </div>

        <div>
          <Label htmlFor="smtp_password">Mot de passe</Label>
          <Input
            id="smtp_password"
            type="password"
            value={config.smtp_password}
            onChange={(e) => setConfig(prev => ({ ...prev, smtp_password: e.target.value }))}
            placeholder="••••••••"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={saveConfig} disabled={loading}>
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
          <Button 
            variant="outline" 
            onClick={testEmail} 
            disabled={testLoading || !config.smtp_username || !config.smtp_password}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testLoading ? 'Test...' : 'Tester l\'envoi'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};