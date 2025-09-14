import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNylasEmail } from '@/hooks/useNylasEmail';
import { Mail, Plus, RefreshCw, Send, Settings, TestTube } from 'lucide-react';
import { toast } from 'sonner';

interface EmailConfig {
  email: string;
  password?: string;
  host?: string;
  port?: number;
  ssl?: boolean;
}

export const NylasEmailManager: React.FC = () => {
  const { accounts, isLoading, connectAccount, loadAccounts, syncEmails, sendEmail, testConnection, testImap, testSmtp } = useNylasEmail();
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [provider, setProvider] = useState<'gmail' | 'outlook' | 'imap'>('gmail');
  const [config, setConfig] = useState<EmailConfig>({
    email: '',
    password: '',
    host: '',
    port: 993,
    ssl: true
  });

  const [emailDraft, setEmailDraft] = useState({
    to: '',
    subject: '',
    content: '',
    html: ''
  });

  const [selectedAccount, setSelectedAccount] = useState<string>('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const handleConnectAccount = async () => {
    try {
      await connectAccount(provider, config);
      setShowAddAccount(false);
      setConfig({
        email: '',
        password: '',
        host: '',
        port: 993,
        ssl: true
      });
    } catch (error) {
      console.error('Failed to connect account:', error);
    }
  };

  const handleSyncEmails = async (accountId: string) => {
    try {
      await syncEmails(accountId);
    } catch (error) {
      console.error('Failed to sync emails:', error);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedAccount) {
      toast.error('Please select an account first');
      return;
    }

    try {
      await sendEmail(selectedAccount, emailDraft);
      setEmailDraft({
        to: '',
        subject: '',
        content: '',
        html: ''
      });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const handleTestImap = async () => {
    try {
      await testImap({ host: config.host || 'pro1.mail.ovh.net', port: config.port || 993 });
    } catch (error) {
      console.error('Failed to test IMAP:', error);
    }
  };

  const handleTestSmtp = async () => {
    try {
      const host = config.host || 'pro1.mail.ovh.net';
      const first = await testSmtp({ host, port: 465 });
      if (!first?.success) {
        await testSmtp({ host, port: 587 });
      }
    } catch (error) {
      console.error('Failed to test SMTP:', error);
    }
  };

  const handleTestConnection = async (accountId: string) => {
    try {
      await testConnection(accountId);
    } catch (error) {
      console.error('Failed to test connection:', error);
    }
  };
  const getProviderConfig = (provider: string) => {
    switch (provider) {
      case 'gmail':
        return { host: 'imap.gmail.com', port: 993, ssl: true };
      case 'outlook':
        return { host: 'outlook.office365.com', port: 993, ssl: true };
      case 'imap':
        return { host: 'pro1.mail.ovh.net', port: 993, ssl: true }; // OVH default
      default:
        return { host: '', port: 993, ssl: true };
    }
  };

  const updateConfigForProvider = (newProvider: 'gmail' | 'outlook' | 'imap') => {
    setProvider(newProvider);
    const providerConfig = getProviderConfig(newProvider);
    setConfig(prev => ({
      ...prev,
      ...providerConfig
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion Email Universelle</h2>
          <p className="text-muted-foreground">
            Gérez tous vos comptes email (Gmail, Outlook, OVH) depuis une interface unique
          </p>
        </div>
        <Button 
          onClick={() => setShowAddAccount(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Ajouter un compte
        </Button>
      </div>

      <Tabs defaultValue="accounts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="accounts">Comptes</TabsTrigger>
          <TabsTrigger value="compose">Composer</TabsTrigger>
          <TabsTrigger value="inbox">Boîte de réception</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          {/* Add Account Form */}
          {showAddAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Ajouter un compte email</CardTitle>
                <CardDescription>
                  Connectez votre compte Gmail, Outlook ou tout autre provider IMAP/SMTP
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  <Select value={provider} onValueChange={updateConfigForProvider}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gmail">Gmail</SelectItem>
                      <SelectItem value="outlook">Outlook</SelectItem>
                      <SelectItem value="imap">IMAP/SMTP (OVH, etc.)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={config.email}
                    onChange={(e) => setConfig(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="votre@email.com"
                  />
                </div>

                {provider === 'imap' && (
                  <>
                    <div>
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        value={config.password}
                        onChange={(e) => setConfig(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Mot de passe ou mot de passe d'application"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="host">Serveur IMAP</Label>
                        <Input
                          id="host"
                          value={config.host}
                          onChange={(e) => setConfig(prev => ({ ...prev, host: e.target.value }))}
                          placeholder="imap.provider.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="port">Port</Label>
                        <Input
                          id="port"
                          type="number"
                          value={config.port}
                          onChange={(e) => setConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" variant="outline" onClick={handleTestImap} disabled={isLoading}>
                        Tester IMAP
                      </Button>
                      <Button type="button" variant="outline" onClick={handleTestSmtp} disabled={isLoading}>
                        Tester SMTP (465/587)
                      </Button>
                    </div>
                  </>
                )}

                {(provider === 'gmail' || provider === 'outlook') && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Pour {provider}, vous serez redirigé vers la page d'autorisation OAuth.
                      Assurez-vous d'autoriser l'accès à vos emails.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleConnectAccount}
                    disabled={isLoading || !config.email}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    {isLoading ? 'Connexion...' : 'Connecter'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddAccount(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Connected Accounts */}
          <div className="grid gap-4">
            {accounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{account.email}</p>
                        <p className="text-sm text-muted-foreground">
                          Provider: {account.provider}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={account.is_active ? 'default' : 'secondary'}>
                        {account.is_active ? 'Actif' : 'Inactif'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTestConnection(account.id)}
                        disabled={isLoading}
                      >
                        <TestTube className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSyncEmails(account.id)}
                        disabled={isLoading}
                      >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                  {account.last_sync_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Dernière sync: {new Date(account.last_sync_at).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {accounts.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center">
                <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Aucun compte email connecté. Ajoutez votre premier compte pour commencer.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Composer un email</CardTitle>
              <CardDescription>
                Envoyez des emails depuis n'importe lequel de vos comptes connectés
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="account">Compte expéditeur</Label>
                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un compte" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.filter(acc => acc.is_active).map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.email} ({account.provider})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="to">Destinataire</Label>
                <Input
                  id="to"
                  type="email"
                  value={emailDraft.to}
                  onChange={(e) => setEmailDraft(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="destinataire@email.com"
                />
              </div>

              <div>
                <Label htmlFor="subject">Sujet</Label>
                <Input
                  id="subject"
                  value={emailDraft.subject}
                  onChange={(e) => setEmailDraft(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Sujet de l'email"
                />
              </div>

              <div>
                <Label htmlFor="content">Message</Label>
                <textarea
                  id="content"
                  className="w-full min-h-[200px] p-3 border rounded-md"
                  value={emailDraft.content}
                  onChange={(e) => setEmailDraft(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Votre message..."
                />
              </div>

              <Button 
                onClick={handleSendEmail}
                disabled={isLoading || !selectedAccount || !emailDraft.to || !emailDraft.subject}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isLoading ? 'Envoi...' : 'Envoyer'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inbox" className="space-y-4">
          <Card>
            <CardContent className="p-6 text-center">
              <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                La boîte de réception sera disponible après synchronisation des emails.
                Utilisez le bouton de synchronisation dans l'onglet "Comptes".
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};