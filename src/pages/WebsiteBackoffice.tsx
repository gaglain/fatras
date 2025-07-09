
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Settings, Menu, Palette, Globe, Edit, Eye, Trash2, ExternalLink } from 'lucide-react';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { toast } from 'sonner';
import { SimpleBlockEditor, SimpleBlock } from '@/components/BlockEditor/SimpleBlockEditor';

interface Block {
  id: string;
  type: 'text' | 'image' | 'hero' | 'artists';
  content: any;
  order: number;
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
        order: 0,
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

  console.log('🔄 WebsiteBackoffice - Current pages:', pages.length);
  console.log('🔄 WebsiteBackoffice - Editing page:', editingPage?.title);

  // Charger les pages depuis localStorage
  useEffect(() => {
    const savedPages = localStorage.getItem('websitePages');
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        console.log('✅ Pages loaded from localStorage:', parsed.length);
        setPages(parsed);
      } catch (error) {
        console.error('❌ Error loading pages from localStorage:', error);
      }
    } else {
      console.log('📝 No saved pages found, using defaults');
      localStorage.setItem('websitePages', JSON.stringify(defaultPages));
    }
  }, []);

  // Sauvegarder automatiquement les pages
  useEffect(() => {
    console.log('💾 Saving pages to localStorage:', pages.length);
    localStorage.setItem('websitePages', JSON.stringify(pages));
  }, [pages]);

  const handleCreatePage = () => {
    if (!newPageData.title.trim()) {
      toast.error('Le titre de la page est requis');
      return;
    }

    const slug = newPageData.slug || `/${newPageData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    
    const newPage: WebPage = {
      id: Date.now().toString(),
      title: newPageData.title,
      slug: slug,
      status: 'draft',
      blocks: [
        {
          id: `text-${Date.now()}`,
          type: 'text',
          order: 0,
          content: {
            text: `<h1>${newPageData.title}</h1><p>Contenu de la page ${newPageData.title}</p>`
          }
        }
      ],
      metaDescription: newPageData.metaDescription || `Page ${newPageData.title}`
    };

    console.log('➕ Creating new page:', newPage.title);
    setPages(prev => [...prev, newPage]);
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
      console.log('🗑️ Deleting page:', pageId);
      setPages(prev => prev.filter(p => p.id !== pageId));
      if (editingPage && editingPage.id === pageId) {
        setEditingPage(null);
      }
      toast.success('Page supprimée');
    }
  };

  const handleSaveBlocks = (pageId: string, blocks: SimpleBlock[]) => {
    console.log('💾 Saving blocks for page:', pageId, blocks.length);
    const updatedPages = pages.map(page => 
      page.id === pageId 
        ? { ...page, blocks: blocks.map((block, index) => ({ ...block, order: index })) as Block[] }
        : page
    );
    setPages(updatedPages);
    
    if (editingPage && editingPage.id === pageId) {
      const updatedPage = updatedPages.find(p => p.id === pageId);
      if (updatedPage) {
        setEditingPage(updatedPage);
      }
    }
    
    toast.success('Page sauvegardée avec succès !');
  };

  const handlePreviewSite = () => {
    console.log('👁️ Opening preview in new tab');
    window.open('/front', '_blank');
    toast.success('Prévisualisation ouverte dans un nouvel onglet');
  };

  const handleEditPage = (page: WebPage) => {
    console.log('✏️ Editing page:', page.title);
    setEditingPage(page);
  };

  const handlePublishPage = (pageId: string) => {
    console.log('📢 Publishing page:', pageId);
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { ...page, status: 'published' as const }
        : page
    ));
    toast.success('Page publiée avec succès');
  };

  // Mode édition
  if (editingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
            <div>
              <h2 className="text-xl font-bold">Édition : {editingPage.title}</h2>
              <p className="text-sm text-gray-600">{editingPage.slug}</p>
              <Badge variant={editingPage.status === 'published' ? 'default' : 'secondary'}>
                {editingPage.status === 'published' ? 'Publié' : 'Brouillon'}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handlePreviewSite} variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Prévisualiser
              </Button>
              {editingPage.status !== 'published' && (
                <Button 
                  onClick={() => handlePublishPage(editingPage.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Publier
                </Button>
              )}
              <Button onClick={() => setEditingPage(null)} variant="outline">
                Retour
              </Button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border shadow-sm">
            <SimpleBlockEditor
              key={editingPage.id}
              initialBlocks={editingPage.blocks as SimpleBlock[]}
              onSave={(blocks) => handleSaveBlocks(editingPage.id, blocks)}
              onPreview={handlePreviewSite}
            />
          </div>
        </div>
      </div>
    );
  }

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
            Prévisualiser le site ({pages.length} pages)
          </Button>
        </div>
      </div>

      <Tabs defaultValue="pages" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
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
          <TabsTrigger value="legal" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Légal</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gestionnaire de Pages ({pages.length})</h2>
                <Button onClick={() => setShowPageCreator(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Page
                </Button>
              </div>

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
                            {page.status === 'published' ? 'Publié' : 'Brouillon'}
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handlePreviewSite}
                          className="text-green-600 border-green-600 hover:bg-green-50"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Voir
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

        <TabsContent value="legal">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Gestion du contenu légal</h2>
              <p className="text-muted-foreground">
                Gérez les mentions légales, conditions d'utilisation et politique de confidentialité de votre site.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
