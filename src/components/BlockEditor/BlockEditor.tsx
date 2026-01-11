
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Edit3 } from 'lucide-react';
import { Block, BlockType } from './types';
import { BlockToolbar } from './BlockToolbar';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { HeroBlock } from './blocks/HeroBlock';
import { ArtistGridBlock } from './blocks/ArtistGridBlock';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface BlockEditorProps {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ initialBlocks, onSave }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || []);
  const [isEditing, setIsEditing] = useState(true); // Default to editing mode
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  
  // Ensure we have the latest blocks when initialBlocks changes
  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0) {
      setBlocks(initialBlocks);
      logger.debug('BlockEditor: Received initial blocks', initialBlocks);
    }
  }, [initialBlocks]);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: blocks.length
    };
    setBlocks([...blocks, newBlock]);
    toast.success(`Bloc ${type} ajouté`);
    logger.debug('Added new block:', newBlock);
  };

  const updateBlock = (id: string, content: Record<string, unknown>) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
    logger.debug('Updated block:', id);
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    setSelectedBlockId(null);
    toast.success('Bloc supprimé');
    logger.debug('Deleted block:', id);
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === id);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      setBlocks(newBlocks);
      toast.success(`Bloc déplacé ${direction === 'up' ? 'vers le haut' : 'vers le bas'}`);
      logger.debug('Moved block:', id, direction);
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
        logger.error('Unknown block type:', block.type);
        return null;
    }

    return (
      <div
        key={block.id}
        className={`relative group ${isSelected ? 'ring-2 ring-[#1632f4]' : ''}`}
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

  const handleSave = () => {
    onSave(blocks);
    toast.success('Page sauvegardée avec succès');
    logger.debug('Saving blocks:', blocks.length, 'blocks');
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
              className={`flex items-center ${isEditing ? 'bg-[#1632f4] text-white hover:bg-[#1632f4]/90' : ''}`}
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
              onClick={handleSave}
              className="bg-[#1632f4] hover:bg-[#1632f4]/90 text-white"
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
            <Button onClick={() => addBlock('hero')} className="bg-[#1632f4] hover:bg-[#1632f4]/90 text-white">
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
        text: '<p>Nouveau bloc de texte. Cliquez pour éditer.</p>',
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
