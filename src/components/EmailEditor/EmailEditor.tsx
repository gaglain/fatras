
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, GripVertical, Trash2, Eye } from 'lucide-react';
import { EmailBlock, TextBlockContent, HeadingBlockContent, ImageBlockContent, ButtonBlockContent, SpacerBlockContent, DividerBlockContent } from './types';
import { BlockToolbar } from './BlockToolbar';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { EmailPreview } from './EmailPreview';

interface EmailEditorProps {
  initialBlocks?: EmailBlock[];
  onSave: (blocks: EmailBlock[]) => void;
  onPreview?: (blocks: EmailBlock[]) => void;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
  initialBlocks = [],
  onSave,
  onPreview
}) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const addBlock = (type: EmailBlock['type']) => {
    const newBlock: EmailBlock = {
      id: Date.now().toString(),
      type,
      order: blocks.length,
      content: getDefaultContent(type)
    };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(newBlock.id);
  };

  const getDefaultContent = (type: EmailBlock['type']): TextBlockContent | HeadingBlockContent | ImageBlockContent | ButtonBlockContent | SpacerBlockContent | DividerBlockContent => {
    switch (type) {
      case 'text':
        return { text: 'Tapez votre texte ici...', fontSize: 16, fontWeight: 'normal', textAlign: 'left', color: '#000000' } as TextBlockContent;
      case 'heading':
        return { text: 'Votre titre', level: 2, textAlign: 'left', color: '#000000' } as HeadingBlockContent;
      case 'image':
        return { src: '', alt: '', width: 100, alignment: 'center' } as ImageBlockContent;
      case 'button':
        return { text: 'Cliquez ici', link: '', backgroundColor: '#007bff', textColor: '#ffffff', borderRadius: 4, padding: '12px 24px', alignment: 'center' } as ButtonBlockContent;
      case 'spacer':
        return { height: 20 } as SpacerBlockContent;
      case 'divider':
        return { color: '#cccccc', thickness: 1, style: 'solid' } as DividerBlockContent;
      default:
        return { text: '', fontSize: 16, fontWeight: 'normal', textAlign: 'left', color: '#000000' } as TextBlockContent;
    }
  };

  const updateBlock = (blockId: string, content: Record<string, any>) => {
    setBlocks(blocks.map(block =>
      block.id === blockId ? { ...block, content } : block
    ));
  };

  const deleteBlock = (blockId: string) => {
    setBlocks(blocks.filter(block => block.id !== blockId));
    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
    }
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blockIndex = blocks.findIndex(block => block.id === blockId);
    if (blockIndex === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? blockIndex - 1 : blockIndex + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[blockIndex], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[blockIndex]];
      setBlocks(newBlocks);
    }
  };

  const renderBlock = (block: EmailBlock) => {
    const isSelected = selectedBlockId === block.id;

    switch (block.type) {
      case 'text':
        return <TextBlock content={block.content as TextBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      case 'heading':
        return <HeadingBlock content={block.content as HeadingBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      case 'image':
        return <ImageBlock content={block.content as ImageBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      case 'button':
        return <ButtonBlock content={block.content as ButtonBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      case 'spacer':
        return <SpacerBlock content={block.content as SpacerBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      case 'divider':
        return <DividerBlock content={block.content as DividerBlockContent} onChange={(content) => updateBlock(block.id, content)} />;
      default:
        return null;
    }
  };

  if (showPreview) {
    return (
      <EmailPreview
        blocks={blocks}
        onClose={() => setShowPreview(false)}
        onSave={() => onSave(blocks)}
      />
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Éditeur d'Email</h2>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                <Eye className="h-4 w-4 mr-2" />
                Aperçu
              </Button>
              <Button onClick={() => onSave(blocks)} className="bg-purple-600 hover:bg-purple-700">
                Sauvegarder
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {blocks.map((block) => (
            <Card
              key={block.id}
              className={`relative group cursor-pointer transition-all ${
                selectedBlockId === block.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedBlockId(block.id)}
            >
              <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'up');
                  }}
                >
                  ↑
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    moveBlock(block.id, 'down');
                  }}
                >
                  ↓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteBlock(block.id);
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <CardContent className="p-4 pl-8">
                {renderBlock(block)}
              </CardContent>
            </Card>
          ))}

          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="p-6 text-center">
              <p className="text-gray-500 mb-4">Ajoutez un nouveau bloc</p>
              <BlockToolbar onAddBlock={addBlock} />
            </CardContent>
          </Card>
        </div>
      </div>

      {selectedBlockId && (
        <div className="w-80 border-l bg-gray-50 p-4">
          <h3 className="font-semibold mb-4">Propriétés du bloc</h3>
          {/* Les propriétés seront affichées ici selon le type de bloc sélectionné */}
        </div>
      )}
    </div>
  );
};
