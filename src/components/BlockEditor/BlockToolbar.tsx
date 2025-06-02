
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, Trash2, Settings } from 'lucide-react';
import { Block } from './types';

interface BlockToolbarProps {
  block: Block;
  isSelected: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  block,
  isSelected,
  onMoveUp,
  onMoveDown,
  onDelete
}) => {
  if (!isSelected) return null;

  return (
    <div className="absolute top-2 right-2 z-10 flex items-center space-x-1 bg-white border rounded-lg shadow-lg p-1">
      <Button
        onClick={onMoveUp}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <ChevronUp className="h-4 w-4" />
      </Button>
      <Button
        onClick={onMoveDown}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
      >
        <ChevronDown className="h-4 w-4" />
      </Button>
      <Button
        onClick={onDelete}
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
