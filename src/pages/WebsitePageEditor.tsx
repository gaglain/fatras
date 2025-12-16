import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PageBuilder, WebPage, Block } from '@/components/page-builder';

const defaultPages: WebPage[] = [
  { id: '1', title: 'Accueil', slug: '/', status: 'published', metaDescription: '', blocks: [] },
  { id: '2', title: 'Nos Artistes', slug: '/artists', status: 'published', metaDescription: '', blocks: [] },
  { id: '3', title: 'Événements', slug: '/events', status: 'published', metaDescription: '', blocks: [] },
  { id: '4', title: 'Contact', slug: '/contact', status: 'published', metaDescription: '', blocks: [] }
];

export const WebsitePageEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<WebPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedPages = localStorage.getItem('websitePages');
    let pagesData = defaultPages;
    
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        if (Array.isArray(parsed) && parsed.length > 0) pagesData = parsed;
      } catch (e) {}
    }
    
    const foundPage = pagesData.find(p => p.id === pageId);
    
    if (foundPage) {
      setPage(foundPage);
    } else if (pageId === 'new') {
      setPage({
        id: `page-${Date.now()}`,
        title: 'Nouvelle Page',
        slug: `/nouvelle-page-${Date.now()}`,
        status: 'draft',
        metaDescription: '',
        blocks: []
      });
    } else {
      toast.error('Page non trouvée');
    }
    
    setIsLoading(false);
  }, [pageId]);

  const handleSave = (updatedPage: WebPage) => {
    const savedPages = localStorage.getItem('websitePages');
    let pagesData = defaultPages;
    
    if (savedPages) {
      try {
        const parsed = JSON.parse(savedPages);
        if (Array.isArray(parsed)) pagesData = parsed;
      } catch (e) {}
    }
    
    const updatedPages = pagesData.map(p => p.id === updatedPage.id ? updatedPage : p);
    if (!pagesData.find(p => p.id === updatedPage.id)) {
      updatedPages.push(updatedPage);
    }
    
    localStorage.setItem('websitePages', JSON.stringify(updatedPages));
    setPage(updatedPage);
  };

  const handlePreview = () => {
    if (page) {
      window.open(`${window.location.origin}/front${page.slug}`, '_blank');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!page) {
    return <div className="flex items-center justify-center h-screen">Page non trouvée</div>;
  }

  return (
    <PageBuilder
      page={page}
      onSave={handleSave}
      onBack={() => navigate('/website')}
      onPreview={handlePreview}
    />
  );
};
