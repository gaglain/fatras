import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  Save,
  ArrowLeft,
  Type,
  Image,
  Layout,
  Users,
  Settings,
  Palette,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import type { Block, BlockType } from './types';
import { AdvancedTextBlock } from './blocks/AdvancedTextBlock';
import { AdvancedImageBlock } from './blocks/AdvancedImageBlock';
import { AdvancedHeroBlock } from './blocks/AdvancedHeroBlock';
import { ArtistGridBlock } from './blocks/ArtistGridBlock';

interface AdvancedBlockEditorProps {
  initialBlocks: Block[];
  onSave: (blocks: Block[]) => void;
  onCancel?: () => void;
}

const fontFamilies = [
  { value: 'font-sans', label: 'Sans Serif (Inter)' },
  { value: 'font-serif', label: 'Serif (Times)' },
  { value: 'font-mono', label: 'Monospace' },
  { value: 'font-playfair', label: 'Playfair Display' },
  { value: 'font-roboto', label: 'Roboto' },
  { value: 'font-opensans', label: 'Open Sans' }
];

const colorPalette = [
  { value: 'text-primary', label: 'Primaire', color: 'hsl(var(--primary))' },
  { value: 'text-secondary', label: 'Secondaire', color: 'hsl(var(--secondary))' },
  { value: 'text-accent', label: 'Accent', color: 'hsl(var(--accent))' },
  { value: 'text-muted-foreground', label: 'Discret', color: 'hsl(var(--muted-foreground))' },
  { value: 'text-destructive', label: 'Destructeur', color: 'hsl(var(--destructive))' },
  { value: 'text-white', label: 'Blanc', color: '#ffffff' },
  { value: 'text-black', label: 'Noir', color: '#000000' }
];

const backgroundColors = [
  { value: 'bg-background', label: 'Arrière-plan', color: 'hsl(var(--background))' },
  { value: 'bg-card', label: 'Carte', color: 'hsl(var(--card))' },
  { value: 'bg-primary', label: 'Primaire', color: 'hsl(var(--primary))' },
  { value: 'bg-secondary', label: 'Secondaire', color: 'hsl(var(--secondary))' },
  { value: 'bg-accent', label: 'Accent', color: 'hsl(var(--accent))' },
  { value: 'bg-muted', label: 'Sourd', color: 'hsl(var(--muted))' },
  { value: 'bg-white', label: 'Blanc', color: '#ffffff' },
  { value: 'bg-black', label: 'Noir', color: '#000000' },
  { value: 'bg-transparent', label: 'Transparent', color: 'transparent' }
];

