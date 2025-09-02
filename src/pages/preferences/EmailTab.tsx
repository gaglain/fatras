import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Settings, Server, TestTube } from 'lucide-react';
import { EmailSignatureManager } from '@/components/email/EmailSignatureManager';
import { useEmailSender } from '@/hooks/useEmailSender';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const EmailTab: React.FC = () => {
  const { user } = useAuth();
  const { sendEmail } = useEmailSender();
  const [showSignatureManager, setShowSignatureManager] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    provider: 'ovh',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    from_email: '',
    from_name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    loadEmailConfig();
  }, [user]);

  const loadEmailConfig = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('user_id', user.id)
        .in('setting_key', ['email_provider', 'smtp_host', 'smtp_port', 'smtp_username', 'from_email', 'from_name']);
      
      if (error) throw error;
      
      const config = { ...emailConfig };
      data?.forEach(setting => {
        if (setting.setting_key === 'email_provider') config.provider = setting.setting_value;
        if (setting.setting_key === 'smtp_host') config.smtp_host = setting.setting_value;
        if (setting.setting_key === 'smtp_port') config.smtp_port = setting.setting_value;
        if (setting.setting_key === 'smtp_username') config.smtp_username = setting.setting_value;
        if (setting.setting_key === 'from_email') config.from_email = setting.setting_value;
        if (setting.setting_key === 'from_name') config.from_name = setting.setting_value;
      });
      setEmailConfig(config);
    } catch (error) {
      console.error('Erreur lors du chargement de la config email:', error);
    }
  };

  const saveEmailConfig = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const settings = [
        { setting_key: 'email_provider', setting_value: emailConfig.provider },
        { setting_key: 'smtp_host', setting_value: emailConfig.smtp_host },
        { setting_key: 'smtp_port', setting_value: emailConfig.smtp_port },
        { setting_key: 'smtp_username', setting_value: emailConfig.smtp_username },
        { setting_key: 'from_email', setting_value: emailConfig.from_email },
        { setting_key: 'from_name', setting_value: emailConfig.from_name }
      ];

      for (const setting of settings) {
        await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            ...setting
          }, {
            onConflict: 'user_id,setting_key'
          });
      }

      // Sauvegarder le mot de passe SMTP de manière sécurisée si fourni
      if (emailConfig.smtp_password) {
        await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            setting_key: 'smtp_password',
            setting_value: emailConfig.smtp_password
          }, {
            onConflict: 'user_id,setting_key'
          });
      }

      toast.success('Configuration email sauvegardée');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const testEmailConfig = async () => {
    if (!emailConfig.from_email) {
      toast.error('Veuillez configurer l\'email d\'envoi');
      return;
    }

    setIsTesting(true);
    try {
      await sendEmail({
        to: [emailConfig.from_email],
        subject: 'Test de configuration email',
        html: `
          <h2>Test de configuration email</h2>
          <p>Ce message confirme que votre configuration email fonctionne correctement.</p>
          <p>Configuré avec ${emailConfig.provider} - ${emailConfig.smtp_host}:${emailConfig.smtp_port}</p>
          <p>Envoyé le ${new Date().toLocaleString('fr-FR')}</p>
        `
      });
      toast.success('Email de test envoyé avec succès !');
    } catch (error) {
      console.error('Erreur lors du test email:', error);
      toast.error('Erreur lors de l\'envoi du test email');
    } finally {
      setIsTesting(false);
    }
  };

  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case 'ovh':
        return { host: 'ssl0.ovh.net', port: '587' };
      case 'gmail':
        return { host: 'smtp.gmail.com', port: '587' };
      case 'outlook':
        return { host: 'smtp-mail.outlook.com', port: '587' };
      default:
        return { host: '', port: '587' };
    }
  };

  const handleProviderChange = (provider: string) => {
    const config = getProviderConfig(provider);
    setEmailConfig(prev => ({
      ...prev,
      provider,
      smtp_host: config.host,
      smtp_port: config.port
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Configuration serveur email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Fournisseur email</Label>
              <Select value={emailConfig.provider} onValueChange={handleProviderChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ovh">OVH</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="outlook">Outlook</SelectItem>
                  <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_host">Serveur SMTP</Label>
              <Input
                id="smtp_host"
                value={emailConfig.smtp_host}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, smtp_host: e.target.value }))}
                placeholder="smtp.example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_port">Port SMTP</Label>
              <Input
                id="smtp_port"
                value={emailConfig.smtp_port}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, smtp_port: e.target.value }))}
                placeholder="587"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_username">Nom d'utilisateur</Label>
              <Input
                id="smtp_username"
                value={emailConfig.smtp_username}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, smtp_username: e.target.value }))}
                placeholder="votre@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp_password">Mot de passe</Label>
              <Input
                id="smtp_password"
                type="password"
                value={emailConfig.smtp_password}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, smtp_password: e.target.value }))}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_email">Email d'envoi</Label>
              <Input
                id="from_email"
                value={emailConfig.from_email}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, from_email: e.target.value }))}
                placeholder="noreply@votredomaine.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from_name">Nom d'expéditeur</Label>
              <Input
                id="from_name"
                value={emailConfig.from_name}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, from_name: e.target.value }))}
                placeholder="Votre Organisation"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveEmailConfig} disabled={isLoading}>
              {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
            <Button 
              variant="outline" 
              onClick={testEmailConfig} 
              disabled={isTesting || !emailConfig.from_email}
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isTesting ? 'Test en cours...' : 'Tester la configuration'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Signature email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <Button
              onClick={() => setShowSignatureManager(true)}
              variant="outline"
              className="justify-start"
            >
              <Settings className="h-4 w-4 mr-2" />
              Gérer la signature email
            </Button>
          </div>
        </CardContent>
      </Card>

      <EmailSignatureManager
        isOpen={showSignatureManager}
        onClose={() => setShowSignatureManager(false)}
      />
    </div>
  );
};