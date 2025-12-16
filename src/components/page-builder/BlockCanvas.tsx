import React from 'react';
import { Block, BlockType, BLOCK_CONFIGS, BlockStyle } from './types';
import { GripVertical, Settings, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DraggableBlockProps {
  block: Block;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  children: React.ReactNode;
}

export const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  index,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onDragStart,
  onDragOver,
  onDrop,
  children
}) => {
  const config = BLOCK_CONFIGS.find(c => c.type === block.type);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDrop={(e) => onDrop(e, index)}
      onClick={onSelect}
      className={cn(
        'relative group cursor-pointer transition-all',
        isSelected ? 'ring-2 ring-primary ring-offset-2' : 'hover:ring-1 hover:ring-muted-foreground/30'
      )}
    >
      {/* Toolbar overlay */}
      <div className={cn(
        'absolute -top-10 left-0 right-0 flex items-center justify-between px-2 py-1 bg-primary text-primary-foreground rounded-t-md z-10 transition-opacity',
        isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      )}>
        <div className="flex items-center gap-2">
          <GripVertical className="h-4 w-4 cursor-grab" />
          <span className="text-xs font-medium">{config?.label || block.type}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Block content */}
      <div className="pointer-events-none">
        {children}
      </div>
    </div>
  );
};

interface BlockCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onReorderBlocks: (blocks: Block[]) => void;
  onDeleteBlock: (id: string) => void;
  onDuplicateBlock: (id: string) => void;
  onAddBlock: (type: BlockType, index?: number) => void;
  renderBlock: (block: Block) => React.ReactNode;
}

export const BlockCanvas: React.FC<BlockCanvasProps> = ({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onReorderBlocks,
  onDeleteBlock,
  onDuplicateBlock,
  onAddBlock,
  renderBlock
}) => {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    // Check if dropping a new block from library
    const newBlockType = e.dataTransfer.getData('blockType') as BlockType;
    if (newBlockType) {
      onAddBlock(newBlockType, targetIndex);
      setDraggedIndex(null);
      return;
    }

    // Reorder existing blocks
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const newBlocks = [...blocks];
      const [removed] = newBlocks.splice(draggedIndex, 1);
      newBlocks.splice(targetIndex, 0, removed);
      
      // Update order values
      newBlocks.forEach((block, i) => {
        block.order = i;
      });
      
      onReorderBlocks(newBlocks);
    }
    setDraggedIndex(null);
  };

  const handleCanvasDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const newBlockType = e.dataTransfer.getData('blockType') as BlockType;
    if (newBlockType) {
      onAddBlock(newBlockType);
    }
  };

  if (blocks.length === 0) {
    return (
      <div 
        className="flex-1 flex items-center justify-center border-2 border-dashed rounded-lg m-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleCanvasDrop}
      >
        <div className="text-center p-8">
          <p className="text-muted-foreground mb-2">
            Glissez un bloc ici ou cliquez sur un bloc dans la bibliothèque
          </p>
          <p className="text-xs text-muted-foreground">
            Commencez par ajouter un bloc Hero ou Texte
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex-1 overflow-auto"
      onClick={() => onSelectBlock(null)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleCanvasDrop}
    >
      <div className="pt-12">
        {blocks.map((block, index) => (
          <DraggableBlock
            key={block.id}
            block={block}
            index={index}
            isSelected={selectedBlockId === block.id}
            onSelect={() => onSelectBlock(block.id)}
            onDelete={() => onDeleteBlock(block.id)}
            onDuplicate={() => onDuplicateBlock(block.id)}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {renderBlock(block)}
          </DraggableBlock>
        ))}
      </div>
    </div>
  );
};