export const AdvancedBlockEditor: React.FC<AdvancedBlockEditorProps> = ({
  initialBlocks,
  onSave,
  onCancel
}) => {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks || []);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>('text');
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const blockTypes = [
    { value: 'text', label: 'Texte', icon: Type },
    { value: 'image', label: 'Image', icon: Image },
    { value: 'hero', label: 'Section Hero', icon: Layout },
    { value: 'artist-grid', label: 'Grille d\'artistes', icon: Users }
  ];

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      order: blocks.length
    };
    setBlocks(prev => [...prev, newBlock]);
    setSelectedBlockId(newBlock.id);
    toast.success('Bloc ajouté');
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(prev => prev.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(prev => prev.filter(block => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Bloc supprimé');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    setBlocks(prev => {
      const currentIndex = prev.findIndex(block => block.id === id);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newBlocks = [...prev];
      [newBlocks[currentIndex], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[currentIndex]];
      
      return newBlocks.map((block, index) => ({ ...block, order: index }));
    });
  };

  const renderBlock = (block: Block) => {
    const isSelected = selectedBlockId === block.id;
    
    switch (block.type) {
      case 'text':
        return (
          <AdvancedTextBlock
            content={block.content}
            onChange={(content) => updateBlock(block.id, content)}
            isSelected={isSelected}
            previewMode={previewMode}
          />
        );
      case 'image':
        return (
          <AdvancedImageBlock
            content={block.content}
            onChange={(content) => updateBlock(block.id, content)}
            isSelected={isSelected}
            previewMode={previewMode}
          />
        );
      case 'hero':
        return (
          <AdvancedHeroBlock
            content={block.content}
            onChange={(content) => updateBlock(block.id, content)}
            isSelected={isSelected}
            previewMode={previewMode}
          />
        );
      case 'artist-grid':
        return (
          <ArtistGridBlock
            content={block.content}
            onChange={(content) => updateBlock(block.id, content)}
            isEditing={isSelected && !previewMode}
          />
        );
      default:
        return <div>Type de bloc non supporté: {block.type}</div>;
    }
  };

  const handleSave = () => {
    onSave(blocks);
  };

  const getDefaultContent = (type: BlockType): any => {
    switch (type) {
      case 'text':
        return {
          content: 'Nouveau contenu texte...',
          alignment: 'left',
          fontSize: 'text-base',
          fontFamily: 'font-sans',
          textColor: 'text-foreground',
          backgroundColor: 'bg-transparent',
          padding: 'p-4',
          margin: 'my-4'
        };
      case 'image':
        return {
          src: '',
          alt: '',
          caption: '',
          alignment: 'center',
          size: 'md',
          borderRadius: 'rounded-lg',
          shadow: 'shadow-md',
          margin: 'my-4'
        };
      case 'hero':
        return {
          title: 'Titre principal',
          subtitle: 'Sous-titre descriptif',
          backgroundImage: '',
          backgroundColor: 'bg-primary',
          buttonText: 'Découvrir',
          buttonLink: '#',
          titleColor: 'text-white',
          subtitleColor: 'text-white/90',
          titleFont: 'font-bold',
          titleSize: 'text-4xl',
          overlayOpacity: 50,
          height: 'h-96',
          padding: 'p-8'
        };
      case 'artist-grid':
        return {
          title: 'Nos Artistes',
          subtitle: 'Découvrez notre sélection',
          showRating: false,
          showStats: true,
          columns: 3
        };
      default:
        return {};
    }
  };

  const selectedBlock = blocks.find(block => block.id === selectedBlockId);

  return (
    <div className="flex h-screen">
      {/* Sidebar de configuration */}
      <div className="w-80 border-r bg-card overflow-y-auto">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Éditeur de Blocs</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant={previewMode ? "default" : "outline"}
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Ajouter un bloc</Label>
              <Select value={selectedBlockType} onValueChange={(value: BlockType) => setSelectedBlockType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Type de bloc" />
                </SelectTrigger>
                <SelectContent>
                  {blockTypes.map(type => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => addBlock(selectedBlockType)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter le bloc
            </Button>
          </div>
        </div>

        {/* Configuration du bloc sélectionné */}
        {selectedBlock && !previewMode && (
          <div className="p-4">
            <h4 className="font-medium mb-4 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Configuration du bloc
            </h4>
            
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Contenu</TabsTrigger>
                <TabsTrigger value="style">Style</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4 mt-4">
                {selectedBlock.type === 'text' && (
                  <div className="space-y-3">
                    <div>
                      <Label>Contenu</Label>
                      <textarea
                        className="w-full p-2 border rounded resize-none h-20"
                        value={selectedBlock.content.content || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, {
                          ...selectedBlock.content,
                          content: e.target.value
                        })}
                      />
                    </div>
                  </div>
                )}
                
                {selectedBlock.type === 'image' && (
                  <div className="space-y-3">
                    <div>
                      <Label>URL de l'image</Label>
                      <Input
                        value={selectedBlock.content.src || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, {
                          ...selectedBlock.content,
                          src: e.target.value
                        })}
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <Label>Texte alternatif</Label>
                      <Input
                        value={selectedBlock.content.alt || ''}
                        onChange={(e) => updateBlock(selectedBlock.id, {
                          ...selectedBlock.content,
                          alt: e.target.value
                        })}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="style" className="space-y-4 mt-4">
                <div className="space-y-3">
                  <div>
                    <Label>Police</Label>
                    <Select
                      value={selectedBlock.content.fontFamily || 'font-sans'}
                      onValueChange={(value) => updateBlock(selectedBlock.id, {
                        ...selectedBlock.content,
                        fontFamily: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Couleur du texte</Label>
                    <Select
                      value={selectedBlock.content.textColor || 'text-foreground'}
                      onValueChange={(value) => updateBlock(selectedBlock.id, {
                        ...selectedBlock.content,
                        textColor: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {colorPalette.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: color.color }}
                              />
                              <span>{color.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Couleur de fond</Label>
                    <Select
                      value={selectedBlock.content.backgroundColor || 'bg-transparent'}
                      onValueChange={(value) => updateBlock(selectedBlock.id, {
                        ...selectedBlock.content,
                        backgroundColor: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {backgroundColors.map(bg => (
                          <SelectItem key={bg.value} value={bg.value}>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: bg.color }}
                              />
                              <span>{bg.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}

        <div className="p-4 border-t mt-auto">
          <Button onClick={handleSave} className="w-full">
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Zone d'édition principale */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {blocks.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-200">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layout className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 text-center">
                  Aucun bloc ajouté pour le moment.<br />
                  Commencez par ajouter votre premier bloc.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {blocks.map((block, index) => {
                const blockType = blockTypes.find(type => type.value === block.type);
                const Icon = blockType?.icon || Layout;
                const isSelected = selectedBlockId === block.id;
                
                return (
                  <div
                    key={block.id}
                    className={`relative group ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedBlockId(block.id)}
                  >
                    {!previewMode && (
                      <div className="absolute -top-3 left-0 z-10 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Icon className="h-3 w-3" />
                          <span className="text-xs">{blockType?.label}</span>
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'up');
                          }}
                          disabled={index === 0}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(block.id, 'down');
                          }}
                          disabled={index === blocks.length - 1}
                          className="h-6 w-6 p-0"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBlock(block.id);
                          }}
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-2">
                      {renderBlock(block)}
                    </div>
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