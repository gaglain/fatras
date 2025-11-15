import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { 
  Type, 
  Heading1, 
  Image as ImageIcon, 
  Link2, 
  Minus, 
  Space,
  Share2,
  Layout,
  GripVertical,
  Trash2,
  Copy,
  Eye,
  Palette,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { ImageSelector } from './ImageSelector';
import { toast } from 'sonner';

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

interface EmailBlock {
  id: string;
  type: 'text' | 'heading' | 'button' | 'image' | 'video' | 'divider' | 'spacer' | 'social' | 'columns';
  content: any;
}

interface ModernEmailEditorProps {
  initialBlocks?: EmailBlock[];
  onChange: (blocks: EmailBlock[]) => void;
}

export const ModernEmailEditor: React.FC<ModernEmailEditorProps> = ({ 
  initialBlocks = [],
  onChange 
}) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Update blocks when initialBlocks changes (fixes empty content on edit)
  React.useEffect(() => {
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
      case 'text':
        content = { html: '<p>Votre texte ici...</p>' };
        break;
      case 'heading':
        content = { text: 'Votre titre ici', level: 'h1', color: '#000000', align: 'left' };
        break;
      case 'button':
        content = { 
          text: 'Cliquez ici', 
          url: 'https://exemple.com',
          backgroundColor: '#2563EB',
          textColor: '#FFFFFF',
          align: 'center',
          borderRadius: 6
        };
        break;
      case 'image':
        content = { src: '', alt: '', width: '100%', align: 'center' };
        break;
      case 'video':
        content = { url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', width: '100%', align: 'center' };
        break;
      case 'divider':
        content = { color: '#E5E7EB', height: 1 };
        break;
      case 'spacer':
        content = { height: 40 };
        break;
      case 'social':
        content = { 
          platforms: [
            { type: 'facebook', url: '', enabled: true, color: '#1877f2' },
            { type: 'instagram', url: '', enabled: true, color: '#e4405f' },
            { type: 'linkedin', url: '', enabled: true, color: '#0077b5' },
            { type: 'youtube', url: '', enabled: true, color: '#ff0000' }
          ],
          align: 'center'
        };
        break;
      case 'columns':
        content = { 
          columns: [
            { html: '<p>Colonne 1</p>' },
            { html: '<p>Colonne 2</p>' }
          ]
        };
        break;
    }

    const newBlock: EmailBlock = { id, type: type as any, content };
    const newBlocks = [...blocks, newBlock];
    setBlocks(newBlocks);
    setSelectedBlockId(id);
    onChange(newBlocks);
    toast.success('Bloc ajouté');
  };

  const updateBlock = (id: string, content: any) => {
    const newBlocks = blocks.map(block => 
      block.id === id ? { ...block, content } : block
    );
    setBlocks(newBlocks);
    onChange(newBlocks);
  };

  const deleteBlock = (id: string) => {
    const newBlocks = blocks.filter(block => block.id !== id);
    setBlocks(newBlocks);
    onChange(newBlocks);
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Bloc supprimé');
  };

  const duplicateBlock = (block: EmailBlock) => {
    const newBlock = {
      ...block,
      id: `block-${Date.now()}`
    };
    const newBlocks = [...blocks, newBlock];
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
        return (
          <div className="space-y-4">
            <div>
              <Label>Contenu</Label>
              <RichTextEditor
                content={block.content.html || ''}
                onChange={(html) => updateBlock(block.id, { ...block.content, html })}
              />
            </div>
          </div>
        );

      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texte</Label>
              <Input
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Niveau</Label>
                <Select
                  value={block.content.level}
                  onValueChange={(value) => updateBlock(block.id, { ...block.content, level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="h1">Titre 1</SelectItem>
                    <SelectItem value="h2">Titre 2</SelectItem>
                    <SelectItem value="h3">Titre 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Couleur</Label>
                <Input
                  type="color"
                  value={block.content.color}
                  onChange={(e) => updateBlock(block.id, { ...block.content, color: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.content.align}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, align: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'button':
        return (
          <div className="space-y-4">
            <div>
              <Label>Texte du bouton</Label>
              <Input
                value={block.content.text}
                onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              />
            </div>
            <div>
              <Label>URL</Label>
              <Input
                value={block.content.url}
                onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                placeholder="https://exemple.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Couleur de fond</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={block.content.backgroundColor}
                    onChange={(e) => updateBlock(block.id, { ...block.content, backgroundColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={block.content.backgroundColor}
                    onChange={(e) => updateBlock(block.id, { ...block.content, backgroundColor: e.target.value })}
                    placeholder="#2563EB"
                  />
                </div>
              </div>
              <div>
                <Label>Couleur du texte</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={block.content.textColor}
                    onChange={(e) => updateBlock(block.id, { ...block.content, textColor: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={block.content.textColor}
                    onChange={(e) => updateBlock(block.id, { ...block.content, textColor: e.target.value })}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Arrondi (px)</Label>
                <Input
                  type="number"
                  value={block.content.borderRadius}
                  onChange={(e) => updateBlock(block.id, { ...block.content, borderRadius: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="50"
                />
              </div>
              <div>
                <Label>Alignement</Label>
                <Select
                  value={block.content.align || 'center'}
                  onValueChange={(value) => updateBlock(block.id, { ...block.content, align: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-4">
            <div>
              <Label>Image</Label>
              <ImageSelector
                value={block.content.src}
                onChange={(url) => updateBlock(block.id, { ...block.content, src: url })}
              />
              {block.content.src && (
                <div className="mt-2 border rounded-lg p-2">
                  <img src={block.content.src} alt="Aperçu" className="max-w-full max-h-32 mx-auto rounded" />
                </div>
              )}
            </div>
            <div>
              <Label>Texte alternatif</Label>
              <Input
                value={block.content.alt}
                onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                placeholder="Description de l'image"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Largeur (%)</Label>
                <Input
                  type="number"
                  value={block.content.width || 100}
                  onChange={(e) => updateBlock(block.id, { ...block.content, width: parseInt(e.target.value) || 100 })}
                  min="10"
                  max="100"
                  placeholder="100"
                />
              </div>
              <div>
                <Label>Alignement</Label>
                <Select
                  value={block.content.align || 'center'}
                  onValueChange={(value) => updateBlock(block.id, { ...block.content, align: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="center">Centre</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-4">
            <div>
              <Label>URL YouTube</Label>
              <Input
                value={block.content.url}
                onChange={(e) => updateBlock(block.id, { ...block.content, url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Collez l'URL complète d'une vidéo YouTube
              </p>
            </div>
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.content.align || 'center'}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, align: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'spacer':
        return (
          <div>
            <Label>Hauteur (px)</Label>
            <Input
              type="number"
              value={block.content.height}
              onChange={(e) => updateBlock(block.id, { ...block.content, height: parseInt(e.target.value) || 40 })}
              min="10"
              max="200"
            />
          </div>
        );

      case 'social':
        return (
          <div className="space-y-4">
            <div>
              <Label>Alignement</Label>
              <Select
                value={block.content.align || 'center'}
                onValueChange={(value) => updateBlock(block.id, { ...block.content, align: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Réseaux sociaux</Label>
              {block.content.platforms?.map((platform: any, index: number) => (
                <div key={index} className="space-y-2 p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={platform.enabled !== false}
                      onCheckedChange={(checked) => {
                        const newPlatforms = [...block.content.platforms];
                        newPlatforms[index] = { ...platform, enabled: !!checked };
                        updateBlock(block.id, { ...block.content, platforms: newPlatforms });
                      }}
                    />
                    <Label className="text-sm capitalize flex-1">{platform.type}</Label>
                  </div>
                  <Input
                    value={platform.url || ''}
                    onChange={(e) => {
                      const newPlatforms = [...block.content.platforms];
                      newPlatforms[index] = { ...platform, url: e.target.value };
                      updateBlock(block.id, { ...block.content, platforms: newPlatforms });
                    }}
                    placeholder={`URL ${platform.type}`}
                  />
                  <div>
                    <Label className="text-xs text-muted-foreground">Couleur de l'icône</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={platform.color || '#000000'}
                        onChange={(e) => {
                          const newPlatforms = [...block.content.platforms];
                          newPlatforms[index] = { ...platform, color: e.target.value };
                          updateBlock(block.id, { ...block.content, platforms: newPlatforms });
                        }}
                        className="w-16 h-8"
                      />
                      <Input
                        value={platform.color || '#000000'}
                        onChange={(e) => {
                          const newPlatforms = [...block.content.platforms];
                          newPlatforms[index] = { ...platform, color: e.target.value };
                          updateBlock(block.id, { ...block.content, platforms: newPlatforms });
                        }}
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'columns':
        return (
          <div className="space-y-4">
            <div>
              <Label>Colonne 1</Label>
              <RichTextEditor
                content={block.content.columns?.[0]?.html || ''}
                onChange={(html) => {
                  const newColumns = [...(block.content.columns || [{ html: '' }, { html: '' }])];
                  newColumns[0] = { html };
                  updateBlock(block.id, { ...block.content, columns: newColumns });
                }}
              />
            </div>
            <div>
              <Label>Colonne 2</Label>
              <RichTextEditor
                content={block.content.columns?.[1]?.html || ''}
                onChange={(html) => {
                  const newColumns = [...(block.content.columns || [{ html: '' }, { html: '' }])];
                  newColumns[1] = { html };
                  updateBlock(block.id, { ...block.content, columns: newColumns });
                }}
              />
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground text-sm">Paramètres non disponibles</p>;
    }
  };

  return (
    <div className="flex h-full gap-4">
      {/* Sidebar gauche - Blocs disponibles */}
      <div className="w-64 border-r bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Ajouter un bloc</h3>
          <p className="text-xs text-muted-foreground mt-1">Glissez ou cliquez</p>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-2">
            {blockTypes.map((blockType) => {
              const Icon = blockType.icon;
              return (
                <Button
                  key={blockType.type}
                  variant="outline"
                  className="w-full justify-start h-auto p-3"
                  onClick={() => addBlock(blockType.type)}
                >
                  <Icon className="h-4 w-4 mr-2 shrink-0" />
                  <div className="text-left">
                    <div className="font-medium text-sm">{blockType.label}</div>
                    <div className="text-xs text-muted-foreground">{blockType.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Zone centrale - Canvas */}
      <div className="flex-1 overflow-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="email-blocks">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="max-w-2xl mx-auto p-6 space-y-2"
              >
                {blocks.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                      <Type className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        Ajoutez des blocs pour commencer à créer votre email
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group relative border rounded-lg bg-background ${
                            selectedBlockId === block.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedBlockId(block.id)}
                        >
                          <div className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                            </div>
                          </div>
                          
                          <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <Button
                              size="icon"
                              variant="secondary"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateBlock(block);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-7 w-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteBlock(block.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="p-4">
                            {block.type === 'text' && (
                              <div dangerouslySetInnerHTML={{ __html: block.content.html || '<p>Texte vide</p>' }} />
                            )}
                            {block.type === 'heading' && (
                              <div style={{ color: block.content.color, textAlign: block.content.align }}>
                                {block.content.level === 'h1' && <h1 className="text-3xl font-bold">{block.content.text}</h1>}
                                {block.content.level === 'h2' && <h2 className="text-2xl font-bold">{block.content.text}</h2>}
                                {block.content.level === 'h3' && <h3 className="text-xl font-bold">{block.content.text}</h3>}
                              </div>
                            )}
                            {block.type === 'button' && (
                              <div style={{ textAlign: block.content.align }}>
                                <button
                                  style={{
                                    backgroundColor: block.content.backgroundColor,
                                    color: block.content.textColor,
                                    borderRadius: `${block.content.borderRadius}px`,
                                    padding: '12px 24px',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  {block.content.text}
                                </button>
                              </div>
                            )}
                            {block.type === 'image' && (
                              block.content.src ? (
                                <div style={{ textAlign: block.content.align || 'center' }}>
                                  <img 
                                    src={block.content.src} 
                                    alt={block.content.alt} 
                                    style={{
                                      maxWidth: `${block.content.width || 100}%`,
                                      width: `${block.content.width || 100}%`,
                                      height: 'auto',
                                      display: 'inline-block'
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="border-2 border-dashed rounded p-8 text-center text-muted-foreground">
                                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                  <p className="text-sm">Ajoutez une URL d'image</p>
                                </div>
                              )
                            )}
                            {block.type === 'video' && (
                              block.content.url ? (
                                <div style={{ textAlign: block.content.align || 'center' }}>
                                  <div className="relative inline-block max-w-full">
                                    <img 
                                      src={`https://img.youtube.com/vi/${extractYouTubeId(block.content.url)}/maxresdefault.jpg`}
                                      alt="Aperçu vidéo YouTube" 
                                      className="max-w-full rounded"
                                      onError={(e) => {
                                        // Fallback to standard quality if maxresdefault doesn't exist
                                        e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(block.content.url)}/0.jpg`;
                                      }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <div className="bg-red-600 rounded-full p-4 shadow-lg">
                                        <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M8 5v14l11-7z"/>
                                        </svg>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="border-2 border-dashed rounded p-8 text-center text-muted-foreground">
                                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                                  <p className="text-sm">Ajoutez une URL YouTube</p>
                                </div>
                              )
                            )}
                            {block.type === 'divider' && (
                              <hr style={{ borderColor: block.content.color, borderWidth: `${block.content.height}px` }} />
                            )}
                            {block.type === 'spacer' && (
                              <div style={{ height: `${block.content.height}px` }} className="bg-muted/20" />
                            )}
                            {block.type === 'social' && (
                              <div style={{ textAlign: block.content.align || 'center' }}>
                                <div className="inline-flex gap-3">
                                  {block.content.platforms?.filter((p: any) => p.enabled && p.url).map((platform: any, idx: number) => {
                                    const Icon = platform.type === 'facebook' ? Facebook :
                                                 platform.type === 'instagram' ? Instagram :
                                                 platform.type === 'linkedin' ? Linkedin :
                                                 platform.type === 'youtube' ? Youtube : Share2;
                                    return (
                                      <a
                                        key={idx}
                                        href={platform.url || '#'}
                                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-80 transition-opacity"
                                        style={{ backgroundColor: platform.color || '#3498db' }}
                                        title={platform.type}
                                      >
                                        <Icon className="h-5 w-5" />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            {block.type === 'columns' && (
                              <div className="grid grid-cols-2 gap-4">
                                {block.content.columns?.map((col: any, idx: number) => (
                                  <div key={idx} className="border-l-2 border-muted pl-4">
                                    <div dangerouslySetInnerHTML={{ __html: col.html || '<p>Colonne vide</p>' }} />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Sidebar droite - Paramètres du bloc sélectionné */}
      <div className="w-80 border-l bg-muted/30">
        <div className="p-4 border-b">
          <h3 className="font-semibold">
            {selectedBlock ? 'Paramètres du bloc' : 'Sélectionnez un bloc'}
          </h3>
        </div>
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4">
            {selectedBlock ? (
              renderBlockSettings(selectedBlock)
            ) : (
              <p className="text-muted-foreground text-sm">
                Cliquez sur un bloc pour modifier ses paramètres
              </p>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
