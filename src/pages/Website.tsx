
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Globe, Menu, Palette, Settings, Eye, Code, Edit, FileText, ExternalLink } from 'lucide-react';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { SEOManager } from '@/components/SEOManager';
import { LegalContentManager } from '@/components/LegalContentManager';

export const Website: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pages');
  const navigate = useNavigate();

  const handleSEOSave = (seoData: any) => {
    console.log('Saving SEO data:', seoData);
    // TODO: Implement SEO data saving to backend
  };

  const handleOpenEditor = () => {
    console.log('🚀 Opening website editor');
    navigate('/website-editor');
  };

  const handlePreviewSite = () => {
    console.log('👁️ Opening preview in new tab');
    window.open('/front', '_blank');
  };

  return (
    <div className="space-y-6" style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--app-text, #18181b)' }}>
            Gestion du Site Web
          </h1>
          <p className="mt-2" style={{ color: 'var(--app-text, #666666)' }}>
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
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="pages">
            <FileText className="h-4 w-4 mr-2" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="menu">
            <Menu className="h-4 w-4 mr-2" />
            Menu
          </TabsTrigger>
          <TabsTrigger value="design">
            <Palette className="h-4 w-4 mr-2" />
            Design
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Paramètres
          </TabsTrigger>
          <TabsTrigger value="seo">
            <Code className="h-4 w-4 mr-2" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="legal">
            <Eye className="h-4 w-4 mr-2" />
            Légal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Gestion des Pages
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Créez et modifiez les pages de votre site web
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 text-blue-500" />
                <h3 className="text-lg font-semibold mb-2">Éditeur de Pages</h3>
                <p className="text-gray-600 mb-6">
                  Utilisez l'éditeur de pages pour créer, modifier et gérer le contenu de votre site web
                </p>
                <div className="flex justify-center space-x-4">
                  <Button 
                    onClick={handleOpenEditor}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Ouvrir l'éditeur
                  </Button>
                  <Button 
                    onClick={handlePreviewSite}
                    variant="outline"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Voir le site
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Gestion du Menu
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Personnalisez la navigation de votre site web
              </p>
            </CardHeader>
            <CardContent>
              <WebsiteMenuManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Design et Apparence
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Personnalisez l'apparence de votre site web
              </p>
            </CardHeader>
            <CardContent>
              <WebsiteDesignManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Paramètres Généraux
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Configuration générale du site web
              </p>
            </CardHeader>
            <CardContent>
              <WebsiteSettingsManager />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                SEO et Référencement
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Optimisez le référencement de votre site
              </p>
            </CardHeader>
            <CardContent>
              <SEOManager onSave={handleSEOSave} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legal">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle style={{ color: 'var(--app-card-text, #18181b)' }}>
                Contenu Légal
              </CardTitle>
              <p style={{ color: 'var(--app-text, #666666)' }}>
                Gérez les mentions légales et CGV
              </p>
            </CardHeader>
            <CardContent>
              <LegalContentManager />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
