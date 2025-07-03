
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Settings, Menu, Palette, Globe, Edit, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { BlockEditor } from '@/components/BlockEditor/BlockEditor';
import { toast } from 'sonner';

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
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);
  const [showPageCreator, setShowPageCreator] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    metaDescription: ''
  });

  const handleCreatePage = () => {
    if (!newPageData.title.trim()) {
      toast.error('Le titre de la page est requis');
      return;
    }

    const newPage: WebPage = {
      id: Date.now().toString(),
      title: newPageData.title,
      slug: newPageData.slug || `/${newPageData.title.toLowerCase().replace(/ /g, '-')}`,
      status: 'draft',
      blocks: [],
      metaDescription: newPageData.metaDescription
    };

    setPages([...pages, newPage]);
    setNewPageData({ title: '', slug: '', metaDescription: '' });
    setShowPageCreator(false);
    setEditingPage(newPage);
    toast.success('Page créée avec succès');
  };

  const handleSavePage = (blocks: any[]) => {
    if (editingPage) {
      const updatedPages = pages.map(p => 
        p.id === editingPage.id 
          ? { ...p, blocks, status: 'published' as const }
          : p
      );
      setPages(updatedPages);
      toast.success('Page sauvegardée');
    }
  };

  if (editingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setEditingPage(null)}
                variant="outline"
              >
                ← Retour
              </Button>
              <h1 className="text-xl font-semibold">
                Édition : {editingPage.title}
              </h1>
            </div>
            <Button variant="outline" asChild>
              <Link to="/front" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Link>
            </Button>
          </div>
        </div>
        <BlockEditor
          initialBlocks={editingPage.blocks}
          onSave={handleSavePage}
        />
      </div>
    );
  }

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
                <Button onClick={() => setShowPageCreator(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une Page
                </Button>
              </div>

              {showPageCreator && (
                <Card className="p-4 border-2 border-dashed border-blue-200">
                  <div className="space-y-4">
                    <h3 className="font-medium">Créer une nouvelle page</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="Titre de la page"
                          value={newPageData.title}
                          onChange={(e) => setNewPageData({
                            ...newPageData,
                            title: e.target.value
                          })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">URL</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg"
                          placeholder="/ma-page"
                          value={newPageData.slug}
                          onChange={(e) => setNewPageData({
                            ...newPageData,
                            slug: e.target.value
                          })}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Description SEO</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="Description pour les moteurs de recherche"
                        value={newPageData.metaDescription}
                        onChange={(e) => setNewPageData({
                          ...newPageData,
                          metaDescription: e.target.value
                        })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleCreatePage}>
                        Créer la page
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowPageCreator(false);
                          setNewPageData({ title: '', slug: '', metaDescription: '' });
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              <div className="grid gap-4">
                {pages.map((page) => (
                  <Card key={page.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="text-md font-medium">{page.title}</h3>
                        <p className="text-sm text-muted-foreground">{page.slug}</p>
                        <p className="text-xs text-gray-500">
                          {page.blocks.length} bloc(s) • {page.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingPage(page)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
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
          <WebsiteDesignManager />
        </TabsContent>

        <TabsContent value="settings">
          <WebsiteSettingsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
