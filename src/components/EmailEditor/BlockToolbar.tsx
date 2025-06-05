
import React from 'react';
import { Button } from '@/components/ui/button';
import { Type, Image, MousePointer, Minus, Space, Heading } from 'lucide-react';
import { EmailBlock } from './types';

interface BlockToolbarProps {
  onAddBlock: (type: EmailBlock['type']) => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({ onAddBlock }) => {
  const blockTypes = [
    { type: 'heading' as const, icon: Heading, label: 'Titre' },
    { type: 'text' as const, icon: Type, label: 'Texte' },
    { type: 'image' as const, icon: Image, label: 'Image' },
    { type: 'button' as const, icon: MousePointer, label: 'Bouton' },
    { type: 'spacer' as const, icon: Space, label: 'Espacement' },
    { type: 'divider' as const, icon: Minus, label: 'Séparateur' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {blockTypes.map(({ type, icon: Icon, label }) => (
        <Button
          key={type}
          variant="outline"
          size="sm"
          onClick={() => onAddBlock(type)}
          className="flex items-center space-x-1"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};
