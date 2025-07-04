
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Type, 
  Image as ImageIcon, 
  Layout, 
  Users, 
  Trash2, 
  ArrowUp, 
  ArrowDown,
  Eye,
  Edit3
} from 'lucide-react';
import { toast } from 'sonner';

export interface SimpleBlock {
  id: string;
  type: 'text' | 'image' | 'hero' | 'artists';
  content: any;
}

interface SimpleBlockEditorProps {
  initialBlocks?: SimpleBlock[];
  onSave: (blocks: SimpleBlock[]) => void;
  onPreview?: () => void;
}

export const SimpleBlockEditor: React.FC<SimpleBlockEditorProps> = ({ 
  initialBlocks = [], 
  onSave,
  onPreview 
}) => {
  const [blocks, setBlocks] = useState<SimpleBlock[]>(initialBlocks);
  const [isPreview, setIsPreview] = useState(false);

  const addBlock = (type: 'text' | 'image' | 'hero' | 'artists') => {
    const newBlock: SimpleBlock = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type)
    };
    
    setBlocks([...blocks, newBlock]);
    toast.success(`Bloc ${type} ajouté`);
  };

  const updateBlock = (id: string, content: any) => {
    setBlocks(blocks.map(block => 
      block.id === id ? { ...block, content } : block
    ));
  };

  const deleteBlock = (id: string) => {
    setBlocks(blocks.filter(block => block.id !== id));
    toast.success('Bloc supprimé');
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const index = blocks.findIndex(block => block.id === id);
    if (index === -1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex >= 0 && targetIndex < blocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      setBlocks(newBlocks);
    }
  };

  const handleSave = () => {
    onSave(blocks);
    toast.success('Page sauvegardée');
  };

  const getDefaultContent = (type: string) => {
    switch (type) {
      case 'text':
        return { text: 'Votre texte ici...', style: 'normal' };
      case 'image':
        return { src: '', alt: 'Image', caption: '' };
      case 'hero':
        return { 
          title: 'Titre Principal', 
          subtitle: 'Votre sous-titre', 
          backgroundImage: '', 
          buttonText: 'Action', 
          buttonLink: '#' 
        };
      case 'artists':
        return { title: 'Nos Artistes', showAll: true };
      default:
        return {};
    }
  };

  const renderBlockEditor = (block: SimpleBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <Textarea
              value={block.content.text || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, text: e.target.value })}
              placeholder="Votre texte ici..."
              className="min-h-[100px]"
            />
            <select
              value={block.content.style || 'normal'}
              onChange={(e) => updateBlock(block.id, { ...block.content, style: e.target.value })}
              className="p-2 border rounded w-full"
            >
              <option value="normal">Texte normal</option>
              <option value="title">Titre H1</option>
              <option value="subtitle">Titre H2</option>
              <option value="h3">Titre H3</option>
            </select>
          </div>
        );

      case 'image':
        return (
          <div className="space-y-3">
            <Input
              type="text"
              value={block.content.src || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, src: e.target.value })}
              placeholder="URL de l'image"
            />
            <Input
              type="text"
              value={block.content.alt || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
              placeholder="Texte alternatif"
            />
            <Input
              type="text"
              value={block.content.caption || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
              placeholder="Légende (optionnelle)"
            />
            {block.content.src && (
              <div className="mt-3">
                <img 
                  src={block.content.src} 
                  alt={block.content.alt || 'Image'} 
                  className="max-w-full h-auto rounded border"
                  style={{ maxHeight: '200px' }}
                />
              </div>
            )}
          </div>
        );

      case 'hero':
        return (
          <div className="space-y-3">
            <Input
              type="text"
              value={block.content.title || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
              placeholder="Titre principal"
              className="font-bold text-lg"
            />
            <Input
              type="text"
              value={block.content.subtitle || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, subtitle: e.target.value })}
              placeholder="Sous-titre"
            />
            <Input
              type="text"
              value={block.content.backgroundImage || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, backgroundImage: e.target.value })}
              placeholder="URL image de fond"
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={block.content.buttonText || ''}
                onChange={(e) => updateBlock(block.id, { ...block.content, buttonText: e.target.value })}
                placeholder="Texte du bouton"
              />
              <Input
                type="text"
                value={block.content.buttonLink || ''}
                onChange={(e) => updateBlock(block.id, { ...block.content, buttonLink: e.target.value })}
                placeholder="Lien du bouton"
              />
            </div>
          </div>
        );

      case 'artists':
        return (
          <div className="space-y-3">
            <Input
              type="text"
              value={block.content.title || ''}
              onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
              placeholder="Titre de la section"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={block.content.showAll || false}
                onChange={(e) => updateBlock(block.id, { ...block.content, showAll: e.target.checked })}
              />
              <span>Afficher tous les artistes</span>
            </label>
          </div>
        );

      default:
        return <div>Type de bloc non supporté</div>;
    }
  };

  const renderBlockPreview = (block: SimpleBlock) => {
    switch (block.type) {
      case 'text':
        const TagName = block.content.style === 'title' ? 'h1' : 
                        block.content.style === 'subtitle' ? 'h2' : 
                        block.content.style === 'h3' ? 'h3' : 'p';
        return (
          <TagName className={
            block.content.style === 'title' ? 'text-3xl font-bold' :
            block.content.style === 'subtitle' ? 'text-2xl font-semibold' :
            block.content.style === 'h3' ? 'text-xl font-medium' : 'text-base'
          }>
            {block.content.text || 'Texte vide'}
          </TagName>
        );

      case 'image':
        return block.content.src ? (
          <div className="text-center">
            <img 
              src={block.content.src} 
              alt={block.content.alt || 'Image'} 
              className="max-w-full h-auto mx-auto rounded"
            />
            {block.content.caption && (
              <p className="text-sm text-gray-600 mt-2">{block.content.caption}</p>
            )}
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded p-8 text-center">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Image non définie</p>
          </div>
        );

      case 'hero':
        return (
          <div 
            className="relative bg-gray-900 text-white p-12 rounded-lg text-center"
            style={block.content.backgroundImage ? {
              backgroundImage: `url(${block.content.backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            } : {}}
          >
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">{block.content.title || 'Titre'}</h1>
              {block.content.subtitle && (
                <p className="text-xl mb-6">{block.content.subtitle}</p>
              )}
              {block.content.buttonText && (
                <Button className="bg-blue-600 hover:bg-blue-700">
                  {block.content.buttonText}
                </Button>
              )}
            </div>
          </div>
        );

      case 'artists':
        return (
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">{block.content.title || 'Nos Artistes'}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 rounded-lg p-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
                  <p className="font-medium">Artiste {i}</p>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <div>Aperçu non disponible</div>;
    }
  };

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'image': return <ImageIcon className="h-4 w-4" />;
      case 'hero': return <Layout className="h-4 w-4" />;
      case 'artists': return <Users className="h-4 w-4" />;
      default: return <div className="h-4 w-4" />;
    }
  };

  const getBlockLabel = (type: string) => {
    switch (type) {
      case 'text': return 'Texte';
      case 'image': return 'Image';
      case 'hero': return 'Hero';
      case 'artists': return 'Artistes';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre d'outils */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setIsPreview(!isPreview)}
            variant={isPreview ? "default" : "outline"}
          >
            {isPreview ? <Edit3 className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {isPreview ? 'Éditer' : 'Aperçu'}
          </Button>
          
          {!isPreview && (
            <div className="flex items-center space-x-1 ml-4">
              <Button
                onClick={() => addBlock('text')}
                variant="outline"
                size="sm"
              >
                <Type className="h-4 w-4 mr-1" />
                Texte
              </Button>
              <Button
                onClick={() => addBlock('image')}
                variant="outline"
                size="sm"
              >
                <ImageIcon className="h-4 w-4 mr-1" />
                Image
              </Button>
              <Button
                onClick={() => addBlock('hero')}
                variant="outline"
                size="sm"
              >
                <Layout className="h-4 w-4 mr-1" />
                Hero
              </Button>
              <Button
                onClick={() => addBlock('artists')}
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-1" />
                Artistes
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {onPreview && (
            <Button onClick={onPreview} variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Prévisualiser le site
            </Button>
          )}
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Sauvegarder
          </Button>
        </div>
      </div>

      {/* Zone de contenu */}
      <div className="space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-lg">
            <Layout className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium mb-2">Aucun contenu</h3>
            <p className="text-gray-600 mb-4">Ajoutez des blocs pour créer votre page</p>
            <Button onClick={() => addBlock('hero')} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un bloc Hero
            </Button>
          </div>
        ) : (
          blocks.map((block, index) => (
            <Card key={block.id} className="relative group">
              <CardContent className="p-4">
                {!isPreview && (
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="flex items-center space-x-1">
                        {getBlockIcon(block.type)}
                        <span>{getBlockLabel(block.type)}</span>
                      </Badge>
                      <span className="text-sm text-gray-500">Bloc #{index + 1}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveBlock(block.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveBlock(block.id, 'down')}
                        disabled={index === blocks.length - 1}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteBlock(block.id)}
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {isPreview ? renderBlockPreview(block) : renderBlockEditor(block)}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
