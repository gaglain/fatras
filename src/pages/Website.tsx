
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Settings, Eye, ExternalLink, Edit } from 'lucide-react';
import { WebsiteConfigManager } from '@/components/WebsiteConfigManager';

export const Website: React.FC = () => {
  const [activeTab, setActiveTab] = useState('config');
  const navigate = useNavigate();

  const handleOpenEditor = () => {
    navigate('/website-editor');
  };

  const handlePreviewSite = () => {
    window.open('/front', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Site Web</h1>
          <p className="mt-2 text-gray-600">
            Configurez et personnalisez votre site web public
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            onClick={handlePreviewSite}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Aperçu du site</span>
          </Button>
          <Button 
            onClick={handleOpenEditor}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Edit className="h-4 w-4" />
            <span>Éditeur de pages</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="config">
            <Settings className="h-4 w-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configuration du site web
              </CardTitle>
              <p className="text-gray-600">
                Modifiez les paramètres de votre site web. Les changements seront appliqués immédiatement.
              </p>
            </CardHeader>
            <CardContent>
              <WebsiteConfigManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Aperçu du site</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg overflow-hidden">
                <iframe
                  src="/front"
                  className="w-full h-full"
                  title="Aperçu du site"
                />
              </div>
              <div className="mt-4 text-center">
                <Button onClick={handlePreviewSite} variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir dans un nouvel onglet
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
