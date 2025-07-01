
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Settings, FileText, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminChatNotifications } from '@/components/AdminChatNotifications';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { LegalContentManager } from '@/components/LegalContentManager';

export const Website: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestion du Site Web</h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez l'apparence et le contenu de votre site web
        </p>
      </div>

      <Tabs defaultValue="design" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="design" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Contenu légal</span>
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageCircle className="h-4 w-4" />
            <span>Chat Public</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="design">
          <WebsiteDesignManager />
        </TabsContent>

        <TabsContent value="settings">
          <WebsiteSettingsManager />
        </TabsContent>

        <TabsContent value="legal">
          <LegalContentManager />
        </TabsContent>

        <TabsContent value="chat">
          <AdminChatNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};
