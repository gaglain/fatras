
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, GripVertical } from 'lucide-react';

interface BlockToolbarProps {
  onDelete: () => void;
  dragHandleProps?: any;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ onDelete, dragHandleProps }) => {
  return (
    <div className="flex justify-between items-center mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <div 
        {...dragHandleProps}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0 hover:bg-red-50 hover:border-red-200"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </Button>
    </div>
  );
};
