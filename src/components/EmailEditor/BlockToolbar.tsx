
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface BlockToolbarProps {
  onDelete: () => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ onDelete }) => {
  return (
    <div className="flex justify-end mb-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onDelete}
        className="h-8 w-8 p-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};
