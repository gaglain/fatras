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
import { EmailTemplateComposer } from '@/components/email/EmailTemplateComposer';
import { Settings, Inbox, Gauge, RefreshCw, TrendingUp, Send, Mail, FileText } from 'lucide-react';

const Email: React.FC = () => {
  const [activeTab, setActiveTab] = useState('inbox');

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-primary/10 text-primary shrink-0">
          <Mail className="h-5 w-5 md:h-6 md:w-6" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold tracking-tight">Gestion des emails</h1>
          <p className="text-muted-foreground text-sm md:text-base truncate">Centre de communication email</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-7 gap-1">
            <TabsTrigger value="inbox" className="flex items-center gap-1.5 px-3 shrink-0">
              <Inbox className="h-4 w-4" />
              <span className="hidden sm:inline">Boîte</span>
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-1.5 px-3 shrink-0">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Envoyer</span>
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-1.5 px-3 shrink-0">
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Sync</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-1.5 px-3 shrink-0">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="diagnostic" className="flex items-center gap-1.5 px-3 shrink-0">
              <Gauge className="h-4 w-4" />
              <span className="hidden sm:inline">Diag</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-1.5 px-3 shrink-0">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Modèles</span>
            </TabsTrigger>
            <TabsTrigger value="config" className="flex items-center gap-1.5 px-3 shrink-0">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>
        </div>

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
              <EmailTemplateComposer />
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