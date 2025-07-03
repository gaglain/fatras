
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, Eye, Plus, Settings, Trash2 } from 'lucide-react';
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
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [blockContent, setBlockContent] = useState<any>({});

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
      
      toast.success(`Bloc ${type} ajouté`);
    }
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { 
          content: 'Votre texte ici...', 
          alignment: 'left',
          fontSize: 'base'
        };
      case 'hero':
        return { 
          title: 'Titre Principal', 
          subtitle: 'Sous-titre descriptif',
          backgroundImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
          buttonText: 'En savoir plus',
          buttonLink: '#'
        };
      case 'image':
        return { 
          src: '/placeholder.svg', 
          alt: 'Image', 
          alignment: 'center',
          size: 'md'
        };
      case 'gallery':
        return {
          title: 'Galerie Photos',
          images: ['/placeholder.svg'],
          columns: 3
        };
      case 'contact-form':
        return {
          title: 'Nous Contacter',
          fields: ['name', 'email', 'message']
        };
      default:
        return {};
    }
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block.id);
    setBlockContent(block.content);
  };

  const handleSaveBlock = () => {
    if (!editingBlock || !page) return;
    
    const updatedBlocks = page.blocks.map(block => 
      block.id === editingBlock 
        ? { ...block, content: blockContent }
        : block
    );
    
    setPage(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
    setEditingBlock(null);
    setBlockContent({});
    toast.success('Bloc mis à jour');
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!page) return;
    
    if (confirm('Supprimer ce bloc ?')) {
      const updatedBlocks = page.blocks.filter(block => block.id !== blockId);
      setPage(prev => prev ? { ...prev, blocks: updatedBlocks } : null);
      toast.success('Bloc supprimé');
    }
  };

  const renderBlockEditor = (block: Block) => {
    const isEditing = editingBlock === block.id;
    const content = isEditing ? blockContent : block.content;

    return (
      <div
        key={block.id}
        className="border rounded-lg p-4 mb-4"
        style={{ borderColor: 'var(--notification-border, #e5e7eb)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {block.type}
          </span>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSaveBlock}>
                  <Save className="h-4 w-4 mr-1" />
                  Sauver
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setEditingBlock(null);
                    setBlockContent({});
                  }}
                >
                  Annuler
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditBlock(block)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDeleteBlock(block.id)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Éditeur selon le type de bloc */}
        {block.type === 'text' && (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <Label>Contenu</Label>
                  <textarea
                    className="w-full p-2 border rounded min-h-[100px]"
                    value={content.content || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, content: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alignement</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={content.alignment || 'left'}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, alignment: e.target.value }))}
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  <div>
                    <Label>Taille</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={content.fontSize || 'base'}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, fontSize: e.target.value }))}
                    >
                      <option value="sm">Petit</option>
                      <option value="base">Normal</option>
                      <option value="lg">Grand</option>
                      <option value="xl">Très grand</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div 
                className={`text-${content.alignment || 'left'} text-${content.fontSize || 'base'}`}
                style={{ whiteSpace: 'pre-wrap', color: 'var(--app-text, #18181b)' }}
              >
                {content.content}
              </div>
            )}
          </div>
        )}

        {block.type === 'hero' && (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <Label>Titre</Label>
                  <Input
                    value={content.title || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Sous-titre</Label>
                  <Input
                    value={content.subtitle || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, subtitle: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Image de fond (URL)</Label>
                  <Input
                    value={content.backgroundImage || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, backgroundImage: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Texte du bouton</Label>
                    <Input
                      value={content.buttonText || ''}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, buttonText: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Lien du bouton</Label>
                    <Input
                      value={content.buttonLink || ''}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, buttonLink: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div 
                className="relative h-64 bg-cover bg-center rounded-lg flex items-center justify-center"
                style={{ 
                  backgroundImage: `url(${content.backgroundImage})`,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  backgroundBlendMode: 'overlay'
                }}
              >
                <div className="text-center text-white">
                  <h2 className="text-3xl font-bold mb-2">{content.title}</h2>
                  <p className="text-lg mb-4">{content.subtitle}</p>
                  {content.buttonText && (
                    <Button className="bg-white text-black hover:bg-gray-100">
                      {content.buttonText}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-3">
            {isEditing ? (
              <>
                <div>
                  <Label>URL de l'image</Label>
                  <Input
                    value={content.src || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, src: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Texte alternatif</Label>
                  <Input
                    value={content.alt || ''}
                    onChange={(e) => setBlockContent(prev => ({ ...prev, alt: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alignement</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={content.alignment || 'center'}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, alignment: e.target.value }))}
                    >
                      <option value="left">Gauche</option>
                      <option value="center">Centre</option>
                      <option value="right">Droite</option>
                    </select>
                  </div>
                  <div>
                    <Label>Taille</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={content.size || 'md'}
                      onChange={(e) => setBlockContent(prev => ({ ...prev, size: e.target.value }))}
                    >
                      <option value="sm">Petit</option>
                      <option value="md">Moyen</option>
                      <option value="lg">Grand</option>
                      <option value="full">Pleine largeur</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-${content.alignment || 'center'}`}>
                <img 
                  src={content.src} 
                  alt={content.alt} 
                  className={`
                    ${content.size === 'sm' ? 'max-w-xs' : ''}
                    ${content.size === 'md' ? 'max-w-md' : ''}
                    ${content.size === 'lg' ? 'max-w-lg' : ''}
                    ${content.size === 'full' ? 'w-full' : ''}
                    ${content.alignment === 'center' ? 'mx-auto' : ''}
                    ${content.alignment === 'right' ? 'ml-auto' : ''}
                    h-auto object-cover rounded
                  `}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
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
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Page Information */}
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }} className="mb-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Informations
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
                    <textarea
                      className="w-full p-2 border rounded min-h-[80px]"
                      value={page.metaDescription}
                      onChange={(e) => setPage(prev => prev ? { ...prev, metaDescription: e.target.value } : null)}
                    />
                  </div>
                  <Button 
                    onClick={() => {
                      setIsEditingInfo(false);
                      handleSave();
                    }} 
                    className="w-full" 
                    style={{
                      backgroundColor: 'var(--app-button-bg, #1632f4)',
                      color: 'var(--app-button-text, #ffffff)'
                    }}
                  >
                    Sauvegarder
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
          <Card style={{
            backgroundColor: 'var(--app-card-bg, #ffffff)',
            color: 'var(--app-card-text, #18181b)',
            border: '1px solid var(--notification-border, #e5e7eb)'
          }}>
            <CardHeader>
              <CardTitle>Ajouter des blocs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => addNewBlock('hero')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Bloc Hero
              </Button>
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
                onClick={() => addNewBlock('gallery')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Galerie
              </Button>
              <Button
                onClick={() => addNewBlock('contact-form')}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Formulaire Contact
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
                  <Button onClick={() => addNewBlock('hero')} style={{
                    backgroundColor: 'var(--app-button-bg, #1632f4)',
                    color: 'var(--app-button-text, #ffffff)'
                  }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un bloc Hero
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {page.blocks
                    .sort((a, b) => a.order - b.order)
                    .map(renderBlockEditor)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
