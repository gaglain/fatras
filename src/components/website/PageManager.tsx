
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search,
  FileText,
  Home,
  Users,
  Calendar,
  Store,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { BlockEditor } from '@/components/website/BlockEditor';

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'private';
  type: 'page' | 'home' | 'artists' | 'events' | 'shop' | 'contact';
  blocks: any[];
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
}

const defaultPages: WebPage[] = [
  {
    id: 'home',
    title: 'Accueil',
    slug: '/',
    status: 'published',
    type: 'home',
    blocks: [
      {
        id: 'hero-1',
        type: 'hero',
        content: {
          title: 'Bienvenue sur notre site',
          subtitle: 'Découvrez notre univers musical',
          backgroundImage: '',
          buttonText: 'Découvrir',
          buttonLink: '/artists'
        }
      }
    ],
    seo: {
      title: 'Accueil - Fatras',
      description: 'Bienvenue sur le site officiel de Fatras',
      keywords: 'fatras, musique, artistes'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'artists',
    title: 'Nos Artistes',
    slug: '/artists',
    status: 'published',
    type: 'artists',
    blocks: [
      {
        id: 'artists-grid-1',
        type: 'artists-grid',
        content: {
          title: 'Nos Artistes',
          showAll: true
        }
      }
    ],
    seo: {
      title: 'Nos Artistes - Fatras',
      description: 'Découvrez notre sélection d\'artistes exceptionnels',
      keywords: 'artistes, musique, booking'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const PageManager: React.FC = () => {
  const [pages, setPages] = useState<WebPage[]>(defaultPages);
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    type: 'page' as WebPage['type']
  });

  useEffect(() => {
    const savedPages = localStorage.getItem('website_pages');
    if (savedPages) {
      try {
        setPages(JSON.parse(savedPages));
      } catch (error) {
        console.error('Erreur chargement pages:', error);
      }
    } else {
      localStorage.setItem('website_pages', JSON.stringify(defaultPages));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('website_pages', JSON.stringify(pages));
  }, [pages]);

  const getPageIcon = (type: WebPage['type']) => {
    switch (type) {
      case 'home': return Home;
      case 'artists': return Users;
      case 'events': return Calendar;
      case 'shop': return Store;
      case 'contact': return Mail;
      default: return FileText;
    }
  };

  const getStatusColor = (status: WebPage['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'private': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = () => {
    if (!newPageData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    const slug = newPageData.slug || `/${newPageData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
    
    const newPage: WebPage = {
      id: Date.now().toString(),
      title: newPageData.title,
      slug: slug,
      status: 'draft',
      type: newPageData.type,
      blocks: [],
      seo: {
        title: newPageData.title,
        description: `Page ${newPageData.title}`,
        keywords: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPages(prev => [...prev, newPage]);
    setNewPageData({ title: '', slug: '', type: 'page' });
    setShowCreateForm(false);
    toast.success('Page créée avec succès');
  };

  const handleEditPage = (page: WebPage) => {
    setEditingPage(page);
  };

  const handleSavePage = (updatedPage: WebPage) => {
    setPages(prev => prev.map(page => 
      page.id === updatedPage.id 
        ? { ...updatedPage, updatedAt: new Date().toISOString() }
        : page
    ));
    setEditingPage(null);
    toast.success('Page sauvegardée');
  };

  const handleDeletePage = (pageId: string) => {
    if (pageId === 'home') {
      toast.error('Impossible de supprimer la page d\'accueil');
      return;
    }
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      setPages(prev => prev.filter(page => page.id !== pageId));
      toast.success('Page supprimée');
    }
  };

  const handlePublishPage = (pageId: string) => {
    setPages(prev => prev.map(page => 
      page.id === pageId 
        ? { ...page, status: 'published' as const, updatedAt: new Date().toISOString() }
        : page
    ));
    toast.success('Page publiée');
  };

  if (editingPage) {
    return (
      <BlockEditor
        page={editingPage}
        onSave={handleSavePage}
        onCancel={() => setEditingPage(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestionnaire de Pages</CardTitle>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Page
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher une page..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>

          {showCreateForm && (
            <Card className="p-4 border-2 border-dashed border-blue-200 bg-blue-50/50">
              <div className="space-y-4">
                <h3 className="font-medium text-blue-900">Créer une nouvelle page</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Titre *</label>
                    <Input
                      placeholder="Titre de la page"
                      value={newPageData.title}
                      onChange={(e) => setNewPageData(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">URL</label>
                    <Input
                      placeholder="/ma-page"
                      value={newPageData.slug}
                      onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg"
                      value={newPageData.type}
                      onChange={(e) => setNewPageData(prev => ({ ...prev, type: e.target.value as WebPage['type'] }))}
                    >
                      <option value="page">Page standard</option>
                      <option value="artists">Page artistes</option>
                      <option value="events">Page événements</option>
                      <option value="shop">Page boutique</option>
                      <option value="contact">Page contact</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCreatePage}>Créer</Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Annuler
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <div className="grid gap-4">
            {filteredPages.map((page) => {
              const Icon = getPageIcon(page.type);
              return (
                <Card key={page.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Icon className="h-5 w-5 text-gray-500" />
                      <div>
                        <h3 className="font-medium">{page.title}</h3>
                        <p className="text-sm text-gray-500">{page.slug}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(page.status)}>
                            {page.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {page.blocks.length} bloc(s)
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPage(page)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Éditer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/front${page.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      {page.status !== 'published' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePublishPage(page.id)}
                        >
                          Publier
                        </Button>
                      )}
                      {page.id !== 'home' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeletePage(page.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
