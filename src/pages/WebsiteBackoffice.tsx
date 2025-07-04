
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Settings, Menu, Palette, Globe, Edit, Eye, Trash2, Type, Image as ImageIcon, Layout, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WebsiteMenuManager } from '@/components/WebsiteMenuManager';
import { WebsiteDesignManager } from '@/components/WebsiteDesignManager';
import { WebsiteSettingsManager } from '@/components/WebsiteSettingsManager';
import { toast } from 'sonner';

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
    blocks: [],
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
      slug: newPageData.slug || `/${newPageData.title.toLowerCase().replace(/ /g, '-')}`,
      status: 'draft',
      blocks: [],
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
      toast.success('Page supprimée');
    }
  };

  const addBlockToPage = (pageId: string, blockType: 'text' | 'image' | 'hero' | 'artists') => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: blockType,
      content: getDefaultBlockContent(blockType)
    };

    setPages(pages.map(page => 
      page.id === pageId 
        ? { ...page, blocks: [...page.blocks, newBlock] }
        : page
    ));

    toast.success(`Bloc ${blockType} ajouté`);
  };

  const removeBlockFromPage = (pageId: string, blockId: string) => {
    setPages(pages.map(page => 
      page.id === pageId 
        ? { ...page, blocks: page.blocks.filter(block => block.id !== blockId) }
        : page
    ));
    toast.success('Bloc supprimé');
  };

  const updateBlockContent = (pageId: string, blockId: string, content: any) => {
    setPages(pages.map(page => 
      page.id === pageId 
        ? { 
            ...page, 
            blocks: page.blocks.map(block => 
              block.id === blockId ? { ...block, content } : block
            )
          }
        : page
    ));
  };

  const getDefaultBlockContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Votre texte ici...', style: 'normal' };
      case 'image':
        return { src: '', alt: 'Image', caption: '' };
      case 'hero':
        return { title: 'Titre Principal', subtitle: 'Votre sous-titre', backgroundImage: '', buttonText: 'Action', buttonLink: '#' };
      case 'artists':
        return { title: 'Nos Artistes', showAll: true };
      default:
        return {};
    }
  };

  const BlockEditor = ({ page }: { page: WebPage }) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold">Édition : {page.title}</h2>
          <div className="flex space-x-2">
            <Button variant="outline" asChild>
              <Link to="/front" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Link>
            </Button>
            <Button onClick={() => setEditingPage(null)}>
              Terminer
            </Button>
          </div>
        </div>

        {/* Barre d'outils de blocs */}
        <div className="p-4 bg-gray-50 border rounded-lg">
          <h3 className="font-medium mb-3">Ajouter un bloc :</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlockToPage(page.id, 'text')}
              className="flex items-center"
            >
              <Type className="h-4 w-4 mr-2" />
              Texte
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlockToPage(page.id, 'image')}
              className="flex items-center"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Image
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlockToPage(page.id, 'hero')}
              className="flex items-center"
            >
              <Layout className="h-4 w-4 mr-2" />
              Section Hero
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => addBlockToPage(page.id, 'artists')}
              className="flex items-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Grille Artistes
            </Button>
          </div>
        </div>

        {/* Blocs de contenu */}
        <div className="space-y-4">
          {page.blocks.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
              <Layout className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Aucun contenu</h3>
              <p className="text-gray-600 mb-4">Ajoutez des blocs pour créer votre page</p>
            </div>
          ) : (
            page.blocks.map((block, index) => (
              <Card key={block.id} className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {block.type === 'text' && 'Texte'}
                      {block.type === 'image' && 'Image'}
                      {block.type === 'hero' && 'Hero'}
                      {block.type === 'artists' && 'Artistes'}
                    </Badge>
                    <span className="text-sm text-gray-500">Bloc #{index + 1}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeBlockFromPage(page.id, block.id)}
                    className="text-red-600 border-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Éditeur selon le type de bloc */}
                {block.type === 'text' && (
                  <div className="space-y-3">
                    <textarea
                      className="w-full p-3 border rounded-lg resize-none"
                      rows={4}
                      placeholder="Votre texte ici..."
                      value={block.content.text || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, text: e.target.value })}
                    />
                    <select 
                      className="p-2 border rounded"
                      value={block.content.style || 'normal'}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, style: e.target.value })}
                    >
                      <option value="normal">Texte normal</option>
                      <option value="title">Titre</option>
                      <option value="subtitle">Sous-titre</option>
                    </select>
                  </div>
                )}

                {block.type === 'image' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg"
                      placeholder="URL de l'image"
                      value={block.content.src || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, src: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Texte alternatif"
                      value={block.content.alt || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, alt: e.target.value })}
                    />
                    {block.content.src && (
                      <img src={block.content.src} alt={block.content.alt} className="max-w-xs rounded border" />
                    )}
                  </div>
                )}

                {block.type === 'hero' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg font-bold"
                      placeholder="Titre principal"
                      value={block.content.title || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, title: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="Sous-titre"
                      value={block.content.subtitle || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, subtitle: e.target.value })}
                    />
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg"
                      placeholder="URL image de fond"
                      value={block.content.backgroundImage || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, backgroundImage: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        className="p-2 border rounded-lg"
                        placeholder="Texte du bouton"
                        value={block.content.buttonText || ''}
                        onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, buttonText: e.target.value })}
                      />
                      <input
                        type="text"
                        className="p-2 border rounded-lg"
                        placeholder="Lien du bouton"
                        value={block.content.buttonLink || ''}
                        onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, buttonLink: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {block.type === 'artists' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="w-full p-3 border rounded-lg"
                      placeholder="Titre de la section"
                      value={block.content.title || ''}
                      onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, title: e.target.value })}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={block.content.showAll || false}
                        onChange={(e) => updateBlockContent(page.id, block.id, { ...block.content, showAll: e.target.checked })}
                      />
                      <span>Afficher tous les artistes</span>
                    </label>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  if (editingPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <BlockEditor page={editingPage} />
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
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Gestionnaire de Pages</h2>
                <Button onClick={() => setShowPageCreator(true)}>
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
                        <p className="text-xs text-gray-500">
                          {page.blocks.length} bloc(s) • {page.status}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingPage(page)}
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
