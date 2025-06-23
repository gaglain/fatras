
import React, { useState, useEffect } from 'react';
import { Block } from '@/components/BlockEditor/types';
import { TextBlock } from '@/components/BlockEditor/blocks/TextBlock';
import { ImageBlock } from '@/components/BlockEditor/blocks/ImageBlock';
import { HeroBlock } from '@/components/BlockEditor/blocks/HeroBlock';
import { ArtistGridBlock } from '@/components/BlockEditor/blocks/ArtistGridBlock';
import { SEOHead } from '@/components/SEOHead';

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

  useEffect(() => {
    // Charger les données de la page depuis localStorage
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

    return (
      <div key={block.id}>
        <BlockComponent
          content={block.content}
          isEditing={false}
          onChange={() => {}} // En lecture seule sur le front
        />
      </div>
    );
  };

  return (
    <>
      <SEOHead 
        title={pageData.title + ' - MusiConnect'}
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
