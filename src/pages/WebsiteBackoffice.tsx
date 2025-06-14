
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SEOManager } from '@/components/SEOManager';
import { useNavigate } from 'react-router-dom';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings, 
  Globe, 
  Layout, 
  FileText,
  Image,
  Video,
  Music,
  Calendar,
  Users,
  ArrowLeft,
  Upload,
  Search
} from 'lucide-react';

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  type: 'page' | 'blog' | 'event' | 'artist';
  content: string;
  metaDescription: string;
  featuredImage?: string;
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  keywords?: string;
  focusKeyword?: string;
}

interface FormData {
  title: string;
  slug: string;
  type: 'page' | 'blog' | 'event' | 'artist';
  content: string;
  metaDescription: string;
  status: 'published' | 'draft' | 'archived';
}

const defaultPages: WebPage[] = [
  {
    id: '1',
    title: 'Accueil',
    slug: '/',
    status: 'published',
    type: 'page',
    content: 'Page d\'accueil avec les derniers événements et artistes',
    metaDescription: 'Découvrez nos artistes et événements exceptionnels',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20'
  },
  {
    id: '2',
    title: 'Nos Artistes',
    slug: '/artists',
    status: 'published',
    type: 'page',
    content: 'Galerie complète de nos artistes talentueux',
    metaDescription: 'Parcourez notre sélection d\'artistes exceptionnels',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18'
  },
  {
    id: '3',
    title: 'Événements',
    slug: '/events',
    status: 'published',
    type: 'page',
    content: 'Calendrier des prochains événements et concerts',
    metaDescription: 'Ne manquez aucun de nos événements musicaux',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19'
  },
  {
    id: '4',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    type: 'page',
    content: 'Formulaire de contact et informations',
    metaDescription: 'Contactez-nous pour vos projets musicaux',
    createdAt: '2024-01-14',
    updatedAt: '2024-01-21'
  }
];

interface WebsiteBackofficeProps {
  onReturn?: () => void;
}

