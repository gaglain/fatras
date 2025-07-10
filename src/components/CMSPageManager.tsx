import React, { useState } from 'react';
import { useWebsitePagesSync } from '@/hooks/useWebsitePagesSync';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, Eye, Globe } from 'lucide-react';
import { toast } from 'sonner';

export const CMSPageManager: React.FC = () => {
  const { pages, loading, savePage, updatePage, deletePage } = useWebsitePagesSync();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPage, setEditingPage] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: [],
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    page_type: 'page' as 'page' | 'home' | 'legal'
  });

  const handleCreatePage = async () => {
    try {
      if (!formData.title || !formData.slug) {
        toast.error('Le titre et le slug sont requis');
        return;
      }

      await savePage(formData);
      toast.success('Page créée avec succès');
      setIsCreating(false);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la création de la page');
      console.error(error);
    }
  };

  const handleUpdatePage = async () => {
    try {
      if (!editingPage || !formData.title || !formData.slug) return;

      await updatePage(editingPage.id, formData);
      toast.success('Page mise à jour avec succès');
      setEditingPage(null);
      resetForm();
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) return;

    try {
      await deletePage(id);
      toast.success('Page supprimée avec succès');
    } catch (error) {
      toast.error('Erreur lors de la suppression');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: [],
      meta_title: '',
      meta_description: '',
      meta_keywords: '',
      status: 'draft',
      page_type: 'page'
    });
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ý]/g, 'y')
      .replace(/[ñ]/g, 'n')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const startEdit = (page: any) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content || [],
      meta_title: page.meta_title || '',
      meta_description: page.meta_description || '',
      meta_keywords: page.meta_keywords || '',
      status: page.status,
      page_type: page.page_type
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary' as const,
      published: 'default' as const,
      archived: 'destructive' as const
    };
    return <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>{status}</Badge>;
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Pages</h2>
        <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvelle Page</span>
        </Button>
      </div>

      {/* Formulaire de création/édition */}
      {(isCreating || editingPage) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating ? 'Créer une nouvelle page' : 'Modifier la page'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="content" className="space-y-4">
              <TabsList>
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="settings">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="title">Titre *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => {
                        setFormData(prev => ({ 
                          ...prev, 
                          title: e.target.value,
                          slug: prev.slug || generateSlug(e.target.value)
                        }));
                      }}
                      placeholder="Titre de la page"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug">Slug URL *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="slug-de-la-page"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      URL: /front/{formData.slug}
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div>
                  <Label htmlFor="meta_title">Titre SEO</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                    placeholder="Titre pour les moteurs de recherche"
                  />
                </div>

                <div>
                  <Label htmlFor="meta_description">Description SEO</Label>
                  <Textarea
                    id="meta_description"
                    value={formData.meta_description}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                    placeholder="Description pour les moteurs de recherche"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="meta_keywords">Mots-clés SEO</Label>
                  <Input
                    id="meta_keywords"
                    value={formData.meta_keywords}
                    onChange={(e) => setFormData(prev => ({ ...prev, meta_keywords: e.target.value }))}
                    placeholder="mot-clé1, mot-clé2, mot-clé3"
                  />
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div>
                  <Label htmlFor="status">Statut</Label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Brouillon</SelectItem>
                      <SelectItem value="published">Publié</SelectItem>
                      <SelectItem value="archived">Archivé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="page_type">Type de page</Label>
                  <Select value={formData.page_type} onValueChange={(value: any) => setFormData(prev => ({ ...prev, page_type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page normale</SelectItem>
                      <SelectItem value="home">Page d'accueil</SelectItem>
                      <SelectItem value="legal">Page légale</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsCreating(false);
                  setEditingPage(null);
                  resetForm();
                }}
              >
                Annuler
              </Button>
              <Button onClick={isCreating ? handleCreatePage : handleUpdatePage}>
                {isCreating ? 'Créer' : 'Mettre à jour'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des pages */}
      <Card>
        <CardHeader>
          <CardTitle>Pages existantes</CardTitle>
        </CardHeader>
        <CardContent>
          {pages.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Aucune page créée. Créez votre première page !
            </p>
          ) : (
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-medium">{page.title}</h3>
                      {getStatusBadge(page.status)}
                      <Badge variant="outline">{page.page_type}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      /{page.slug} • Modifié le {new Date(page.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {page.status === 'published' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/front/${page.slug}`, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePage(page.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
