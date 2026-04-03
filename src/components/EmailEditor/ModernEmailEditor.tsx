import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Type, Heading1, Image as ImageIcon, Link2, Minus, Space, Share2, Layout, GripVertical, Trash2, Copy } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageSelector } from './ImageSelector';
import { toast } from 'sonner';
import { EmailBlock } from './emailBlockTypes';
import { EmailBlockPreview } from './EmailBlockPreview';

interface ModernEmailEditorProps {
  initialBlocks?: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export const ModernEmailEditor: React.FC<ModernEmailEditorProps> = ({ initialBlocks = [], onChange }) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  useEffect(() => {
    if (initialBlocks && initialBlocks.length > 0 && JSON.stringify(initialBlocks) !== JSON.stringify(blocks)) {
      setBlocks(initialBlocks);
    }
  }, [initialBlocks]);

  const blockTypes = [
    { type: 'text', icon: Type, label: 'Texte', description: 'Texte enrichi' },
    { type: 'heading', icon: Heading1, label: 'Titre', description: 'Grand titre' },
    { type: 'button', icon: Link2, label: 'Bouton', description: 'Bouton cliquable' },
    { type: 'image', icon: ImageIcon, label: 'Image', description: 'Image ou logo' },
    { type: 'video', icon: ImageIcon, label: 'Vidéo', description: 'YouTube' },
    { type: 'divider', icon: Minus, label: 'Séparateur', description: 'Ligne horizontale' },
    { type: 'spacer', icon: Space, label: 'Espacement', description: 'Espace vide' },
    { type: 'social', icon: Share2, label: 'Réseaux', description: 'Icônes sociales' },
    { type: 'columns', icon: Layout, label: 'Colonnes', description: '2 colonnes' },
  ];

