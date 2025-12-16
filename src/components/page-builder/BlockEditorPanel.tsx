import React from 'react';
import { Block, BlockType, BLOCK_CONFIGS, BlockStyle } from './types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BlockStyleEditor } from './BlockStyleEditor';
import {
  HeroEditor,
  TextEditor,
  ImageEditor,
  ColumnsEditor,
  TestimonialsEditor,
  FaqEditor,
  PricingEditor,
  TeamEditor,
  CounterEditor,
  CtaEditor,
  GalleryEditor,
  SpacerEditor
} from './block-editors';

interface BlockEditorPanelProps {
  block: Block | null;
  onUpdateContent: (content: any) => void;
  onUpdateStyle: (style: BlockStyle) => void;
}

export const BlockEditorPanel: React.FC<BlockEditorPanelProps> = ({
  block,
  onUpdateContent,
  onUpdateStyle
}) => {
  if (!block) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground text-sm text-center">
            Sélectionnez un bloc pour modifier ses propriétés
          </p>
        </CardContent>
      </Card>
    );
  }

  const config = BLOCK_CONFIGS.find(c => c.type === block.type);

  const renderContentEditor = () => {
    switch (block.type) {
      case 'hero':
        return <HeroEditor content={block.content} onChange={onUpdateContent} />;
      case 'text':
        return <TextEditor content={block.content} onChange={onUpdateContent} />;
      case 'image':
        return <ImageEditor content={block.content} onChange={onUpdateContent} />;
      case 'columns':
        return <ColumnsEditor content={block.content} onChange={onUpdateContent} />;
      case 'gallery':
        return <GalleryEditor content={block.content} onChange={onUpdateContent} />;
      case 'testimonials':
        return <TestimonialsEditor content={block.content} onChange={onUpdateContent} />;
      case 'faq':
        return <FaqEditor content={block.content} onChange={onUpdateContent} />;
      case 'pricing':
        return <PricingEditor content={block.content} onChange={onUpdateContent} />;
      case 'team':
        return <TeamEditor content={block.content} onChange={onUpdateContent} />;
      case 'counter':
        return <CounterEditor content={block.content} onChange={onUpdateContent} />;
      case 'cta':
        return <CtaEditor content={block.content} onChange={onUpdateContent} />;
      case 'spacer':
      case 'divider':
        return <SpacerEditor content={block.content} onChange={onUpdateContent} />;
      default:
        return (
          <p className="text-muted-foreground text-sm">
            Éditeur non disponible pour ce type de bloc
          </p>
        );
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {config?.label || block.type}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden">
        <Tabs defaultValue="content" className="h-full flex flex-col">
          <TabsList className="mx-4 grid w-auto grid-cols-2">
            <TabsTrigger value="content" className="text-xs">Contenu</TabsTrigger>
            <TabsTrigger value="style" className="text-xs">Style</TabsTrigger>
          </TabsList>
          <ScrollArea className="flex-1">
            <TabsContent value="content" className="p-4 m-0">
              {renderContentEditor()}
            </TabsContent>
            <TabsContent value="style" className="p-0 m-0">
              <BlockStyleEditor
                style={block.style || {}}
                onChange={onUpdateStyle}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </CardContent>
    </Card>
  );
};
