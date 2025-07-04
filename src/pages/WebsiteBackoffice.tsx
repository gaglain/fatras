
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Settings, Menu, Palette, Globe, Edit, Eye, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { toast } from 'sonner';
import { SimpleBlockEditor, SimpleBlock } from '@/components/BlockEditor/SimpleBlockEditor';

interface Block {
  id: string;
  type: 'text' | 'image' | 'hero' | 'artists';
  content: any;
}

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  blocks: Block[];
  metaDescription: string;
}

const defaultPages: WebPage[] = [
  {
    id: '1',
    title: 'Accueil',
    slug: '/',
    status: 'published',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Bienvenue sur notre site',
          subtitle: 'Découvrez notre univers musical',
          backgroundImage: '',
          buttonText: 'En savoir plus',
          buttonLink: '#'
        }
      }
    ],
    metaDescription: 'Page d\'accueil - Découvrez notre univers musical'
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
      slug: newPageData.slug || `/${newPageData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`,
      status: 'draft',
      blocks: [
        {
          id: `text-${Date.now()}`,
          type: 'text',
          content: {
            text: `Contenu de la page ${newPageData.title}`,
            style: 'normal'
          }
        }
      ],
      metaDescription: newPageData.metaDescription || `Page ${newPageData.title}`
    };

    setPages([...pages, newPage]);
    setNewPageData({ title: '', slug: '', metaDescription: '' });
    setShowPageCreator(false);
    toast.success('Page créée avec succès');
  };

  const handleDeletePage = (pageId: string) => {
    if (pageId === '1') {
      toast.error('Impossible de supprimer la page d\'accueil');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      setPages(pages.filter(p => p.id !== pageId));
      if (editingPage && editingPage.id === pageId) {
        setEditingPage(null);
      }
      toast.success('Page supprimée');
    }
  };

  const handleSaveBlocks = (pageId: string, blocks: SimpleBlock[]) => {
    console.log('Saving blocks for page:', pageId, blocks);
    
    const updatedPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, blocks: blocks as Block[] }
        : page
    );
    setPages(updatedPages);
    
    // Mettre à jour la page en cours d'édition
    if (editingPage && editingPage.id === pageId) {
      const updatedPage = updatedPages.find(p => p.id === pageId);
      if (updatedPage) {
        setEditingPage(updatedPage);
      }
    }
    
    toast.success('Page sauvegardée avec succès !');
  };

  const handlePreviewSite = () => {
    window.open('/front', '_blank');
  };

  const handleEditPage = (page: WebPage) => {
    console.log('Opening editor for page:', page);
    setEditingPage(page);
  };

  // Mode édition - Affichage de l'éditeur de blocs
  if (editingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* En-tête de l'éditeur */}
          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
            <div>
              <h2 className="text-xl font-bold">Édition : {editingPage.title}</h2>
              <p className="text-sm text-gray-600">{editingPage.slug}</p>
              <Badge variant={editingPage.status === 'published' ? 'default' : 'secondary'}>
                {editingPage.status === 'published' ? 'Publié' : 
                 editingPage.status === 'draft' ? 'Brouillon' : 'Archivé'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handlePreviewSite} variant="outline">
                <Globe className="h-4 w-4 mr-2" />
                Prévisualiser le site
              </Button>
              <Button onClick={() => setEditingPage(null)} variant="outline">
                Retour à la liste
              </Button>
            </div>
          </div>
          
          {/* Éditeur de blocs */}
          <div className="bg-white rounded-lg border shadow-sm">
            <SimpleBlockEditor
              key={editingPage.id} // Force re-render when page changes
              initialBlocks={editingPage.blocks as SimpleBlock[]}
              onSave={(blocks) => handleSaveBlocks(editingPage.id, blocks)}
              onPreview={handlePreviewSite}
            />
          </div>
        </div>
      </div>
    );
  }

  // Mode liste - Affichage de la gestion des pages
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Site Web</h1>
          <p className="text-muted-foreground mt-2">
            Créez et personnalisez vos pages avec un éditeur de blocs
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handlePreviewSite}>
            <Globe className="h-4 w-4 mr-2" />
            Voir le site
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
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gestionnaire de Pages</h2>
                <Button onClick={() => setShowPageCreator(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Page
                </Button>
              </div>

              {/* Formulaire de création de page */}
              {showPageCreator && (
                <Card className="p-4 border-2 border-dashed border-blue-200 bg-blue-50/50">
                  <div className="space-y-4">
                    <h3 className="font-medium text-blue-900">Créer une nouvelle page</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Titre *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Description pour les moteurs de recherche"
                        value={newPageData.metaDescription}
                        onChange={(e) => setNewPageData({
                          ...newPageData,
                          metaDescription: e.target.value
                        })}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleCreatePage} className="bg-blue-600 hover:bg-blue-700">
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

              {/* Liste des pages */}
              <div className="grid gap-4">
                {pages.map((page) => (
                  <Card key={page.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="text-md font-medium">{page.title}</h3>
                        <p className="text-sm text-muted-foreground">{page.slug}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-xs text-gray-500">
                            {page.blocks.length} bloc(s)
                          </p>
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status === 'published' ? 'Publié' : 
                             page.status === 'draft' ? 'Brouillon' : 'Archivé'}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditPage(page)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Éditer
                        </Button>
                        {page.id !== '1' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeletePage(page.id)}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
