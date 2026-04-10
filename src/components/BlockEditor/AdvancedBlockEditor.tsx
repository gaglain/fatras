import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowUp, ArrowDown, Trash2, Layout } from 'lucide-react';
import { toast } from 'sonner';
import type { Block, BlockType } from './types';
import { AdvancedTextBlock } from './blocks/AdvancedTextBlock';
import { AdvancedImageBlock } from './blocks/AdvancedImageBlock';
import { AdvancedHeroBlock } from './blocks/AdvancedHeroBlock';
import { ArtistGridBlock } from './blocks/ArtistGridBlock';
import { BackgroundImageBlock } from './blocks/BackgroundImageBlock';
import { AdvancedBlockEditorSidebar, blockTypeOptions } from './AdvancedBlockEditorSidebar';

interface AdvancedBlockEditorProps {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => void;
  onCancel?: () => void;
}

const getDefaultContent = (type: BlockType): any => {
  switch (type) {
    case 'text': return { content: 'Nouveau contenu texte...', alignment: 'left', fontSize: 'text-base', fontFamily: 'font-sans', textColor: 'text-foreground', backgroundColor: 'bg-transparent', padding: 'p-4', margin: 'my-4' };
    case 'image': return { src: '', alt: '', caption: '', alignment: 'center', size: 'md', borderRadius: 'rounded-lg', shadow: 'shadow-md', margin: 'my-4' };
    case 'hero': return { title: 'Titre principal', subtitle: 'Sous-titre descriptif', backgroundImage: '', backgroundColor: 'bg-primary', buttonText: 'Découvrir', buttonLink: '#', titleColor: 'text-white', subtitleColor: 'text-white/90', titleFont: 'font-bold', titleSize: 'text-4xl', overlayOpacity: 50, height: 'h-96', padding: 'p-8' };
    case 'artist-grid': return { title: 'Nos Artistes', subtitle: 'Découvrez notre sélection', showRating: false, showStats: true, columns: 3 };
    case 'background-image': return { backgroundImage: '', backgroundColor: '#000000', overlayOpacity: 50, overlayColor: 'black', content: 'Contenu avec image de fond', height: 'h-96', padding: 'p-8', textColor: 'text-white', textAlign: 'center' };
    default: return {};
  }
};

export const AdvancedBlockEditor: React.FC<AdvancedBlockEditorProps> = ({ initialBlocks, onSave, onCancel }) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || []);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('text');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const addBlock = (type: BlockType) => {
    const newBlock: Block = { id: `block-${Date.now()}`, type, content: getDefaultContent(type), order: blocks.length };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success('Bloc ajouté');
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Bloc supprimé');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      if (idx === -1) return prev;
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const arr = [...prev];
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr.map((b, i) => ({ ...b, order: i }));
    });
  };

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id;
    switch (block.type) {
      case 'text': return <AdvancedTextBlock content={block.content} onChange={(c) => updateBlock(block.id, c)} isSelected={isSelected} previewMode={previewMode} />;
      case 'image': return <AdvancedImageBlock content={block.content} onChange={(c) => updateBlock(block.id, c)} isSelected={isSelected} previewMode={previewMode} />;
      case 'hero': return <AdvancedHeroBlock content={block.content} onChange={(c) => updateBlock(block.id, c)} isSelected={isSelected} previewMode={previewMode} />;
      case 'artist-grid': return <ArtistGridBlock content={block.content} onChange={(c) => updateBlock(block.id, c)} isEditing={isSelected && !previewMode} />;
      case 'background-image': return <BackgroundImageBlock content={block.content} onChange={(c) => updateBlock(block.id, c)} isSelected={isSelected} previewMode={previewMode} />;
      default: return <div>Type de bloc non supporté: {block.type}</div>;
    }
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  return (
    <div className="flex h-screen">
      <AdvancedBlockEditorSidebar
        selectedBlockType={selectedBlockType}
        onSelectBlockType={setSelectedBlockType}
        onAddBlock={addBlock}
        selectedBlock={selectedBlock}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode(!previewMode)}
        onCancel={onCancel}
        onSave={() => onSave(blocks)}
        onUpdateBlock={updateBlock}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {blocks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layout className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">Aucun bloc ajouté pour le moment.<br />Commencez par ajouter votre premier bloc.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {blocks.map((block, index) => {
                const bt = blockTypeOptions.find(t => t.value === block.type);
                const Icon = bt?.icon || Layout;
                const isSelected = selectedBlockId === block.id;
                return (
                  <div key={block.id} className={`relative group ${isSelected ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedBlockId(block.id)}>
                    {!previewMode && (
                      <div className="absolute -top-3 left-0 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="flex items-center space-x-1"><Icon className="h-3 w-3" /><span className="text-xs">{bt?.label}</span></Badge>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up'); }} disabled={index === 0} className="h-6 w-6 p-0"><ArrowUp className="h-3 w-3" /></Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down'); }} disabled={index === blocks.length - 1} className="h-6 w-6 p-0"><ArrowDown className="h-3 w-3" /></Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }} className="h-6 w-6 p-0 text-red-600 hover:text-red-700"><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    )}
                    <div className="mt-2">{renderBlock(block)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
