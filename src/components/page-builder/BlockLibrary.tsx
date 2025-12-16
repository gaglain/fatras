import React from 'react';
import { 
  Layout, Type, Image, Grid, Columns, Quote, HelpCircle, 
  CreditCard, Users, TrendingUp, MousePointer, Mail, Maximize2, Minus 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BLOCK_CONFIGS, BlockType } from './types';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Layout, Type, Image, Grid, Columns, Quote, HelpCircle,
  CreditCard, Users, TrendingUp, MousePointer, Mail, Maximize2, Minus
};

interface BlockLibraryProps {
  onAddBlock: (type: BlockType) => void;
}

export const BlockLibrary: React.FC<BlockLibraryProps> = ({ onAddBlock }) => {
  const categories = {
    layout: { label: 'Mise en page', blocks: BLOCK_CONFIGS.filter(b => b.category === 'layout') },
    content: { label: 'Contenu', blocks: BLOCK_CONFIGS.filter(b => b.category === 'content') },
    media: { label: 'Médias', blocks: BLOCK_CONFIGS.filter(b => b.category === 'media') },
    interactive: { label: 'Interactif', blocks: BLOCK_CONFIGS.filter(b => b.category === 'interactive') }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Bibliothèque de blocs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="p-4 space-y-4">
            {Object.entries(categories).map(([key, category]) => (
              <div key={key}>
                <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                  {category.label}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {category.blocks.map((block) => {
                    const Icon = iconMap[block.icon] || Layout;
                    return (
                      <Button
                        key={block.type}
                        variant="outline"
                        size="sm"
                        className="h-auto py-3 flex flex-col items-center gap-1.5 hover:bg-primary/5 hover:border-primary/20"
                        onClick={() => onAddBlock(block.type)}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('blockType', block.type);
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="text-xs">{block.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
