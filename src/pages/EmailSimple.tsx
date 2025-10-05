import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmailDiagnostic } from '@/components/EmailDiagnostic';
import { UnifiedEmailManager } from '@/components/UnifiedEmailManager';
import { SyncManager } from '@/components/SyncManager';
import { EmailProviderConfig } from '@/components/email/EmailProviderConfig';
import { EmailAnalytics } from '@/components/EmailAnalytics';
import { EmailSender } from '@/components/EmailSender';
import { EmailTemplateManager } from '@/components/email/EmailTemplateManager';
import { Settings, Inbox, Gauge, RefreshCw, TrendingUp, Send, Mail, FileText } from 'lucide-react';

const Email: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestion des emails</h1>
            <p className="text-muted-foreground">Centre de communication email professionnel</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            Boîte
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Envoyer
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="diagnostic" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Diagnostic
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Modèles
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Config
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Emails unifiés</CardTitle>
              <CardDescription>
                Vue d'ensemble de tous vos emails reçus et envoyés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnifiedEmailManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="send" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envoi d'emails</CardTitle>
              <CardDescription>
                Composez et envoyez vos emails rapidement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailSender />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="space-y-6">
          <SyncManager />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Email</CardTitle>
              <CardDescription>
                Statistiques et performances de vos campagnes email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmailAnalytics />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-6">
          <EmailDiagnostic />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Modèles d'email</CardTitle>
              <CardDescription>Créez, gérez et réutilisez vos modèles</CardDescription>
            </CardHeader>
            <CardContent>
              <EmailTemplateManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <EmailProviderConfig />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Email;