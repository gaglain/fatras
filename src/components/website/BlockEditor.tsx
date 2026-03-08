
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ui/image-uploader';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Plus,
  GripVertical,
  Settings,
  Trash2,
  Type,
  Image,
  Video,
  Users,
  Calendar,
  Store,
  Mail,
  Layout
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'hero' | 'artists-grid' | 'events-list' | 'shop-products' | 'contact-form' | 'form' | 'columns';
  content: any;
  order: number;
}

interface WebPage {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'private';
  type: 'page' | 'home' | 'artists' | 'events' | 'shop' | 'contact';
  blocks: Block[];
  seo: {
    title: string;
    description: string;
    keywords: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BlockEditorProps {
  page: WebPage;
  onSave: (page: WebPage) => void;
  onCancel: () => void;
}

const blockTypes = [
  { type: 'text', label: 'Texte', icon: Type, description: 'Paragraphe de texte simple' },
  { type: 'image', label: 'Image', icon: Image, description: 'Image avec légende' },
  { type: 'video', label: 'Vidéo', icon: Video, description: 'Vidéo YouTube ou Vimeo' },
  { type: 'hero', label: 'Hero', icon: Layout, description: 'Section héro avec titre et bouton' },
  { type: 'artists-grid', label: 'Grille Artistes', icon: Users, description: 'Affichage des artistes' },
  { type: 'events-list', label: 'Liste Événements', icon: Calendar, description: 'Liste des événements' },
  { type: 'shop-products', label: 'Produits', icon: Store, description: 'Grille de produits' },
  { type: 'form', label: 'Formulaire', icon: Mail, description: 'Formulaire personnalisé' },
  { type: 'contact-form', label: 'Contact Simple', icon: Mail, description: 'Formulaire de contact basique' },
  { type: 'columns', label: 'Colonnes', icon: Layout, description: 'Mise en page en colonnes' }
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ page, onSave, onCancel }) => {
  const [currentPage, setCurrentPage] = useState<WebPage>(page);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [availableForms, setAvailableForms] = useState<any[]>([]);
  const { user } = useAuth();

  // Charger les formulaires disponibles
  useEffect(() => {
    const loadForms = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('forms')
          .select('id, name, description')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAvailableForms(data || []);
      } catch {
        // Silent - forms loading failed
      }
    };

    loadForms();
  }, [user]);

  const getDefaultBlockContent = (type: string) => {
    switch (type) {
      case 'text':
        return { content: 'Votre texte ici...', alignment: 'left', size: 'normal' };
      case 'image':
        return { src: '', alt: '', caption: '', alignment: 'center' };
      case 'video':
        return { url: '', caption: '', autoplay: false };
      case 'hero':
        return { 
          title: 'Titre Principal', 
          subtitle: 'Sous-titre',
          backgroundImage: '',
          buttonText: 'Action',
          buttonLink: '',
          overlay: true
        };
      case 'artists-grid':
        return { title: 'Nos Artistes', showAll: true, limit: 6 };
      case 'events-list':
        return { title: 'Prochains Événements', showAll: true, limit: 5 };
      case 'shop-products':
        return { title: 'Nos Produits', category: '', limit: 8 };
      case 'contact-form':
        return { title: 'Contactez-nous', fields: ['name', 'email', 'message'] };
      case 'form':
        return { title: 'Formulaire', formId: '', customTitle: '' };
      case 'columns':
        return { columns: 2, content: ['', ''] };
      default:
        return {};
    }
  };

  const addBlock = (type: string) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type: type as Block['type'],
      content: getDefaultBlockContent(type),
      order: currentPage.blocks.length
    };

    setCurrentPage(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
    setShowBlockSelector(false);
  };

  const updateBlock = (blockId: string, content: any) => {
    setCurrentPage(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId ? { ...block, content } : block
      )
    }));
  };

  const deleteBlock = (blockId: string) => {
    if (confirm('Supprimer ce bloc ?')) {
      setCurrentPage(prev => ({
        ...prev,
        blocks: prev.blocks.filter(block => block.id !== blockId)
      }));
    }
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const blocks = Array.from(currentPage.blocks);
    const [reorderedBlock] = blocks.splice(result.source.index, 1);
    blocks.splice(result.destination.index, 0, reorderedBlock);

    const updatedBlocks = blocks.map((block, index) => ({
      ...block,
      order: index
    }));

    setCurrentPage(prev => ({ ...prev, blocks: updatedBlocks }));
  };

  const renderBlockEditor = (block: Block) => {
    const isEditing = editingBlock === block.id;

    return (
      <Card key={block.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
              <span className="text-sm font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {block.type}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingBlock(isEditing ? null : block.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteBlock(block.id)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              {block.type === 'text' && (
                <>
                  <Textarea
                    placeholder="Contenu du texte"
                    value={block.content.content}
                    onChange={(e) => updateBlock(block.id, { ...block.content, content: e.target.value })}
                    rows={4}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      className="px-3 py-2 border rounded"
                      value={block.content.alignment}
                      onChange={(e) => updateBlock(block.id, { ...block.content, alignment: e.target.value })}
                    >
                      <option value="left">Aligné à gauche</option>
                      <option value="center">Centré</option>
                      <option value="right">Aligné à droite</option>
                    </select>
                    <select
                      className="px-3 py-2 border rounded"
                      value={block.content.size}
                      onChange={(e) => updateBlock(block.id, { ...block.content, size: e.target.value })}
                    >
                      <option value="small">Petit</option>
                      <option value="normal">Normal</option>
                      <option value="large">Grand</option>
                    </select>
                  </div>
                </>
              )}

              {/* Hero editor handled below with ImageUploader (single source of truth) */}
              {block.type === 'image' && (
                <>
                  <ImageUploader
                    currentImage={block.content.src}
                    onImageUploaded={(imageUrl) => updateBlock(block.id, { ...block.content, src: imageUrl })}
                  />
                  <Input
                    placeholder="Texte alternatif"
                    value={block.content.alt}
                    onChange={(e) => updateBlock(block.id, { ...block.content, alt: e.target.value })}
                  />
                  <Input
                    placeholder="Légende (optionnel)"
                    value={block.content.caption}
                    onChange={(e) => updateBlock(block.id, { ...block.content, caption: e.target.value })}
                  />
                  <select
                    className="px-3 py-2 border rounded w-full"
                    value={block.content.alignment}
                    onChange={(e) => updateBlock(block.id, { ...block.content, alignment: e.target.value })}
                  >
                    <option value="left">Aligné à gauche</option>
                    <option value="center">Centré</option>
                    <option value="right">Aligné à droite</option>
                  </select>
                </>
              )}

              {block.type === 'hero' && (
                <>
                  <Input
                    placeholder="Titre principal"
                    value={block.content.title}
                    onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
                  />
                  <Input
                    placeholder="Sous-titre"
                    value={block.content.subtitle}
                    onChange={(e) => updateBlock(block.id, { ...block.content, subtitle: e.target.value })}
                  />
                  <ImageUploader
                    currentImage={block.content.backgroundImage}
                    onImageUploaded={(imageUrl) => updateBlock(block.id, { ...block.content, backgroundImage: imageUrl })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Texte du bouton"
                      value={block.content.buttonText}
                      onChange={(e) => updateBlock(block.id, { ...block.content, buttonText: e.target.value })}
                    />
                    <Input
                      placeholder="Lien du bouton"
                      value={block.content.buttonLink}
                      onChange={(e) => updateBlock(block.id, { ...block.content, buttonLink: e.target.value })}
                    />
                  </div>
                </>
              )}

              {block.type === 'form' && (
                <>
                  <Input
                    placeholder="Titre personnalisé (optionnel)"
                    value={block.content.customTitle}
                    onChange={(e) => updateBlock(block.id, { ...block.content, customTitle: e.target.value })}
                  />
                  <Select
                    value={block.content.formId}
                    onValueChange={(value) => updateBlock(block.id, { ...block.content, formId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un formulaire" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableForms.map((form) => (
                        <SelectItem key={form.id} value={form.id}>
                          {form.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableForms.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Aucun formulaire disponible. Créez d'abord un formulaire dans l'espace Formulaires.
                    </p>
                  )}
                </>
              )}

              {(block.type === 'artists-grid' || block.type === 'events-list' || block.type === 'shop-products') && (
                <>
                  <Input
                    placeholder="Titre de la section"
                    value={block.content.title}
                    onChange={(e) => updateBlock(block.id, { ...block.content, title: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Limite d'affichage"
                      value={block.content.limit}
                      onChange={(e) => updateBlock(block.id, { ...block.content, limit: parseInt(e.target.value) })}
                    />
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={block.content.showAll}
                        onChange={(e) => updateBlock(block.id, { ...block.content, showAll: e.target.checked })}
                      />
                      <span>Afficher tout</span>
                    </label>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 rounded border-2 border-dashed">
              <div className="text-center text-gray-600">
                {block.type === 'text' && (
                  <div className={`text-${block.content.alignment} text-${block.content.size}`}>
                    {block.content.content || 'Contenu du texte...'}
                  </div>
                )}
                {block.type === 'hero' && (
                  <div>
                    <h2 className="text-2xl font-bold">{block.content.title}</h2>
                    <p className="text-gray-600">{block.content.subtitle}</p>
                    {block.content.buttonText && (
                      <Button className="mt-2">{block.content.buttonText}</Button>
                    )}
                  </div>
                )}
                {block.type === 'image' && (
                  <div>
                    {block.content.src ? (
                      <img src={block.content.src} alt={block.content.alt} className="max-w-full h-auto" />
                    ) : (
                      <div className="h-32 bg-gray-200 flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    {block.content.caption && <p className="text-sm text-gray-500 mt-2">{block.content.caption}</p>}
                  </div>
                )}
                {(block.type === 'artists-grid' || block.type === 'events-list' || block.type === 'shop-products') && (
                  <div>
                    <h3 className="font-bold">{block.content.title}</h3>
                    <p className="text-sm text-gray-500">
                      Synchronisé avec les données du back-office
                    </p>
                  </div>
                )}
                {block.type === 'contact-form' && (
                  <div>
                    <h3 className="font-bold">Formulaire de Contact</h3>
                    <p className="text-sm text-gray-500">
                      Les messages seront envoyés au back-office
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border shadow-sm">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h2 className="text-xl font-bold">{currentPage.title}</h2>
            <p className="text-sm text-gray-600">{currentPage.slug}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.open(currentPage.slug === '/' ? '/front' : `/front${currentPage.slug}`, '_blank')}>
            <Eye className="h-4 w-4 mr-2" />
            Prévisualiser
          </Button>
          <Button onClick={() => onSave(currentPage)}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Contenu de la page</CardTitle>
                <Button onClick={() => setShowBlockSelector(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un bloc
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {currentPage.blocks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Layout className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Page vide</h3>
                  <p className="mb-4">Commencez par ajouter des blocs à votre page</p>
                  <Button onClick={() => setShowBlockSelector(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter votre premier bloc
                  </Button>
                </div>
              ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="blocks">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef}>
                        {currentPage.blocks
                          .sort((a, b) => a.order - b.order)
                          .map((block, index) => (
                            <Draggable key={block.id} draggableId={block.id} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {renderBlockEditor(block)}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Titre SEO</label>
                <Input
                  value={currentPage.seo.title}
                  onChange={(e) => setCurrentPage(prev => ({
                    ...prev,
                    seo: { ...prev.seo, title: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Textarea
                  value={currentPage.seo.description}
                  onChange={(e) => setCurrentPage(prev => ({
                    ...prev,
                    seo: { ...prev.seo, description: e.target.value }
                  }))}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mots-clés</label>
                <Input
                  value={currentPage.seo.keywords}
                  onChange={(e) => setCurrentPage(prev => ({
                    ...prev,
                    seo: { ...prev.seo, keywords: e.target.value }
                  }))}
                  placeholder="mot1, mot2, mot3"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {showBlockSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Choisir un type de bloc</CardTitle>
                <Button variant="outline" onClick={() => setShowBlockSelector(false)}>
                  Fermer
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blockTypes.map((blockType) => {
                  const Icon = blockType.icon;
                  return (
                    <Card
                      key={blockType.type}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => addBlock(blockType.type)}
                    >
                      <CardContent className="p-4 text-center">
                        <Icon className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <h3 className="font-medium">{blockType.label}</h3>
                        <p className="text-sm text-gray-500 mt-1">{blockType.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