  const addBlock = (type: string) => {
    const id = `block-${Date.now()}`;
    let content: any = {};
    switch (type) {
      case 'text': content = { html: '<p>Votre texte ici...</p>' }; break;
      case 'heading': content = { text: 'Votre titre ici', level: 'h1', color: '#000000', align: 'left' }; break;
      case 'button': content = { text: 'Cliquez ici', url: 'https://exemple.com', backgroundColor: '#2563EB', textColor: '#FFFFFF', align: 'center', borderRadius: 6 }; break;
      case 'image': content = { src: '', alt: '', width: '100%', align: 'center' }; break;
      case 'video': content = { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', width: '100%', align: 'center' }; break;
      case 'divider': content = { color: '#E5E7EB', height: 1 }; break;
      case 'spacer': content = { height: 40 }; break;
      case 'social': content = { platforms: [{ type: 'facebook', url: '', enabled: true, color: '#1877f2' }, { type: 'instagram', url: '', enabled: true, color: '#e4405f' }, { type: 'linkedin', url: '', enabled: true, color: '#0077b5' }, { type: 'youtube', url: '', enabled: true, color: '#ff0000' }], align: 'center' }; break;
      case 'columns': content = { columns: [{ html: '<p>Colonne 1</p>' }, { html: '<p>Colonne 2</p>' }] }; break;
    }
    const newBlocks = [...blocks, { id, type: type as any, content }];
    setBlocks(newBlocks);
    setSelectedBlockId(id);
    onChange(newBlocks);
    toast.success('Bloc ajouté');
  };

  const updateBlock = (id: string, content: any) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content } : b);
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(b => b.id !== id);
    setBlocks(newBlocks);
    onChange(newBlocks);
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Bloc supprimé');
  };

  const duplicateBlock = (block: EmailBlock) => {
    const newBlocks = [...blocks, { ...block, id: `block-${Date.now()}` }];
    setBlocks(newBlocks);
    onChange(newBlocks);
    toast.success('Bloc dupliqué');
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBlocks(items);
    onChange(items);
  };

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  const renderBlockSettings = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return <div className="space-y-4"><div><Label>Contenu</Label><RichTextEditor key={block.id} content={block.content.html || ''} onChange={(html) => updateBlock(block.id, { ...block.content, html })} /></div></div>;
      case 'heading':
        return (
          <div className="space-y-4">
            <div><Label>Texte</Label><Input value={block.content.text} onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Niveau</Label><Select value={block.content.level} onValueChange={(v) => updateBlock(block.id, { ...block.content, level: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="h1">Titre 1</SelectItem><SelectItem value="h2">Titre 2</SelectItem><SelectItem value="h3">Titre 3</SelectItem></SelectContent></Select></div>
              <div><Label>Couleur</Label><Input type="color" value={block.content.color} onChange={(e) => updateBlock(block.id, { ...block.content, color: e.target.value })} /></div>
            </div>
            <div><Label>Alignement</Label><Select value={block.content.align} onValueChange={(v) => updateBlock(block.id, { ...block.content, align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Gauche</SelectItem><SelectItem value="center">Centre</SelectItem><SelectItem value="right">Droite</SelectItem></SelectContent></Select></div>
          </div>
        );
      case 'button':
        return (
          <div className="space-y-4">
            <div><Label>Texte du bouton</Label><Input value={block.content.text} onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })} /></div>
            <div><Label>URL</Label><Input value={block.content.url} onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })} placeholder="https://exemple.com" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Couleur de fond</Label><div className="flex gap-2"><Input type="color" value={block.content.backgroundColor} onChange={(e) => updateBlock(block.id, { ...block.content, backgroundColor: e.target.value })} className="w-16 h-10" /><Input value={block.content.backgroundColor} onChange={(e) => updateBlock(block.id, { ...block.content, backgroundColor: e.target.value })} /></div></div>
              <div><Label>Couleur du texte</Label><div className="flex gap-2"><Input type="color" value={block.content.textColor} onChange={(e) => updateBlock(block.id, { ...block.content, textColor: e.target.value })} className="w-16 h-10" /><Input value={block.content.textColor} onChange={(e) => updateBlock(block.id, { ...block.content, textColor: e.target.value })} /></div></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Arrondi (px)</Label><Input type="number" value={block.content.borderRadius} onChange={(e) => updateBlock(block.id, { ...block.content, borderRadius: parseInt(e.target.value) || 0 })} min="0" max="50" /></div>
              <div><Label>Alignement</Label><Select value={block.content.align || 'center'} onValueChange={(v) => updateBlock(block.id, { ...block.content, align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Gauche</SelectItem><SelectItem value="center">Centre</SelectItem><SelectItem value="right">Droite</SelectItem></SelectContent></Select></div>
            </div>
          </div>
        );
      case 'image':
        return (
          <div className="space-y-4">
            <div><Label>Image</Label><ImageSelector value={block.content.src} onChange={(url) => updateBlock(block.id, { ...block.content, src: url })} />{block.content.src && <div className="mt-2 border rounded-lg p-2"><img src={block.content.src} alt="Aperçu" className="max-w-full max-h-32 mx-auto rounded" /></div>}</div>
            <div><Label>Texte alternatif</Label><Input value={block.content.alt} onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Largeur (%)</Label><Input type="number" value={block.content.width || 100} onChange={(e) => updateBlock(block.id, { ...block.content, width: parseInt(e.target.value) || 100 })} min="10" max="100" /></div>
              <div><Label>Alignement</Label><Select value={block.content.align || 'center'} onValueChange={(v) => updateBlock(block.id, { ...block.content, align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Gauche</SelectItem><SelectItem value="center">Centre</SelectItem><SelectItem value="right">Droite</SelectItem></SelectContent></Select></div>
            </div>
          </div>
        );
      case 'video':
        return (
          <div className="space-y-4">
            <div><Label>URL YouTube</Label><Input value={block.content.url} onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })} placeholder="https://www.youtube.com/watch?v=..." /><p className="text-xs text-muted-foreground mt-1">Collez l'URL complète d'une vidéo YouTube</p></div>
            <div><Label>Alignement</Label><Select value={block.content.align || 'center'} onValueChange={(v) => updateBlock(block.id, { ...block.content, align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Gauche</SelectItem><SelectItem value="center">Centre</SelectItem><SelectItem value="right">Droite</SelectItem></SelectContent></Select></div>
          </div>
        );
      case 'spacer':
        return <div><Label>Hauteur (px)</Label><Input type="number" value={block.content.height} onChange={(e) => updateBlock(block.id, { ...block.content, height: parseInt(e.target.value) || 40 })} min="10" max="200" /></div>;
      case 'social':
        return (
          <div className="space-y-4">
            <div><Label>Alignement</Label><Select value={block.content.align || 'center'} onValueChange={(v) => updateBlock(block.id, { ...block.content, align: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="left">Gauche</SelectItem><SelectItem value="center">Centre</SelectItem><SelectItem value="right">Droite</SelectItem></SelectContent></Select></div>
            <div className="space-y-3"><Label>Réseaux sociaux</Label>
              {block.content.platforms?.map((platform: any, index: number) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-2"><Checkbox checked={platform.enabled !== false} onCheckedChange={(checked) => { const p = [...block.content.platforms]; p[index] = { ...platform, enabled: !!checked }; updateBlock(block.id, { ...block.content, platforms: p }); }} /><Label className="text-sm capitalize flex-1">{platform.type}</Label></div>
                  <Input value={platform.url || ''} onChange={(e) => { const p = [...block.content.platforms]; p[index] = { ...platform, url: e.target.value }; updateBlock(block.id, { ...block.content, platforms: p }); }} placeholder={`URL ${platform.type}`} />
                  <div><Label className="text-xs text-muted-foreground">Couleur</Label><div className="flex gap-2 mt-1"><Input type="color" value={platform.color || '#000000'} onChange={(e) => { const p = [...block.content.platforms]; p[index] = { ...platform, color: e.target.value }; updateBlock(block.id, { ...block.content, platforms: p }); }} className="w-16 h-8" /><Input value={platform.color || '#000000'} onChange={(e) => { const p = [...block.content.platforms]; p[index] = { ...platform, color: e.target.value }; updateBlock(block.id, { ...block.content, platforms: p }); }} /></div></div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'columns':
        return (
          <div className="space-y-4">
            <div><Label>Colonne 1</Label><RichTextEditor content={block.content.columns?.[0]?.html || ''} onChange={(html) => { const c = [...(block.content.columns || [{ html: '' }, { html: '' }])]; c[0] = { html }; updateBlock(block.id, { ...block.content, columns: c }); }} /></div>
            <div><Label>Colonne 2</Label><RichTextEditor content={block.content.columns?.[1]?.html || ''} onChange={(html) => { const c = [...(block.content.columns || [{ html: '' }, { html: '' }])]; c[1] = { html }; updateBlock(block.id, { ...block.content, columns: c }); }} /></div>
          </div>
        );
      default:
        return <p className="text-muted-foreground text-sm">Paramètres non disponibles</p>;
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Left sidebar */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b"><h3 className="font-semibold">Ajouter un bloc</h3><p className="text-xs text-muted-foreground mt-1">Glissez ou cliquez</p></div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            {blockTypes.map((bt) => {
              const Icon = bt.icon;
              return (
                <Button key={bt.type} variant="outline" className="w-full justify-start h-auto p-3" onClick={() => addBlock(bt.type)}>
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <div className="text-left"><div className="font-medium text-sm">{bt.label}</div><div className="text-xs text-muted-foreground">{bt.description}</div></div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="email-blocks">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="max-w-2xl mx-auto p-6 space-y-2">
                {blocks.length === 0 ? (
                  <Card className="border-dashed"><CardContent className="py-12 text-center"><Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">Ajoutez des blocs pour commencer</p></CardContent></Card>
                ) : blocks.map((block, index) => (
                  <Draggable key={block.id} draggableId={block.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} className={`group relative border rounded-lg bg-background ${selectedBlockId === block.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedBlockId(block.id)}>
                        <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><div {...provided.dragHandleProps}><GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" /></div></div>
                        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <Button size="icon" variant="secondary" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); duplicateBlock(block); }}><Copy className="h-3 w-3" /></Button>
                          <Button size="icon" variant="destructive" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); deleteBlock(block.id); }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                        <div className="p-4"><EmailBlockPreview block={block} /></div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Right sidebar */}
      <div className="w-80 border-l bg-muted/30">
        <div className="p-4 border-b"><h3 className="font-semibold">{selectedBlock ? 'Paramètres du bloc' : 'Sélectionnez un bloc'}</h3></div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4">{selectedBlock ? renderBlockSettings(selectedBlock) : <p className="text-muted-foreground text-sm">Cliquez sur un bloc pour modifier ses paramètres</p>}</div>
        </ScrollArea>
      </div>
    </div>
  );
};
