
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Plus, Eye, Save, Type, Heading1, Link, Minus, Space, Image as ImageIcon, BarChart3, Share2, FileText } from 'lucide-react';
import { EmailBlock, TextBlockContent, HeadingBlockContent, ButtonBlockContent, DividerBlockContent, SpacerBlockContent, ImageBlockContent, SocialBlockContent, FooterBlockContent } from './types';
import { TextBlock } from './blocks/TextBlock';
import { HeadingBlock } from './blocks/HeadingBlock';
import { ButtonBlock } from './blocks/ButtonBlock';
import { DividerBlock } from './blocks/DividerBlock';
import { SpacerBlock } from './blocks/SpacerBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { SocialBlock } from './blocks/SocialBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { BlockToolbar } from './BlockToolbar';
import { EmailPreview } from './EmailPreview';
import { EmailTemplates } from './EmailTemplates';
import { EmailStatsView } from './EmailStatsView';
import { createDefaultBlockContent } from './EmailBlockFactory';
import { toast } from 'sonner';

interface EmailEditorProps {
  initialBlocks?: EmailBlock[];
  onSave: (blocks: EmailBlock[]) => void;
  onPreview: (blocks: EmailBlock[]) => void;
  showTemplates?: boolean;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({ initialBlocks = [], onSave, onPreview, showTemplates = false }) => {
  const [blocks, setBlocks] = useState<EmailBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(showTemplates);

  const addBlock = (type: EmailBlock['type']) => {
    const id = Date.now().toString();
    const content = createDefaultBlockContent(type);
    setBlocks([...blocks, { id, type, content }]);
    setSelectedBlockId(id);
    toast.success(`Bloc ${type} ajouté`);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => block.id === id ? { ...block, content } : block));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    if (selectedBlockId === id) setSelectedBlockId(null);
    toast.success('Bloc supprimé');
  };

  const reorderBlocks = (result: any) => {
    if (!result.destination) return;
    const items = Array.from(blocks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setBlocks(items);
  };

  const renderBlock = (block: EmailBlock, isSelected: boolean) => {
    const props = { content: block.content, onChange: (content: any) => updateBlock(block.id, content), isSelected };
    switch (block.type) {
      case 'text': return <TextBlock {...props} content={block.content as TextBlockContent} />;
      case 'heading': return <HeadingBlock {...props} content={block.content as HeadingBlockContent} />;
      case 'button': return <ButtonBlock {...props} content={block.content as ButtonBlockContent} />;
      case 'divider': return <DividerBlock {...props} content={block.content as DividerBlockContent} />;
      case 'spacer': return <SpacerBlock {...props} content={block.content as SpacerBlockContent} />;
      case 'image': return <ImageBlock {...props} content={block.content as ImageBlockContent} />;
      case 'social': return <SocialBlock {...props} content={block.content as SocialBlockContent} />;
      case 'footer': return <FooterBlock {...props} content={block.content as FooterBlockContent} />;
      default: return null;
    }
  };

  const handleSave = () => { onSave(blocks); toast.success('Email sauvegardé'); };
  const handlePreview = () => { onPreview(blocks); setShowPreview(true); };
  const handleSelectTemplate = (templateBlocks: EmailBlock[]) => { setBlocks(templateBlocks); setShowTemplateSelector(false); toast.success('Modèle appliqué avec succès'); };

  if (showTemplateSelector) return <EmailTemplates onSelectTemplate={handleSelectTemplate} onBack={() => setShowTemplateSelector(false)} />;
  if (showPreview) return <EmailPreview blocks={blocks} onClose={() => setShowPreview(false)} onSave={handleSave} />;
  if (showStats) return <EmailStatsView onBack={() => setShowStats(false)} />;

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r bg-muted/30 p-4">
        <h3 className="font-semibold mb-4">Blocs disponibles</h3>
        <div className="space-y-2">
          {[
            { type: 'text' as const, icon: Type, label: 'Texte' },
            { type: 'heading' as const, icon: Heading1, label: 'Titre' },
            { type: 'image' as const, icon: ImageIcon, label: 'Image' },
            { type: 'button' as const, icon: Link, label: 'Bouton' },
            { type: 'divider' as const, icon: Minus, label: 'Séparateur' },
            { type: 'spacer' as const, icon: Space, label: 'Espacement' },
            { type: 'social' as const, icon: Share2, label: 'Réseaux sociaux' },
            { type: 'footer' as const, icon: FileText, label: 'Pied de page' },
          ].map(({ type, icon: Icon, label }) => (
            <Button key={type} variant="outline" className="w-full justify-start" onClick={() => addBlock(type)}>
              <Icon className="h-4 w-4 mr-2" />{label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Éditeur d'email</h2>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowTemplateSelector(true)}><FileText className="h-4 w-4 mr-2" />Modèles</Button>
            <Button variant="outline" onClick={() => setShowStats(true)}><BarChart3 className="h-4 w-4 mr-2" />Statistiques</Button>
            <Button variant="outline" onClick={handlePreview}><Eye className="h-4 w-4 mr-2" />Aperçu</Button>
            <Button onClick={handleSave}><Save className="h-4 w-4 mr-2" />Sauvegarder</Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-4">
          <DragDropContext onDragEnd={reorderBlocks}>
            <Droppable droppableId="email-blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {blocks.map((block, index) => (
                    <Draggable key={block.id} draggableId={block.id} index={index}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps}
                          className={`group border rounded-lg p-4 bg-white transition-all ${selectedBlockId === block.id ? 'ring-2 ring-purple-500' : 'hover:shadow-md'} ${snapshot.isDragging ? 'shadow-lg rotate-1' : ''}`}
                          onClick={() => setSelectedBlockId(block.id)}>
                          <BlockToolbar onDelete={() => deleteBlock(block.id)} dragHandleProps={provided.dragHandleProps} />
                          {renderBlock(block, selectedBlockId === block.id)}
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
