
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

const defaultArtistsPage: WebPage = {
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
};

export const FrontArtists: React.FC = () => {
  const [pageData, setPageData] = useState<WebPage>(defaultArtistsPage);
  const { artists, loading } = useBackofficeArtists();

  useEffect(() => {
    // Charger les données de la page depuis localStorage
    const savedPages = localStorage.getItem('websitePages');
    if (savedPages) {
      try {
        const pages = JSON.parse(savedPages);
        const artistsPage = pages.find((page: WebPage) => page.slug === '/artists' || page.id === '2');
        if (artistsPage) {
          setPageData(artistsPage);
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

    // Passer les données d'artistes synchronisées au block artist-grid
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
