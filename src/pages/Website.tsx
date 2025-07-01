
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Palette, Settings, FileText, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminChatNotifications } from '@/components/AdminChatNotifications';

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
          <Card>
            <CardHeader>
              <CardTitle>Design du site</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Module de design du site web - Personnalisez les couleurs, polices et mise en page de votre site public.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du site</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Configurez les paramètres généraux de votre site : nom, description, SEO, etc.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card>
            <CardHeader>
              <CardTitle>Contenu légal</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Gérez vos mentions légales, politique de confidentialité et conditions d'utilisation.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          <AdminChatNotifications />
        </TabsContent>
      </Tabs>
    </div>
  );
};
