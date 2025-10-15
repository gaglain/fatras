
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Settings, Eye, ExternalLink, Edit } from 'lucide-react';
import { WebsiteConfigManager } from '@/components/WebsiteConfigManager';
import { useWebsiteConfig } from '@/contexts/WebsiteConfigContext';
import { WebsiteWithSidebar } from '@/components/website/WebsiteWithSidebar';

export const Website: React.FC = () => {
  const [activeTab, setActiveTab] = useState('config');
  const [previewVersion, setPreviewVersion] = useState(0);
  const navigate = useNavigate();
  // This line ensures that we're actually within the context before using WebsiteConfigManager
  const { config } = useWebsiteConfig();

  useEffect(() => {
    const bump = () => setPreviewVersion((v) => v + 1);
    const events = [
      'websiteSettingsUpdated',
      'siteSettingsUpdated',
      'websiteDesignUpdated',
      'websiteSettingsSaved',
      'websiteConfigChanged',
      'websitePagesSaved',
      'menuUpdated',
      'websiteMenuSaved',
      'frontDataRefresh'
    ];
    events.forEach((evt) => window.addEventListener(evt as any, bump));

    const onStorage = (e: StorageEvent) => {
      if (!e.key || ['websiteSettings','websiteDesign','site_settings','websiteConfig','websitePages','websiteMenu'].includes(e.key)) {
        bump();
      }
    };
    window.addEventListener('storage', onStorage);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt as any, bump));
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const handleOpenEditor = () => {
    navigate('/website-editor');
  };

  const handlePreviewSite = () => {
    window.open('/front', '_blank');
  };
  return (
    <WebsiteWithSidebar>
      <div className="space-y-6 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion du Site Web</h1>
            <p className="mt-2 text-gray-600">
              Configurez et personnalisez votre site web public
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <Button 
              onClick={handlePreviewSite}
              variant="outline"
              className="flex items-center justify-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Aperçu du site</span>
              <span className="sm:hidden">Aperçu</span>
            </Button>
            <Button 
              onClick={handleOpenEditor}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Éditeur de pages</span>
              <span className="sm:hidden">Éditeur</span>
            </Button>
          </div>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 gap-1">
          <TabsTrigger value="config" className="flex items-center justify-center">
            <Settings className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Configuration</span>
            <span className="sm:hidden">Config</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center justify-center">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Gestion avancée</span>
            <span className="sm:hidden">Avancé</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center justify-center">
            <Eye className="h-4 w-4 mr-2" />
            <span>Aperçu</span>
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

        <TabsContent value="advanced">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Button 
              onClick={() => navigate('/website-manager')} 
              variant="outline" 
              className="h-24 flex flex-col items-center gap-2"
            >
              <Globe className="h-8 w-8" />
              <span className="text-sm">Pages & Menu</span>
            </Button>
            <Button 
              onClick={() => navigate('/website-editor')} 
              variant="outline"
              className="h-24 flex flex-col items-center gap-2"
            >
              <Edit className="h-8 w-8" />
              <span className="text-sm">Éditeur</span>
            </Button>
            <Button 
              onClick={handlePreviewSite}
              className="h-24 flex flex-col items-center gap-2"
            >
              <ExternalLink className="h-8 w-8" />
              <span className="text-sm">Voir le site</span>
            </Button>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités avancées</CardTitle>
              <p className="text-muted-foreground">
                Gestion complète de votre site web avec toutes les fonctionnalités
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Pages et contenu</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Créez et gérez vos pages web avec un éditeur de contenu
                  </p>
                  <Button 
                    onClick={() => navigate('/website-manager')} 
                    variant="outline" 
                    size="sm"
                  >
                    Gérer les pages
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Éditeur visuel</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Modifiez vos pages avec un éditeur visuel par blocs
                  </p>
                  <Button 
                    onClick={() => navigate('/website-editor')} 
                    variant="outline" 
                    size="sm"
                  >
                    Ouvrir l'éditeur
                  </Button>
                </div>
              </div>
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
                  key={previewVersion}
                  src={`/front?preview=${previewVersion}`}
                  className="w-full h-full"
                  title={`Aperçu du site v${previewVersion}`}
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
    </WebsiteWithSidebar>
  );
};
