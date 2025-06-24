import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Menu, Palette, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  blocks: any[];
  metaDescription: string;
}

const defaultPages: WebPage[] = [
  {
    id: '1',
    title: 'Accueil',
    slug: '/',
    status: 'published',
    blocks: [],
    metaDescription: 'Page d\'accueil par défaut'
  },
  {
    id: '2',
    title: 'Nos Artistes',
    slug: '/artists',
    status: 'published',
    blocks: [],
    metaDescription: 'Page des artistes par défaut'
  },
  {
    id: '3',
    title: 'Événements',
    slug: '/events',
    status: 'published',
    blocks: [],
    metaDescription: 'Page des événements par défaut'
  },
  {
    id: '4',
    title: 'Boutique',
    slug: '/shop',
    status: 'published',
    blocks: [],
    metaDescription: 'Page de la boutique par défaut'
  },
  {
    id: '5',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    blocks: [],
    metaDescription: 'Page de contact par défaut'
  }
];

export const WebsiteBackoffice: React.FC = () => {
  const [pages, setPages] = useState<WebPage[]>(defaultPages);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Site Web</h1>
          <p className="text-muted-foreground mt-2">
            Gérez le contenu et l'apparence de votre site web public
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link to="/front" target="_blank">
              <Globe className="h-4 w-4 mr-2" />
              Voir le site
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pages" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Pages</span>
          </TabsTrigger>
          <TabsTrigger value="menu" className="flex items-center space-x-2">
            <Menu className="h-4 w-4" />
            <span>Menu</span>
          </TabsTrigger>
          <TabsTrigger value="design" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Design</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Liste des Pages</h2>
                <Button asChild>
                  <Link to="/website/editor/new" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Ajouter une Page</span>
                  </Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {pages.map((page) => (
                  <Card key={page.id}>
                    <CardContent className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium">{page.title}</h3>
                        <p className="text-sm text-muted-foreground">{page.slug}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/website/editor/${page.id}`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu">
          <WebsiteMenuManager />
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Personnalisation du Design</h3>
                <p className="text-muted-foreground mb-4">
                  Fonctionnalité à venir : personnalisation des couleurs, polices et styles
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Paramètres du Site</h3>
                <p className="text-muted-foreground mb-4">
                  Fonctionnalité à venir : SEO, domaines, analytics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
