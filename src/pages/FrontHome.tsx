
import React, { useState, useEffect } from 'react';
import { Block } from '@/components/BlockEditor/types';
import { TextBlock } from '@/components/BlockEditor/blocks/TextBlock';
import { ImageBlock } from '@/components/BlockEditor/blocks/ImageBlock';
import { HeroBlock } from '@/components/BlockEditor/blocks/HeroBlock';
import { ArtistGridBlock } from '@/components/BlockEditor/blocks/ArtistGridBlock';
import { SEOHead } from '@/components/SEOHead';
import { useBackofficeArtists } from '@/hooks/useBackofficeData';

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'archived';
  blocks: Block[];
  metaDescription: string;
}

const defaultHomePage: WebPage = {
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
};

export const FrontHome: React.FC = () => {
  const [pageData, setPageData] = useState<WebPage>(defaultHomePage);
  const [siteName, setSiteName] = useState('MusiConnect');
  const { artists, loading } = useBackofficeArtists();

  // FONCTION DE CHARGEMENT UNIFIÉE ET AGRESSIVE POUR LE SITE NAME
  const loadSiteName = () => {
    console.log('🔍 FrontHome - Loading site name...');
    
    try {
      // PRIORITÉ ABSOLUE : websiteDesign
      const savedDesign = localStorage.getItem('websiteDesign');
      if (savedDesign) {
        const design = JSON.parse(savedDesign);
        console.log('✅ FrontHome - Design found:', design);
        
        if (design.siteName) {
          setSiteName(design.siteName);
          document.title = design.siteName;
          console.log('🎯 FrontHome - Applied siteName:', design.siteName);
          return;
        }
      }

      // Fallback vers websiteSettings
      const savedSettings = localStorage.getItem('websiteSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('📋 FrontHome - Settings fallback:', settings);
        
        if (settings.siteName) {
          setSiteName(settings.siteName);
          document.title = settings.siteName;
          console.log('🎯 FrontHome - Applied siteName from settings:', settings.siteName);
        }
      }

    } catch (error) {
      console.error('❌ FrontHome - Error loading site name:', error);
    }
  };

  useEffect(() => {
    console.log('🚀 FrontHome - Initializing...');
    
    // Chargement immédiat
    loadSiteName();
    
    // Charger les données de la page
    const savedPages = localStorage.getItem('websitePages');
    if (savedPages) {
      try {
        const pages = JSON.parse(savedPages);
        const homePage = pages.find((page: WebPage) => page.slug === '/' || page.id === '1');
        if (homePage) {
          setPageData(homePage);
        }
      } catch (e) {
        console.error('Error loading page data:', e);
      }
    }

    const handleUpdate = () => {
      console.log('📡 FrontHome - Event received, reloading...');
      setTimeout(loadSiteName, 10);
    };

    // Écouter TOUS les événements
    window.addEventListener('websiteDesignUpdated', handleUpdate);
    window.addEventListener('websiteDesignSaved', handleUpdate);
    window.addEventListener('websiteSettingsUpdated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    
    // Polling agressif toutes les secondes
    const interval = setInterval(loadSiteName, 1000);

    return () => {
      window.removeEventListener('websiteDesignUpdated', handleUpdate);
      window.removeEventListener('websiteDesignSaved', handleUpdate);
      window.removeEventListener('websiteSettingsUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      clearInterval(interval);
    };
  }, []);

  const renderBlock = (block: Block) => {
    let BlockComponent;
    switch (block.type) {
      case 'text':
        BlockComponent = TextBlock;
        break;
      case 'image':
        BlockComponent = ImageBlock;
        break;
      case 'hero':
        BlockComponent = HeroBlock;
        break;
      case 'artist-grid':
        BlockComponent = ArtistGridBlock;
        break;
      default:
        return null;
    }

    const blockProps = {
      content: block.content,
      isEditing: false,
      onChange: () => {},
      ...(block.type === 'artist-grid' && { artists, loading })
    };

    return (
      <div key={block.id}>
        <BlockComponent {...blockProps} />
      </div>
    );
  };

  return (
    <>
      <SEOHead 
        title={pageData.title + ' - ' + siteName}
        description={pageData.metaDescription}
      />
      
      <div className="min-h-screen">
        {pageData.blocks
          .sort((a, b) => a.order - b.order)
          .map(renderBlock)}
      </div>
    </>
  );
};
