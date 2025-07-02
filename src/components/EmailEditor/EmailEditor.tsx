
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Eye, Save, Type, Heading1, Link, Minus, Space, Image as ImageIcon, BarChart3 } from 'lucide-react';
import { EmailBlock, TextBlockContent, HeadingBlockContent, ButtonBlockContent, DividerBlockContent, SpacerBlockContent, ImageBlockContent } from './types';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { BlockToolbar } from './BlockToolbar';
import { EmailPreview } from './EmailPreview';
import { toast } from 'sonner';

interface EmailEditorProps {
  initialBlocks?: EmailBlock[];
  onSave: (blocks: EmailBlock[]) => void;
  onPreview: (blocks: EmailBlock[]) => void;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({ 
  initialBlocks = [], 
  onSave, 
  onPreview 
}) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const addBlock = (type: EmailBlock['type']) => {
    const id = Date.now().toString();
    let content: any;

    switch (type) {
      case 'text':
        content = {
          text: 'Votre texte ici...',
          fontSize: 14,
          color: '#000000',
          alignment: 'left' as const,
          bold: false,
          italic: false
        } as TextBlockContent;
        break;
      case 'heading':
        content = {
          text: 'Votre titre ici',
          level: 1 as const,
          color: '#000000',
          alignment: 'left' as const
        } as HeadingBlockContent;
        break;
      case 'button':
        content = {
          text: 'Cliquez ici',
          url: 'https://example.com',
          backgroundColor: '#007bff',
          textColor: '#ffffff',
          alignment: 'center' as const,
          borderRadius: 4,
          padding: { top: 12, bottom: 12, left: 24, right: 24 }
        } as ButtonBlockContent;
        break;
      case 'divider':
        content = {
          color: '#cccccc',
          thickness: 1,
          style: 'solid' as const
        } as DividerBlockContent;
        break;
      case 'spacer':
        content = {
          height: 20
        } as SpacerBlockContent;
        break;
      case 'image':
        content = {
          src: '',
          alt: '',
          width: 100,
          alignment: 'center' as const
        } as ImageBlockContent;
        break;
    }

    const newBlock: EmailBlock = { id, type, content };
    setBlocks([...blocks, newBlock]);
    setSelectedBlockId(id);
    toast.success(`Bloc ${type} ajouté`);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlockId === id) {
      setSelectedBlockId(null);
    }
    toast.success('Bloc supprimé');
  };

  const reorderBlocks = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setBlocks(items);
  };

  const renderBlock = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <TextBlock
            content={block.content as TextBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'heading':
        return (
          <HeadingBlock
            content={block.content as HeadingBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'button':
        return (
          <ButtonBlock
            content={block.content as ButtonBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'divider':
        return (
          <DividerBlock
            content={block.content as DividerBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'spacer':
        return (
          <SpacerBlock
            content={block.content as SpacerBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      case 'image':
        return (
          <ImageBlock
            content={block.content as ImageBlockContent}
            onChange={(content) => updateBlock(block.id, content)}
          />
        );
      default:
        return null;
    }
  };

  const handleSave = () => {
    onSave(blocks);
    toast.success('Email sauvegardé');
  };

  const handlePreview = () => {
    onPreview(blocks);
    setShowPreview(true);
  };

  const mockStats = {
    sent: 1250,
    delivered: 1205,
    opened: 542,
    clicked: 89,
    bounced: 15,
    unsubscribed: 3,
    openRate: 45,
    clickRate: 16
  };

  if (showPreview) {
    return (
      <EmailPreview 
        blocks={blocks} 
        onClose={() => setShowPreview(false)}
        onSave={handleSave}
      />
    );
  }

  if (showStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Statistiques de l'email</h2>
          <Button onClick={() => setShowStats(false)}>
            Retour à l'éditeur
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-blue-600">{mockStats.sent}</div>
              <p className="text-sm text-gray-600">Emails envoyés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-green-600">{mockStats.delivered}</div>
              <p className="text-sm text-gray-600">Délivrés</p>
              <p className="text-xs text-gray-500">{((mockStats.delivered / mockStats.sent) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-purple-600">{mockStats.opened}</div>
              <p className="text-sm text-gray-600">Ouvertures</p>
              <p className="text-xs text-gray-500">{mockStats.openRate}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-orange-600">{mockStats.clicked}</div>
              <p className="text-sm text-gray-600">Clics</p>
              <p className="text-xs text-gray-500">{mockStats.clickRate}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-red-600">{mockStats.bounced}</div>
              <p className="text-sm text-gray-600">Bounces</p>
              <p className="text-xs text-gray-500">{((mockStats.bounced / mockStats.sent) * 100).toFixed(1)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-gray-600">{mockStats.unsubscribed}</div>
              <p className="text-sm text-gray-600">Désabonnements</p>
              <p className="text-xs text-gray-500">{((mockStats.unsubscribed / mockStats.sent) * 100).toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-indigo-600">
                {((mockStats.clicked / mockStats.opened) * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Taux clic/ouverture</p>
              <p className="text-xs text-gray-500">CTR</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Toolbar */}
      <div className="w-64 border-r bg-muted/30 p-4">
        <h3 className="font-semibold mb-4">Blocs disponibles</h3>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('text')}
          >
            <Type className="h-4 w-4 mr-2" />
            Texte
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('heading')}
          >
            <Heading1 className="h-4 w-4 mr-2" />
            Titre
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('image')}
          >
            <ImageIcon className="h-4 w-4 mr-2" />
            Image
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('button')}
          >
            <Link className="h-4 w-4 mr-2" />
            Bouton
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('divider')}
          >
            <Minus className="h-4 w-4 mr-2" />
            Séparateur
          </Button>
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => addBlock('spacer')}
          >
            <Space className="h-4 w-4 mr-2" />
            Espacement
          </Button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Éditeur d'email</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowStats(true)}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Statistiques
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <DragDropContext onDragEnd={reorderBlocks}>
            <Droppable droppableId="email-blocks">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-4"
                >
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`group border rounded-lg p-4 bg-white transition-all ${
                            selectedBlockId === block.id ? 'ring-2 ring-purple-500' : 'hover:shadow-md'
                          } ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''}`}
                          onClick={() => setSelectedBlockId(block.id)}
                        >
                          <BlockToolbar
                            onDelete={() => deleteBlock(block.id)}
                            dragHandleProps={provided.dragHandleProps}
                          />
                          {renderBlock(block)}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {blocks.length === 0 && (
                    <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                      <h3 className="text-lg font-medium mb-2">Votre email est vide</h3>
                      <p className="text-sm">Ajoutez votre premier bloc depuis la barre latérale</p>
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
};
