import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, ArrowLeft, Save, Eye, Settings, Type, Image, Layout, Users, Palette } from 'lucide-react';
import type { Block, BlockType } from './types';

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

export const blockTypeOptions = [
  { value: 'text', label: 'Texte', icon: Type },
  { value: 'image', label: 'Image', icon: Image },
  { value: 'hero', label: 'Section Hero', icon: Layout },
  { value: 'artist-grid', label: 'Grille d\'artistes', icon: Users },
  { value: 'background-image', label: 'Image de fond', icon: Palette }
];

interface SidebarProps {
  selectedBlockType: BlockType;
  onSelectBlockType: (type: BlockType) => void;
  onAddBlock: (type: BlockType) => void;
  selectedBlock: Block | undefined;
  previewMode: boolean;
  onTogglePreview: () => void;
  onCancel?: () => void;
  onSave: () => void;
  onUpdateBlock: (id: string, content: any) => void;
}

export const AdvancedBlockEditorSidebar: React.FC<SidebarProps> = ({
  selectedBlockType, onSelectBlockType, onAddBlock,
  selectedBlock, previewMode, onTogglePreview, onCancel, onSave, onUpdateBlock
}) => {
  return (
    <div className="w-80 border-r bg-card overflow-y-auto">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Éditeur de Blocs</h3>
          <div className="flex items-center space-x-2">
            <Button variant={previewMode ? "default" : "outline"} size="sm" onClick={onTogglePreview}>
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
            <Select value={selectedBlockType} onValueChange={(value: BlockType) => onSelectBlockType(value)}>
              <SelectTrigger><SelectValue placeholder="Type de bloc" /></SelectTrigger>
              <SelectContent>
                {blockTypeOptions.map(type => {
                  const Icon = type.icon;
                  return (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4" /><span>{type.label}</span>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => onAddBlock(selectedBlockType)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />Ajouter le bloc
          </Button>
        </div>
      </div>

      {selectedBlock && !previewMode && (
        <div className="p-4">
          <h4 className="font-medium mb-4 flex items-center">
            <Settings className="h-4 w-4 mr-2" />Configuration du bloc
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
                    <textarea className="w-full p-2 border rounded resize-none h-20"
                      value={selectedBlock.content.content || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, content: e.target.value })} />
                  </div>
                </div>
              )}
              {selectedBlock.type === 'image' && (
                <div className="space-y-3">
                  <div><Label>URL de l'image</Label>
                    <Input value={selectedBlock.content.src || ''} placeholder="https://..."
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, src: e.target.value })} />
                  </div>
                  <div><Label>Texte alternatif</Label>
                    <Input value={selectedBlock.content.alt || ''}
                      onChange={(e) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, alt: e.target.value })} />
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="style" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div>
                  <Label>Police</Label>
                  <Select value={selectedBlock.content.fontFamily || 'font-sans'}
                    onValueChange={(v) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, fontFamily: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {fontFamilies.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Couleur du texte</Label>
                  <Select value={selectedBlock.content.textColor || 'text-foreground'}
                    onValueChange={(v) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, textColor: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {colorPalette.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: c.color }} />
                            <span>{c.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Couleur de fond</Label>
                  <Select value={selectedBlock.content.backgroundColor || 'bg-transparent'}
                    onValueChange={(v) => onUpdateBlock(selectedBlock.id, { ...selectedBlock.content, backgroundColor: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {backgroundColors.map(bg => (
                        <SelectItem key={bg.value} value={bg.value}>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 rounded border" style={{ backgroundColor: bg.color }} />
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
        <Button onClick={onSave} className="w-full">
          <Save className="h-4 w-4 mr-2" />Sauvegarder
        </Button>
      </div>
    </div>
  );
};
