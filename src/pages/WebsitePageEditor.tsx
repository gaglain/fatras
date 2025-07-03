
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Plus, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface Block {
  id: string;
  type: string;
  order: number;
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
    metaDescription: 'Page d\'accueil de MusiConnect',
    blocks: []
  },
  {
    id: '2',
    title: 'Nos Artistes',
    slug: '/artists',
    status: 'published',
    metaDescription: 'Découvrez notre sélection d\'artistes exceptionnels',
    blocks: []
  },
  {
    id: '3',
    title: 'Événements',
    slug: '/events',
    status: 'published',
    metaDescription: 'Ne manquez aucun de nos événements musicaux',
    blocks: []
  },
  {
    id: '4',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    metaDescription: 'Contactez-nous pour vos projets musicaux',
    blocks: []
  }
];

export const WebsitePageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<WebPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  useEffect(() => {
    const loadPage = () => {
      console.log('Loading page data for ID:', pageId);
      
      const savedPages = localStorage.getItem('websitePages');
      let pagesData = defaultPages;
      
      if (savedPages) {
        try {
          const parsed = JSON.parse(savedPages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            pagesData = parsed;
          }
        } catch (e) {
          console.error('Error parsing saved pages:', e);
        }
      }
      
      const foundPage = pagesData.find(p => p.id === pageId);
      
      if (foundPage) {
        console.log('Found page:', foundPage);
        setPage(foundPage);
      } else if (pageId === 'new') {
        // Création d'une nouvelle page
        const newPage: WebPage = {
          id: `page-${Date.now()}`,
          title: 'Nouvelle Page',
          slug: `/nouvelle-page-${Date.now()}`,
          status: 'draft',
          metaDescription: '',
          blocks: []
        };
        setPage(newPage);
      } else {
        console.error('Page not found for ID:', pageId);
        toast.error('Page non trouvée');
      }
      
      setIsLoading(false);
    };

    loadPage();
  }, [pageId]);

  const handleSave = () => {
    if (!page) {
      toast.error('Impossible de sauvegarder : page non trouvée');
      return;
    }

    console.log('Saving page:', page);

    const savedPages = localStorage.getItem('websitePages');
    let pagesData = defaultPages;
    
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        if (Array.isArray(parsed)) {
          pagesData = parsed;
        }
      } catch (e) {
        console.error('Error parsing saved pages:', e);
      }
    }
    
    const updatedPages = pagesData.map(p => 
      p.id === page.id ? page : p
    );
    
    // Si c'est une nouvelle page, l'ajouter
    if (!pagesData.find(p => p.id === page.id)) {
      updatedPages.push(page);
    }
    
    localStorage.setItem('websitePages', JSON.stringify(updatedPages));
    
    toast.success('Page sauvegardée avec succès');
  };

  const handlePreview = () => {
    if (page) {
      const previewUrl = `${window.location.origin}/front${page.slug}`;
      window.open(previewUrl, '_blank');
      toast.success('Aperçu ouvert dans un nouvel onglet');
    }
  };

  const handlePageInfoSave = () => {
    setIsEditingInfo(false);
    handleSave();
  };

  const addNewBlock = (type: string) => {
    if (page) {
      const newBlock: Block = {
        id: `block-${Date.now()}`,
        type,
        order: page.blocks.length,
        content: getDefaultContent(type)
      };
      
      setPage(prev => prev ? {
        ...prev,
        blocks: [...prev.blocks, newBlock]
      } : null);
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Votre texte ici...' };
      case 'image':
        return { src: '/placeholder.svg', alt: 'Image' };
      case 'button':
        return { text: 'Bouton', link: '#' };
      default:
        return {};
    }
  };

  if (isLoading) {
    return (
      <div className="p-6" style={{
        backgroundColor: 'var(--app-background, #ffffff)',
        color: 'var(--app-text, #18181b)',
        minHeight: '100vh'
      }}>
        Chargement...
      </div>
    );
  }

  if (!page) {
    return (
      <div className="p-6" style={{
        backgroundColor: 'var(--app-background, #ffffff)',
        color: 'var(--app-text, #18181b)',
        minHeight: '100vh'
      }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Page non trouvée</h1>
          <Button onClick={() => navigate('/website')} style={{
            backgroundColor: 'var(--app-button-bg, #1632f4)',
            color: 'var(--app-button-text, #ffffff)'
          }}>
            Retour à la gestion des pages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--app-background, #ffffff)',
      color: 'var(--app-text, #18181b)',
      minHeight: '100vh'
    }}>
      <div className="border-b px-6 py-4" style={{
        backgroundColor: 'var(--app-card-bg, #ffffff)',
        borderColor: 'var(--notification-border, #e5e7eb)'
      }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/website')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Édition : {page.title}</h1>
              <p className="text-sm" style={{ color: 'var(--app-text, #666666)' }}>{page.slug}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSave} style={{
              backgroundColor: 'var(--app-button-bg, #1632f4)',
              color: 'var(--app-button-text, #ffffff)'
            }}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Page Information */}
        <div className="lg:col-span-1">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Informations de la page
                </CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditingInfo(!isEditingInfo)}
                >
                  {isEditingInfo ? 'Annuler' : 'Modifier'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditingInfo ? (
                <>
                  <div>
                    <Label>Titre de la page</Label>
                    <Input
                      value={page.title}
                      onChange={(e) => setPage(prev => prev ? { ...prev, title: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>URL (slug)</Label>
                    <Input
                      value={page.slug}
                      onChange={(e) => setPage(prev => prev ? { ...prev, slug: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <Label>Description Meta</Label>
                    <Input
                      value={page.metaDescription}
                      onChange={(e) => setPage(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                    />
                  </div>
                  <Button onClick={handlePageInfoSave} className="w-full" style={{
                    backgroundColor: 'var(--app-button-bg, #1632f4)',
                    color: 'var(--app-button-text, #ffffff)'
                  }}>
                    Sauvegarder les infos
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <Label>Titre</Label>
                    <p className="font-medium">{page.title}</p>
                  </div>
                  <div>
                    <Label>URL</Label>
                    <p className="font-mono text-sm">{page.slug}</p>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <p className="capitalize">{page.status}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Block Library */}
          <Card className="mt-4" style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle>Ajouter des blocs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => addNewBlock('text')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bloc Texte
              </Button>
              <Button
                onClick={() => addNewBlock('image')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bloc Image
              </Button>
              <Button
                onClick={() => addNewBlock('button')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bloc Bouton
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Page Content */}
        <div className="lg:col-span-2">
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle>Contenu de la page</CardTitle>
            </CardHeader>
            <CardContent>
              {page.blocks.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--app-text, #666666)' }}>
                  <h3 className="text-lg font-medium mb-2">Page vide</h3>
                  <p className="mb-4">Commencez par ajouter des blocs à votre page</p>
                  <Button onClick={() => addNewBlock('text')} style={{
                    backgroundColor: 'var(--app-button-bg, #1632f4)',
                    color: 'var(--app-button-text, #ffffff)'
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un bloc
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {page.blocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-4 border rounded-lg"
                      style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium capitalize">{block.type}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setPage(prev => prev ? {
                              ...prev,
                              blocks: prev.blocks.filter(b => b.id !== block.id)
                            } : null);
                          }}
                          className="text-red-600"
                        >
                          Supprimer
                        </Button>
                      </div>
                      <div className="preview-content">
                        {block.type === 'text' && (
                          <p>{block.content.text}</p>
                        )}
                        {block.type === 'image' && (
                          <img src={block.content.src} alt={block.content.alt} className="max-w-full h-32 object-cover" />
                        )}
                        {block.type === 'button' && (
                          <Button variant="outline">{block.content.text}</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
