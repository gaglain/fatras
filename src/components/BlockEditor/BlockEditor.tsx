
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Settings, Eye, Edit3 } from 'lucide-react';
import { Block, BlockType } from './types';
import { BlockToolbar } from './BlockToolbar';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { HeroBlock } from './blocks/HeroBlock';
import { ArtistGridBlock } from './blocks/ArtistGridBlock';

interface BlockEditorProps {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ initialBlocks, onSave }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: blocks.length
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlockId(null);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      setBlocks(newBlocks);
    }
  };

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id;
    
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
      <div
        key={block.id}
        className={`relative group ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
        onClick={() => isEditing && setSelectedBlockId(block.id)}
      >
        {isEditing && (
          <BlockToolbar
            block={block}
            isSelected={isSelected}
            onMoveUp={() => moveBlock(block.id, 'up')}
            onMoveDown={() => moveBlock(block.id, 'down')}
            onDelete={() => deleteBlock(block.id)}
          />
        )}
        <BlockComponent
          content={block.content}
          isEditing={isEditing}
          onChange={(content) => updateBlock(block.id, content)}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre d'outils principale */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setIsEditing(!isEditing)}
              variant={isEditing ? "default" : "outline"}
              className="flex items-center"
            >
              {isEditing ? <Eye className="h-4 w-4 mr-2" /> : <Edit3 className="h-4 w-4 mr-2" />}
              {isEditing ? 'Aperçu' : 'Modifier'}
            </Button>
            
            {isEditing && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => addBlock('text')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Texte
                </Button>
                <Button
                  onClick={() => addBlock('image')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Image
                </Button>
                <Button
                  onClick={() => addBlock('hero')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Hero
                </Button>
                <Button
                  onClick={() => addBlock('artist-grid')}
                  variant="outline"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Artistes
                </Button>
              </div>
            )}
          </div>
          
          {isEditing && (
            <Button
              onClick={() => onSave(blocks)}
              className="bg-green-600 hover:bg-green-700"
            >
              Sauvegarder
            </Button>
          )}
        </div>
      </div>

      {/* Contenu des blocs */}
      <div className="max-w-7xl mx-auto">
        {blocks.map(renderBlock)}
        
        {isEditing && blocks.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-500 mb-4">Aucun bloc ajouté. Commencez par ajouter du contenu !</p>
            <Button onClick={() => addBlock('hero')}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un bloc Hero
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const getDefaultContent = (type: BlockType) => {
  switch (type) {
    case 'text':
      return {
        content: '<p>Nouveau bloc de texte. Cliquez pour éditer.</p>',
        alignment: 'left'
      };
    case 'image':
      return {
        src: '/placeholder.svg',
        alt: 'Image',
        caption: '',
        alignment: 'center'
      };
    case 'hero':
      return {
        title: 'Titre Principal',
        subtitle: 'Sous-titre descriptif',
        backgroundImage: '/placeholder.svg',
        buttonText: 'Call to Action',
        buttonLink: '#'
      };
    case 'artist-grid':
      return {
        title: 'Nos Artistes',
        subtitle: 'Découvrez les talents qui font vibrer nos scènes',
        showRating: true,
        showStats: true
      };
    default:
      return {};
  }
};
