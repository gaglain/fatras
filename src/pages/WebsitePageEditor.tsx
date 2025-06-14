
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BlockEditor } from '@/components/BlockEditor/BlockEditor';
import { Block } from '@/components/BlockEditor/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';

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
    blocks: [
      {
        id: '1',
        type: 'hero',
        order: 0,
        content: {
          title: 'Créons des Moments Magiques',
          subtitle: 'Découvrez nos artistes talentueux et créons ensemble des expériences musicales exceptionnelles pour vos événements',
          backgroundImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
          buttonText: 'Découvrir nos Artistes',
          buttonLink: '/front/artists'
        }
      },
      {
        id: '2',
        type: 'artist-grid',
        order: 1,
        content: {
          title: 'Nos Artistes',
          subtitle: 'Découvrez les talents qui font vibrer nos scènes',
          showRating: true,
          showStats: true
        }
      }
    ]
  },
  {
    id: '2',
    title: 'Nos Artistes',
    slug: '/artists',
    status: 'published',
    metaDescription: 'Découvrez notre sélection d\'artistes exceptionnels',
    blocks: [
      {
        id: '3',
        type: 'text',
        order: 0,
        content: {
          text: '<h1>Nos Artistes</h1><p>Découvrez notre sélection d\'artistes talentueux</p>'
        }
      },
      {
        id: '4',
        type: 'artist-grid',
        order: 1,
        content: {
          title: 'Tous nos Artistes',
          showRating: true,
          showStats: true
        }
      }
    ]
  },
  {
    id: '3',
    title: 'Événements',
    slug: '/events',
    status: 'published',
    metaDescription: 'Ne manquez aucun de nos événements musicaux',
    blocks: [
      {
        id: '5',
        type: 'text',
        order: 0,
        content: {
          text: '<h1>Nos Événements</h1><p>Découvrez tous nos événements à venir</p>'
        }
      }
    ]
  },
  {
    id: '4',
    title: 'Contact',
    slug: '/contact',
    status: 'published',
    metaDescription: 'Contactez-nous pour vos projets musicaux',
    blocks: [
      {
        id: '6',
        type: 'text',
        order: 0,
        content: {
          text: '<h1>Contactez-nous</h1><p>Nous sommes là pour réaliser vos projets musicaux</p>'
        }
      }
    ]
  }
];

export const WebsitePageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<WebPage | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load page data
    const loadPage = () => {
      console.log('Loading page data for ID:', pageId);
      
      // Try to load from localStorage first
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
        setBlocks(foundPage.blocks || []);
      } else {
        console.error('Page not found for ID:', pageId);
        toast.error('Page non trouvée');
      }
      
      setIsLoading(false);
    };

    loadPage();
  }, [pageId]);

  const handleSave = (newBlocks: Block[]) => {
    if (!page) {
      toast.error('Impossible de sauvegarder : page non trouvée');
      return;
    }

    console.log('Saving blocks:', newBlocks);

    // Update the page with new blocks
    const updatedPage = { ...page, blocks: newBlocks };
    setPage(updatedPage);
    setBlocks(newBlocks);
    
    // Save to localStorage
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
    
    // Update the page in the array
    const updatedPages = pagesData.map(p => 
      p.id === pageId ? updatedPage : p
    );
    
    // Save back to localStorage
    localStorage.setItem('websitePages', JSON.stringify(updatedPages));
    
    // Here you would normally save to your backend as well
    console.log('Saving page:', updatedPage);
    
    toast.success('Page sauvegardée avec succès');
  };

  const handlePreview = () => {
    if (page) {
      window.open(`/front${page.slug}`, '_blank');
    }
  };

  if (isLoading) {
    return <div className="p-6">Chargement...</div>;
  }

  if (!page) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page non trouvée</h1>
          <Button onClick={() => navigate('/admin')} className="bg-[#1632f4] hover:bg-[#1632f4]/90 text-white">
            Retour à la gestion des pages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Édition : {page.title}</h1>
              <p className="text-sm text-gray-600">{page.slug}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
          </div>
        </div>
      </div>
      
      <BlockEditor
        initialBlocks={blocks}
        onSave={handleSave}
      />
    </div>
  );
};
