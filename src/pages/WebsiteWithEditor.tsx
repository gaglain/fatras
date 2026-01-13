
import React, { useState } from 'react';
import { BlockEditor } from '@/components/BlockEditor/BlockEditor';
import { Block } from '@/components/BlockEditor/types';

const defaultBlocks: Block[] = [
  {
    id: '1',
    type: 'hero',
    order: 0,
    content: {
      title: 'Créons des Moments Magiques',
      subtitle: 'Découvrez nos artistes talentueux et créons ensemble des expériences musicales exceptionnelles pour vos événements',
      backgroundImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200',
      buttonText: 'Découvrir nos Artistes',
      buttonLink: '#artists'
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
];

export const WebsiteWithEditor: React.FC = () => {
  const [blocks, setBlocks] = useState<Block[]>(defaultBlocks);

  const handleSave = (newBlocks: Block[]) => {
    setBlocks(newBlocks);
    // Ici vous pourriez sauvegarder en base de données
  };

  return (
    <BlockEditor
      initialBlocks={blocks}
      onSave={handleSave}
    />
  );
};