export const WebsiteBackoffice: React.FC<WebsiteBackofficeProps> = ({ onReturn }) => {
  const navigate = useNavigate();
  const { uploadFile, uploading } = useFileUpload();
  const [pages, setPages] = useState<WebPage[]>(defaultPages);
  const [selectedPage, setSelectedPage] = useState<WebPage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showSEODialog, setShowSEODialog] = useState(false);
  const [activeTab, setActiveTab] = useState('pages');
  const [logoUrl, setLogoUrl] = useState('/placeholder.svg');
  const [siteName, setSiteName] = useState('MusiConnect');
  const [siteDescription, setSiteDescription] = useState('Plateforme de booking d\'artistes et gestion d\'événements musicaux');

  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    type: 'page',
    content: '',
    metaDescription: '',
    status: 'draft'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      type: 'page',
      content: '',
      metaDescription: '',
      status: 'draft'
    });
  };

  const handleCreatePage = (e: React.FormEvent) => {
    e.preventDefault();
    const newPage: WebPage = {
      id: Date.now().toString(),
      ...formData,
      featuredImage: undefined,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    
    setPages([...pages, newPage]);
    setShowCreateDialog(false);
    resetForm();
    toast.success('Page créée avec succès');
  };

  const handleUpdatePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    
    const updatedPages = pages.map(page => 
      page.id === selectedPage.id 
        ? { 
            ...page, 
            ...formData, 
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : page
    );
    
    setPages(updatedPages);
    setShowEditDialog(false);
    setSelectedPage(null);
    resetForm();
    toast.success('Page mise à jour avec succès');
  };

  const handleDeletePage = (pageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette page ?')) {
      setPages(pages.filter(page => page.id !== pageId));
      toast.success('Page supprimée avec succès');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <Layout className="h-4 w-4" />;
      case 'blog': return <FileText className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'artist': return <Users className="h-4 w-4" />;
      default: return <Layout className="h-4 w-4" />;
    }
  };

  const publishedPages = pages.filter(page => page.status === 'published');
  const draftPages = pages.filter(page => page.status === 'draft');

  const handleEditPage = (page: WebPage) => {
    navigate(`/website/editor/${page.id}`);
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const publicUrl = await uploadFile(file, 'website-assets', `logo-${Date.now()}`);
        setLogoUrl(publicUrl);
        toast.success('Logo mis à jour avec succès');
      } catch (error) {
        console.error('Erreur lors de l\'upload du logo:', error);
        toast.error('Erreur lors de l\'upload du logo');
      }
    }
  };

  const handleSEOSave = (seoData: any) => {
    if (!selectedPage) return;
    
    const updatedPages = pages.map(page => 
      page.id === selectedPage.id 
        ? { 
            ...page, 
            metaDescription: seoData.description,
            seoTitle: seoData.title,
            keywords: seoData.keywords,
            focusKeyword: seoData.focusKeyword,
            updatedAt: new Date().toISOString().split('T')[0] 
          }
        : page
    );
    
    setPages(updatedPages);
    setShowSEODialog(false);
    setSelectedPage(null);
    toast.success('SEO mis à jour avec succès');
  };

  const handleSiteSettingsSave = () => {
    toast.success('Paramètres du site sauvegardés');
  };

  const openSEODialog = (page: WebPage) => {
    setSelectedPage(page);
    setShowSEODialog(true);
  };

  const openEditDialog = (page: WebPage) => {
    setSelectedPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      type: page.type,
      content: page.content,
      metaDescription: page.metaDescription,
      status: page.status
    });
    setShowEditDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onReturn && (
            <Button variant="ghost" onClick={onReturn} className="text-gray-700 hover:text-gray-900">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au site
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900">Back Office - Site Web</h1>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion du Site Web</h1>
            <p className="text-gray-600 mt-2">Gérez le contenu et les pages de votre site web</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 text-white hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Page
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle page</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePage} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Titre de la page"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug)</label>
                    <Input
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="/ma-page"
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="page">Page</SelectItem>
                        <SelectItem value="blog">Article de blog</SelectItem>
                        <SelectItem value="event">Événement</SelectItem>
                        <SelectItem value="artist">Artiste</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description SEO</label>
                  <Textarea
                    value={formData.metaDescription}
                    onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                    placeholder="Description pour les moteurs de recherche..."
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                  <Textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Contenu de la page..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                    Créer la page
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Globe className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Pages</p>
                  <p className="text-2xl font-bold text-gray-900">{pages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Eye className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Publiées</p>
                  <p className="text-2xl font-bold text-gray-900">{publishedPages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Edit className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Brouillons</p>
                  <p className="text-2xl font-bold text-gray-900">{draftPages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardContent className="p-6">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vues/mois</p>
                  <p className="text-2xl font-bold text-gray-900">12.4k</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pages">Toutes les Pages</TabsTrigger>
            <TabsTrigger value="published">Publiées</TabsTrigger>
            <TabsTrigger value="drafts">Brouillons</TabsTrigger>
            <TabsTrigger value="seo">SEO Global</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Gestion des Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(page.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{page.title}</h3>
                          <p className="text-sm text-gray-600">{page.slug}</p>
                          <p className="text-xs text-gray-500 mt-1">{page.content.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(page.status)}>
                          {page.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Modifié le {page.updatedAt}
                        </span>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" onClick={() => window.open(`/front${page.slug}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(page)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => openSEODialog(page)}
                          >
                            <Search className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeletePage(page.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="published" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Pages Publiées ({publishedPages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {publishedPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(page.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{page.title}</h3>
                          <p className="text-sm text-gray-600">{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-green-100 text-green-800">En ligne</Badge>
                        <Button size="sm" variant="outline" onClick={() => window.open(`/front${page.slug}`, '_blank')}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="drafts" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Brouillons ({draftPages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {draftPages.map((page) => (
                    <div key={page.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-white">
                      <div className="flex items-center space-x-4">
                        {getTypeIcon(page.type)}
                        <div>
                          <h3 className="font-medium text-gray-900">{page.title}</h3>
                          <p className="text-sm text-gray-600">{page.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge className="bg-yellow-100 text-yellow-800">Brouillon</Badge>
                        <Button size="sm" variant="outline" onClick={() => openEditDialog(page)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDeletePage(page.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">SEO Global du Site</CardTitle>
              </CardHeader>
              <CardContent>
                <SEOManager
                  initialData={{
                    title: "MusiConnect - Plateforme de booking d'artistes",
                    description: "Découvrez notre plateforme de booking d'artistes et créons ensemble des expériences musicales exceptionnelles pour vos événements.",
                    keywords: "booking, artistes, musique, événements, concerts, spectacles",
                    focusKeyword: "booking artiste"
                  }}
                  onSave={(data) => {
                    console.log('SEO global sauvegardé:', data);
                    toast.success('SEO global sauvegardé');
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Paramètres du Site</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo du Site</label>
                  <div className="flex items-center space-x-4">
                    <img 
                      src={logoUrl} 
                      alt="Logo actuel" 
                      className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                    />
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        id="logo-upload"
                        disabled={uploading}
                      />
                      <label htmlFor="logo-upload">
                        <Button variant="outline" className="cursor-pointer" asChild disabled={uploading}>
                          <span>
                            <Upload className="h-4 w-4 mr-2" />
                            {uploading ? 'Upload en cours...' : 'Changer le logo'}
                          </span>
                        </Button>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Formats acceptés: JPG, PNG, SVG. Taille recommandée: 200x200px
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Site</label>
                  <Input 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Nom de votre site" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description du Site</label>
                  <Textarea 
                    value={siteDescription}
                    onChange={(e) => setSiteDescription(e.target.value)}
                    placeholder="Description de votre site"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSiteSettingsSave} className="bg-blue-600 text-white hover:bg-blue-700">
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media" className="mt-6">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">Médiathèque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[
                    { type: 'image', name: 'hero-banner.jpg', size: '2.4 MB' },
                    { type: 'image', name: 'artist-photo.jpg', size: '1.8 MB' },
                    { type: 'video', name: 'promo-video.mp4', size: '15.2 MB' },
                    { type: 'image', name: 'event-poster.png', size: '3.1 MB' },
                  ].map((media, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 text-center bg-white">
                      {media.type === 'image' ? (
                        <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      ) : (
                        <Video className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      )}
                      <p className="text-sm font-medium text-gray-900">{media.name}</p>
                      <p className="text-xs text-gray-500">{media.size}</p>
                    </div>
                  ))}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-white hover:border-gray-400 cursor-pointer">
                    <Plus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">Ajouter un média</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la page</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdatePage} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titre de la page"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL (slug)</label>
                  <Input
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="/ma-page"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="page">Page</SelectItem>
                      <SelectItem value="blog">Article de blog</SelectItem>
                      <SelectItem value="event">Événement</SelectItem>
                      <SelectItem value="artist">Artiste</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                  <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description SEO</label>
                <Textarea
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  placeholder="Description pour les moteurs de recherche..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenu</label>
                <Textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Contenu de la page..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                  Mettre à jour
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* SEO Dialog */}
        <Dialog open={showSEODialog} onOpenChange={setShowSEODialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Optimisation SEO - {selectedPage?.title}</DialogTitle>
            </DialogHeader>
            {selectedPage && (
              <SEOManager
                initialData={{
                  title: selectedPage.seoTitle || selectedPage.title,
                  description: selectedPage.metaDescription || '',
                  keywords: selectedPage.keywords || '',
                  focusKeyword: selectedPage.focusKeyword || ''
                }}
                onSave={handleSEOSave}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
