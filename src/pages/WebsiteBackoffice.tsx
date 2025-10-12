import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MenuManager } from '@/components/website/MenuManager';
import { PageManager } from '@/components/website/PageManager';
import { SEOManager } from '@/components/website/SEOManager';
import { AnalyticsManager } from '@/components/website/AnalyticsManager';
import { FaviconManager } from '@/components/website/FaviconManager';
import { LegalManager } from '@/components/website/LegalManager';
import { SiteSettings } from '@/components/website/SiteSettings';
import { WebsiteWithSidebar } from '@/components/website/WebsiteWithSidebar';
import { Menu, FileText, Search, BarChart3, Star, Scale, Cog, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const WebsiteBackoffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState('menu');
  const navigate = useNavigate();

  return (
    <WebsiteWithSidebar>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gestion avancée du site</h1>
            <p className="text-muted-foreground mt-2">
              Gérez le contenu, les menus et les paramètres de votre site web
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au Dashboard
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="menu" className="flex items-center space-x-2">
              <Menu className="h-4 w-4" />
              <span className="hidden md:inline">Menus</span>
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span className="hidden md:inline">Pages</span>
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">SEO</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="favicon" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span className="hidden md:inline">Favicon</span>
            </TabsTrigger>
            <TabsTrigger value="legal" className="flex items-center space-x-2">
              <Scale className="h-4 w-4" />
              <span className="hidden md:inline">Légal</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Cog className="h-4 w-4" />
              <span className="hidden md:inline">Paramètres</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Menu className="h-5 w-5 mr-2" />
                  Gestion des menus
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MenuManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Gestion des pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PageManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Search className="h-5 w-5 mr-2" />
                  Optimisation SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SEOManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Analytics et suivi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="favicon">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-5 w-5 mr-2" />
                  Gestion du favicon
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FaviconManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="legal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Scale className="h-5 w-5 mr-2" />
                  Mentions légales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LegalManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Cog className="h-5 w-5 mr-2" />
                  Paramètres du site
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SiteSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </WebsiteWithSidebar>
  );
};