
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
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
          slug: '/nouvelle-page',
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
      window.open(`/front${page.slug}`, '_blank');
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
      
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-4">Éditeur de page</h2>
          <p style={{ color: 'var(--app-text, #666666)' }}>
            L'éditeur de blocs sera bientôt disponible pour personnaliser cette page.
          </p>
        </div>
      </div>
    </div>
  );
};
