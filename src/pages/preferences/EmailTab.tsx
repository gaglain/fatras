import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Settings, Server, TestTube, ExternalLink, RefreshCw, Inbox, Zap } from 'lucide-react';
import { EmailSignatureManager } from '@/components/email/EmailSignatureManager';
import { EmailSmtpConfig } from '@/components/EmailSmtpConfig';
import { NylasEmailManager } from '@/components/email/NylasEmailManager';
import { NylasEmailTest } from '@/components/email/NylasEmailTest';
import { useEmailSender } from '@/hooks/useEmailSender';
import { useEmailSync } from '@/hooks/useEmailSync';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const EmailTab: React.FC = () => {
  const { user } = useAuth();
  const { sendEmail } = useEmailSender();
  const { syncEmails, testImapConnection, isLoading: isSyncing } = useEmailSync();
  const [showSignatureManager, setShowSignatureManager] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    provider: 'ovh',
    smtp_host: '',
    smtp_port: '587',
    smtp_username: '',
    smtp_password: '',
    imap_host: '',
    imap_port: '993',
    imap_username: '',
    imap_password: '',
    imap_security: 'starttls',
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
        .in('setting_key', ['email_provider', 'smtp_host', 'smtp_port', 'smtp_username', 'smtp_password', 'imap_host', 'imap_port', 'imap_username', 'imap_password', 'imap_security', 'from_email', 'from_name']);
      
      if (error) throw error;
      
      const config = { ...emailConfig };
      data?.forEach(setting => {
        if (setting.setting_key === 'email_provider') config.provider = setting.setting_value;
        if (setting.setting_key === 'smtp_host') config.smtp_host = setting.setting_value;
        if (setting.setting_key === 'smtp_port') config.smtp_port = setting.setting_value;
        if (setting.setting_key === 'smtp_username') config.smtp_username = setting.setting_value;
        if (setting.setting_key === 'smtp_password') config.smtp_password = setting.setting_value;
        if (setting.setting_key === 'imap_host') config.imap_host = setting.setting_value;
        if (setting.setting_key === 'imap_port') config.imap_port = setting.setting_value;
        if (setting.setting_key === 'imap_username') config.imap_username = setting.setting_value;
        if (setting.setting_key === 'imap_password') config.imap_password = setting.setting_value;
        if (setting.setting_key === 'imap_security') config.imap_security = (setting.setting_value || 'starttls');
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
        { setting_key: 'imap_host', setting_value: emailConfig.imap_host },
        { setting_key: 'imap_port', setting_value: emailConfig.imap_port },
        { setting_key: 'imap_username', setting_value: emailConfig.imap_username },
        { setting_key: 'imap_security', setting_value: emailConfig.imap_security },
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

      // Sauvegarder les mots de passe de manière sécurisée si fournis
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

      if (emailConfig.imap_password) {
        await supabase
          .from('app_settings')
          .upsert({
            user_id: user.id,
            setting_key: 'imap_password',
            setting_value: emailConfig.imap_password
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
        return { 
          smtp_host: 'pro1.mail.ovh.net', 
          smtp_port: '587',
          imap_host: 'pro1.mail.ovh.net',
          imap_port: '993',
          imap_security: 'ssl'
        } as const;
      case 'gmail':
        return { 
          smtp_host: 'smtp.gmail.com', 
          smtp_port: '587',
          imap_host: 'imap.gmail.com',
          imap_port: '993',
          imap_security: 'ssl'
        } as const;
      case 'outlook':
        return { 
          smtp_host: 'smtp-mail.outlook.com', 
          smtp_port: '587',
          imap_host: 'outlook.office365.com',
          imap_port: '993',
          imap_security: 'ssl'
        } as const;
      default:
        return { smtp_host: '', smtp_port: '587', imap_host: '', imap_port: '993', imap_security: 'ssl' } as const;
    }
  };

  const handleProviderChange = (provider: string) => {
    const config = getProviderConfig(provider);
    setEmailConfig(prev => ({
      ...prev,
      provider,
      smtp_host: config.smtp_host,
      smtp_port: config.smtp_port,
      imap_host: config.imap_host,
      imap_port: config.imap_port,
      imap_security: config.imap_security
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configuration Email</h2>
          <p className="text-muted-foreground">
            Gérez vos paramètres d'envoi et de réception d'emails
          </p>
        </div>
      </div>

      <Tabs defaultValue="nylas" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="nylas" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Nylas (Universel)
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            IMAP/SMTP
          </TabsTrigger>
          <TabsTrigger value="resend" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            Resend
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nylas" className="space-y-4">
          <NylasEmailManager />
          <NylasEmailTest />
        </TabsContent>

        <TabsContent value="legacy" className="space-y-6">
          <EmailSmtpConfig />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Réception d'emails via IMAP
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg border border-amber-200 dark:border-amber-800">
                <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                  Paramètres IMAP recommandés (OVH)
                </h4>
                <div className="text-sm text-amber-800 dark:text-amber-200 space-y-1">
                  <p>Hôte conseillé: <strong>pro1.mail.ovh.net</strong></p>
                  <p>Port: <strong>993</strong> • Sécurité: <strong>SSL/TLS</strong></p>
                  <p className="mt-2">Mettez à jour ci-dessous puis « Sauvegarder », ensuite testez et synchronisez.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imap_host">Serveur IMAP</Label>
                  <Input
                    id="imap_host"
                    value={emailConfig.imap_host}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, imap_host: e.target.value }))}
                    placeholder="pro1.mail.ovh.net"
                  />
                </div>
                <div>
                  <Label htmlFor="imap_port">Port</Label>
                  <Input
                    id="imap_port"
                    value={emailConfig.imap_port}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, imap_port: e.target.value }))}
                    placeholder="993"
                  />
                </div>
                <div>
                  <Label htmlFor="imap_username">Utilisateur (email)</Label>
                  <Input
                    id="imap_username"
                    type="email"
                    value={emailConfig.imap_username}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, imap_username: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="imap_password">Mot de passe</Label>
                  <Input
                    id="imap_password"
                    type="password"
                    value={emailConfig.imap_password}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, imap_password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Sécurité</Label>
                  <Select
                    value={emailConfig.imap_security}
                    onValueChange={(v) => setEmailConfig(prev => ({ ...prev, imap_security: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez la sécurité" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ssl">SSL/TLS (993)</SelectItem>
                      <SelectItem value="starttls">STARTTLS (143)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={saveEmailConfig} disabled={isLoading}>
                  {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={testImapConnection}
                  disabled={isSyncing}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  {isSyncing ? 'Test...' : 'Tester la connexion'}
                </Button>
                <Button onClick={() => syncEmails()} disabled={isSyncing}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from_email">Email d'expéditeur par défaut</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={emailConfig.from_email}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, from_email: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="from_name">Nom d'expéditeur par défaut (alias)</Label>
                  <Input
                    id="from_name"
                    value={emailConfig.from_name}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, from_name: e.target.value }))}
                    placeholder="Votre nom ou alias"
                  />
                </div>
              </div>

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
        </TabsContent>

        <TabsContent value="resend" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Configuration Resend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Configuration requise pour l'envoi d'emails
                </h4>
                <div className="text-sm text-blue-700 dark:text-blue-300 space-y-2">
                  <p>1. <strong>Créez un compte Resend :</strong> <a href="https://resend.com" target="_blank" className="underline">https://resend.com</a></p>
                  <p>2. <strong>Validez votre domaine :</strong> <a href="https://resend.com/domains" target="_blank" className="underline">https://resend.com/domains</a></p>
                  <p>3. <strong>Créez une clé API :</strong> <a href="https://resend.com/api-keys" target="_blank" className="underline">https://resend.com/api-keys</a></p>
                  <p>4. <strong>Ajoutez votre clé dans les paramètres de l'application</strong></p>
                </div>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Configuration automatique des emails entrants
                </h4>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-2">
                  <p>✅ <strong>Webhook configuré automatiquement</strong></p>
                  <p>📧 <strong>URL webhook:</strong> https://nhoemjarkxqwruupqgyd.supabase.co/functions/v1/resend-webhook</p>
                  <p>🔧 <strong>Configuration dans Resend:</strong></p>
                  <ol className="list-decimal list-inside ml-4 space-y-1">
                    <li>Allez sur <a href="https://resend.com/webhooks" target="_blank" className="underline font-medium">resend.com/webhooks</a></li>
                    <li>Créez un nouveau webhook avec l'URL ci-dessus</li>
                    <li>Sélectionnez l'événement "email.received"</li>
                    <li>Configurez votre domaine pour recevoir des emails</li>
                  </ol>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://resend.com/webhooks', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Configurer les webhooks Resend
                </Button>
                
                <Button
                  onClick={() => window.open('https://resend.com/domains', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gérer les domaines Resend
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};