import React, { useState, useCallback } from 'react';
import { Block, BlockType, BLOCK_CONFIGS, ViewportMode, WebPage, BlockStyle } from './types';
import { BlockLibrary } from './BlockLibrary';
import { BlockCanvas } from './BlockCanvas';
import { BlockRenderer } from './BlockRenderer';
import { BlockEditorPanel } from './BlockEditorPanel';
import { ResponsivePreview, getViewportWidth } from './ResponsivePreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye, Settings2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

interface PageBuilderProps {
  page: WebPage;
  onSave: (page: WebPage) => void;
  onBack: () => void;
  onPreview: () => void;
}

export const PageBuilder: React.FC<PageBuilderProps> = ({
  page: initialPage,
  onSave,
  onBack,
  onPreview
}) => {
  const [page, setPage] = useState<WebPage>(initialPage);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [viewport, setViewport] = useState<ViewportMode>('desktop');
  const [showSettings, setShowSettings] = useState(false);

  const selectedBlock = page.blocks.find(b => b.id === selectedBlockId) || null;

  const addBlock = useCallback((type: BlockType, atIndex?: number) => {
    const config = BLOCK_CONFIGS.find(c => c.type === type);
    if (!config) return;

    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      order: atIndex ?? page.blocks.length,
      content: { ...config.defaultContent },
      style: { ...config.defaultStyle }
    };

    setPage(prev => {
      const newBlocks = [...prev.blocks];
      if (atIndex !== undefined) {
        newBlocks.splice(atIndex, 0, newBlock);
        // Update order
        newBlocks.forEach((b, i) => { b.order = i; });
      } else {
        newBlocks.push(newBlock);
      }
      return { ...prev, blocks: newBlocks };
    });

    setSelectedBlockId(newBlock.id);
    toast.success(`Bloc ${config.label} ajouté`);
  }, [page.blocks.length]);

  const updateBlockContent = useCallback((content: any) => {
    if (!selectedBlockId) return;
    setPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === selectedBlockId ? { ...b, content } : b
      )
    }));
  }, [selectedBlockId]);

  const updateBlockStyle = useCallback((style: BlockStyle) => {
    if (!selectedBlockId) return;
    setPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(b => 
        b.id === selectedBlockId ? { ...b, style } : b
      )
    }));
  }, [selectedBlockId]);

  const deleteBlock = useCallback((id: string) => {
    setPage(prev => ({
      ...prev,
      blocks: prev.blocks.filter(b => b.id !== id)
    }));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Bloc supprimé');
  }, [selectedBlockId]);

  const duplicateBlock = useCallback((id: string) => {
    const block = page.blocks.find(b => b.id === id);
    if (!block) return;

    const newBlock: Block = {
      ...block,
      id: `block-${Date.now()}`,
      order: block.order + 1,
      content: { ...block.content },
      style: { ...block.style }
    };

    setPage(prev => {
      const index = prev.blocks.findIndex(b => b.id === id);
      const newBlocks = [...prev.blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      newBlocks.forEach((b, i) => { b.order = i; });
      return { ...prev, blocks: newBlocks };
    });

    setSelectedBlockId(newBlock.id);
    toast.success('Bloc dupliqué');
  }, [page.blocks]);

  const reorderBlocks = useCallback((newBlocks: Block[]) => {
    setPage(prev => ({ ...prev, blocks: newBlocks }));
  }, []);

  const handleSave = () => {
    onSave(page);
    toast.success('Page sauvegardée');
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between bg-background z-20">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <div className="flex items-center gap-2">
            <Input
              value={page.title}
              onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
              className="h-8 w-48 font-medium"
            />
          </div>
        </div>

        <ResponsivePreview mode={viewport} onModeChange={setViewport} />

        <div className="flex items-center gap-2">
          <Sheet open={showSettings} onOpenChange={setShowSettings}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="h-4 w-4 mr-1" />
                Page
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Titre de la page</Label>
                  <Input
                    value={page.title}
                    onChange={(e) => setPage(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={page.slug}
                    onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Meta description</Label>
                  <textarea
                    value={page.metaDescription}
                    onChange={(e) => setPage(prev => ({ ...prev, metaDescription: e.target.value }))}
                    className="mt-1 w-full p-2 border rounded-md text-sm"
                    rows={3}
                  />
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-1" />
            Aperçu
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Sauvegarder
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Block library */}
        <div className="w-56 border-r bg-muted/30 hidden lg:block">
          <BlockLibrary onAddBlock={addBlock} />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden bg-muted/50">
          <div 
            className={cn(
              'flex-1 overflow-auto transition-all duration-300',
              viewport !== 'desktop' && 'flex justify-center py-4'
            )}
          >
            <div 
              className={cn(
                'bg-background min-h-full transition-all duration-300',
                viewport !== 'desktop' && 'shadow-xl rounded-lg overflow-hidden'
              )}
              style={{ 
                width: getViewportWidth(viewport),
                maxWidth: '100%'
              }}
            >
              <BlockCanvas
                blocks={page.blocks}
                selectedBlockId={selectedBlockId}
                onSelectBlock={setSelectedBlockId}
                onReorderBlocks={reorderBlocks}
                onDeleteBlock={deleteBlock}
                onDuplicateBlock={duplicateBlock}
                onAddBlock={addBlock}
                renderBlock={(block) => (
                  <BlockRenderer block={block} viewport={viewport} />
                )}
              />
            </div>
          </div>
        </div>

        {/* Right sidebar - Block editor */}
        <div className="w-72 border-l bg-muted/30 hidden md:block">
          <BlockEditorPanel
            block={selectedBlock}
            onUpdateContent={updateBlockContent}
            onUpdateStyle={updateBlockStyle}
          />
        </div>
      </div>

      {/* Mobile block library trigger */}
      <div className="lg:hidden fixed bottom-4 left-4 z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg">
              + Bloc
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <BlockLibrary onAddBlock={(type) => {
              addBlock(type);
            }} />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
