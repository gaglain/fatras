import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConfirm } from '@/components/ui/confirm-dialog';
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
  Mail,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { AdvancedBlockEditor } from '@/components/BlockEditor/AdvancedBlockEditor';
import { useWebsitePagesSync } from '@/hooks/useWebsitePagesSync';

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'private';
  type: 'page' | 'home' | 'artists' | 'events' | 'shop' | 'contact';
  blocks: any[];
  content?: any[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
  meta_title?: string;
  meta_description?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
}

export const PageManager: React.FC = () => {
  const { pages: supabasePages, loading, savePage, updatePage, deletePage, loadPages } = useWebsitePagesSync();
  const [localPages, setLocalPages] = useState<WebPage[]>([]);
  const [editingPage, setEditingPage] = useState<WebPage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPageData, setNewPageData] = useState({
    title: '',
    slug: '',
    type: 'page' as WebPage['type'],
    status: 'draft' as WebPage['status']
  });

  useEffect(() => {
    if (supabasePages && supabasePages.length > 0) {
      const convertedPages = supabasePages.map((p) => {
        const raw = (p.content as any);
        let blocks: any[] = [];

        if (Array.isArray(raw)) {
          blocks = raw;
        } else if (typeof raw === 'string') {
          try {
            const parsed = JSON.parse(raw);
            blocks = Array.isArray(parsed) ? parsed : (parsed?.blocks || []);
          } catch {
            blocks = [];
          }
        } else if (raw && typeof raw === 'object' && Array.isArray(raw.blocks)) {
          blocks = raw.blocks;
        }

        return {
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: (p.status || 'draft') as WebPage['status'],
          type: ((p.page_type as any) || 'page') as WebPage['type'],
          blocks,
          content: blocks,
          meta_title: p.meta_title,
          meta_description: p.meta_description,
          created_at: p.created_at,
          updated_at: p.updated_at,
        };
      });

      setLocalPages(convertedPages);
      // Sync to localStorage for FrontDynamicPage fallback
      localStorage.setItem('websitePages', JSON.stringify(convertedPages));
    } else if (!loading) {
      loadLocalStoragePages();
    }
  }, [supabasePages, loading]);

  const loadLocalStoragePages = () => {
    const savedPages = localStorage.getItem('websitePages');
    if (savedPages) {
      try {
        const parsedPages = JSON.parse(savedPages);
        const pagesWithBlocks = parsedPages.map((page: any) => ({
          ...page,
          blocks: page.blocks || page.content || []
        }));
        setLocalPages(pagesWithBlocks);
      } catch {
        // Failed to load pages from localStorage
      }
    }
  };

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

  const filteredPages = localPages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePage = async () => {
    if (!newPageData.title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    setSaving(true);
    
    try {
      // Générer le slug
      const slug = newPageData.type === 'home'
        ? '/'
        : (newPageData.slug || newPageData.title.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .replace(/^-+|-+$/g, ''));

      // Sauvegarder dans Supabase
      await savePage({
        title: newPageData.title,
        slug,
        content: [],
        status: 'draft',
        page_type: newPageData.type,
      });

      setNewPageData({ title: '', slug: '', type: 'page', status: 'draft' });
      setShowCreateForm(false);
      toast.success('Page créée avec succès');
      
      // Recharger les pages
      await loadPages();
    } catch {
      toast.error('Erreur lors de la création de la page');
    } finally {
      setSaving(false);
    }
  };

  const handleEditPage = (page: WebPage) => {
    setEditingPage({ ...page, blocks: page.blocks || page.content || [] });
  };

  const handleSavePage = async (blocks: any[]) => {
    if (!editingPage) return;
    
    setSaving(true);
    
    try {
      await updatePage(editingPage.id, {
        title: editingPage.title,
        slug: editingPage.slug,
        content: blocks,
        status: editingPage.status
      });
      
      setEditingPage(null);
      toast.success('Page sauvegardée');
      
      // Recharger les pages
      await loadPages();
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      try {
        await deletePage(pageId);
        toast.success('Page supprimée');
      } catch {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handlePublishPage = async (pageId: string) => {
    try {
      await updatePage(pageId, { status: 'published' });
      toast.success('Page publiée');
      await loadPages();
    } catch {
      toast.error('Erreur lors de la publication');
    }
  };

  if (editingPage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={() => setEditingPage(null)}>
            ← Retour aux pages
          </Button>
          <h2 className="text-xl font-semibold">Édition : {editingPage.title}</h2>
        </div>
        <AdvancedBlockEditor
          initialBlocks={editingPage.blocks || []}
          onSave={handleSavePage}
          onCancel={() => setEditingPage(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Gestionnaire de Pages</CardTitle>
            <Button onClick={() => setShowCreateForm(true)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle Page
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Chargement des pages...</span>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher une page..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1"
                />
              </div>

              {showCreateForm && (
                <Card className="p-4 border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="space-y-4">
                    <h3 className="font-medium">Créer une nouvelle page</h3>
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
                        <label className="block text-sm font-medium mb-1">URL (slug)</label>
                        <Input
                          placeholder="ma-page"
                          value={newPageData.slug}
                          onChange={(e) => setNewPageData(prev => ({ ...prev, slug: e.target.value }))}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          {newPageData.type === 'home'
                            ? 'Sera accessible sur /front'
                            : `Sera accessible sur /front/${newPageData.slug || newPageData.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'ma-page'}`}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select
                          className="w-full px-3 py-2 border rounded-lg bg-background"
                          value={newPageData.type}
                          onChange={(e) => setNewPageData(prev => ({ ...prev, type: e.target.value as WebPage['type'] }))}
                        >
                          <option value="page">Page standard</option>
                          <option value="home">Page d'accueil</option>
                          <option value="artists">Page artistes</option>
                          <option value="events">Page événements</option>
                          <option value="shop">Page boutique</option>
                          <option value="contact">Page contact</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={handleCreatePage} disabled={saving}>
                        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                        Créer
                      </Button>
                      <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {!loading && (
            <div className="grid gap-4">
              {filteredPages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune page créée</p>
                  <p className="text-sm">Créez votre première page en cliquant sur "Nouvelle Page"</p>
                </div>
              ) : (
                filteredPages.map((page) => {
                  const Icon = getPageIcon(page.type);
                  const blockCount = page.blocks ? page.blocks.length : 0;
                  
                  return (
                    <Card key={page.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <Icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">{page.title}</h3>
                            <p className="text-sm text-muted-foreground">{page.slug === '/' || page.slug === '' ? '/front' : `/front/${page.slug.replace(/^\/+/, '')}`}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(page.status)}>
                                {page.status === 'published' ? 'Publié' : page.status === 'draft' ? 'Brouillon' : 'Privé'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {blockCount} bloc(s)
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
                             onClick={() => {
                               const slug = page.slug.replace(/^\/+/, '');
                               // Homepage (slug "/" or empty) should go to /front
                               const baseUrl = slug === '' || page.slug === '/' ? '/front' : `/front/${slug}`;
                               window.open(`${baseUrl}?v=${Date.now()}`, '_blank');
                             }}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePage(page.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};