
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Layout as LayoutIcon,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const WebsiteManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState('layout');
  const navigate = useNavigate();

  const handlePreviewSite = () => {
    // Cache-busting pour éviter d'afficher une ancienne version (service worker)
    navigate(`/front?v=${Date.now()}`);
  };

  const handleClearCache = async () => {
    toast('Mise à jour en cours…');
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {
      // Ignore cache clear errors
    } finally {
      // Reload complet pour être sûr de charger le dernier bundle
      window.location.assign(`/front?v=${Date.now()}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Gestion du Site Web</h1>
          <p className="text-muted-foreground mt-2 text-sm lg:text-base">
            Gérez votre site web comme un WordPress professionnel
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <Button variant="outline" onClick={handleClearCache} className="text-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Vider le cache</span>
            <span className="sm:hidden">Cache</span>
          </Button>
          <Button variant="outline" onClick={handlePreviewSite} className="text-sm">
            <Eye className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Prévisualiser</span>
            <span className="sm:hidden">Aperçu</span>
          </Button>
          <Button onClick={handlePreviewSite} className="text-sm">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Voir le site</span>
            <span className="sm:hidden">Voir</span>
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 lg:space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger value="layout" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <LayoutIcon className="h-4 w-4" />
            <span className="hidden lg:inline">Header/Footer</span>
            <span className="lg:hidden">Layout</span>
          </TabsTrigger>
          <TabsTrigger value="pages" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <FileText className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <Search className="h-4 w-4" />
            <span>SEO</span>
          </TabsTrigger>
          <TabsTrigger value="legal" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <Shield className="h-4 w-4" />
            <span>Légal</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center justify-center space-x-1 lg:space-x-2 text-xs lg:text-sm">
            <Settings className="h-4 w-4" />
            <span className="hidden lg:inline">Paramètres</span>
            <span className="lg:hidden">Config</span>
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
