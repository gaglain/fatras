
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageManager } from '@/components/website/PageManager';
import { MenuManager } from '@/components/website/MenuManager';
import { SEOManager } from '@/components/website/SEOManager';
import { LegalManager } from '@/components/website/LegalManager';
import { AnalyticsManager } from '@/components/website/AnalyticsManager';
import { SiteSettings } from '@/components/website/SiteSettings';
import { LayoutSection } from '@/components/website-design/LayoutSection';
import { 
  FileText, 
  Menu, 
  Search, 
  Shield, 
  BarChart3, 
  Settings,
  Eye,
  Globe,
  Layout as LayoutIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const WebsiteManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('layout');

  const handlePreviewSite = () => {
    window.open('/front', '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Site Web</h1>
          <p className="text-muted-foreground mt-2">
            Gérez votre site web comme un WordPress professionnel
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePreviewSite}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button onClick={handlePreviewSite}>
            <Globe className="h-4 w-4 mr-2" />
            Voir le site
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="layout" className="flex items-center space-x-2">
            <LayoutIcon className="h-4 w-4" />
            <span>Header/Footer</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center space-x-2">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Légal</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="layout">
          <LayoutSection />
        </TabsContent>

        <TabsContent value="pages">
          <PageManager />
        </TabsContent>

        <TabsContent value="menu">
          <MenuManager />
        </TabsContent>

        <TabsContent value="seo">
          <SEOManager />
        </TabsContent>

        <TabsContent value="legal">
          <LegalManager />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsManager />
        </TabsContent>

        <TabsContent value="settings">
          <SiteSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
