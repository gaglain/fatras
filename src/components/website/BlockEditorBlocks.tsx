import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUploader } from '@/components/ui/image-uploader';
import { Settings, Trash2, GripVertical, Image, Layout } from 'lucide-react';

interface Block {
  id: string;
  type: 'text' | 'image' | 'video' | 'hero' | 'artists-grid' | 'events-list' | 'shop-products' | 'contact-form' | 'form' | 'columns';
  content: any;
  order: number;
}

interface BlockEditorBlockProps {
  block: Block;
  isEditing: boolean;
  onToggleEdit: () => void;
  onUpdate: (blockId: string, content: any) => void;
  onDelete: (blockId: string) => void;
  availableForms: any[];
}

export const BlockEditorBlock: React.FC<BlockEditorBlockProps> = ({
  block,
  isEditing,
  onToggleEdit,
  onUpdate,
  onDelete,
  availableForms
}) => {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
            <span className="text-sm font-medium capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {block.type}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onToggleEdit}>
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDelete(block.id)} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <BlockEditForm block={block} onUpdate={onUpdate} availableForms={availableForms} />
        ) : (
          <BlockPreview block={block} />
        )}
      </CardContent>
    </Card>
  );
};

const BlockEditForm: React.FC<{ block: Block; onUpdate: (id: string, content: any) => void; availableForms: any[] }> = ({ block, onUpdate, availableForms }) => (
  <div className="space-y-4">
    {block.type === 'text' && (
      <>
        <Textarea
          placeholder="Contenu du texte"
          value={block.content.content}
          onChange={(e) => onUpdate(block.id, { ...block.content, content: e.target.value })}
          rows={4}
        />
        <div className="grid grid-cols-2 gap-4">
          <select className="px-3 py-2 border rounded" value={block.content.alignment}
            onChange={(e) => onUpdate(block.id, { ...block.content, alignment: e.target.value })}>
            <option value="left">Aligné à gauche</option>
            <option value="center">Centré</option>
            <option value="right">Aligné à droite</option>
          </select>
          <select className="px-3 py-2 border rounded" value={block.content.size}
            onChange={(e) => onUpdate(block.id, { ...block.content, size: e.target.value })}>
            <option value="small">Petit</option>
            <option value="normal">Normal</option>
            <option value="large">Grand</option>
          </select>
        </div>
      </>
    )}

    {block.type === 'image' && (
      <>
        <ImageUploader
          currentImage={block.content.src}
          onImageUploaded={(imageUrl) => onUpdate(block.id, { ...block.content, src: imageUrl })}
        />
        <Input placeholder="Texte alternatif" value={block.content.alt}
          onChange={(e) => onUpdate(block.id, { ...block.content, alt: e.target.value })} />
        <Input placeholder="Légende (optionnel)" value={block.content.caption}
          onChange={(e) => onUpdate(block.id, { ...block.content, caption: e.target.value })} />
        <select className="px-3 py-2 border rounded w-full" value={block.content.alignment}
          onChange={(e) => onUpdate(block.id, { ...block.content, alignment: e.target.value })}>
          <option value="left">Aligné à gauche</option>
          <option value="center">Centré</option>
          <option value="right">Aligné à droite</option>
        </select>
      </>
    )}

    {block.type === 'hero' && (
      <>
        <Input placeholder="Titre principal" value={block.content.title}
          onChange={(e) => onUpdate(block.id, { ...block.content, title: e.target.value })} />
        <Input placeholder="Sous-titre" value={block.content.subtitle}
          onChange={(e) => onUpdate(block.id, { ...block.content, subtitle: e.target.value })} />
        <ImageUploader
          currentImage={block.content.backgroundImage}
          onImageUploaded={(imageUrl) => onUpdate(block.id, { ...block.content, backgroundImage: imageUrl })}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Texte du bouton" value={block.content.buttonText}
            onChange={(e) => onUpdate(block.id, { ...block.content, buttonText: e.target.value })} />
          <Input placeholder="Lien du bouton" value={block.content.buttonLink}
            onChange={(e) => onUpdate(block.id, { ...block.content, buttonLink: e.target.value })} />
        </div>
      </>
    )}

    {block.type === 'form' && (
      <>
        <Input placeholder="Titre personnalisé (optionnel)" value={block.content.customTitle}
          onChange={(e) => onUpdate(block.id, { ...block.content, customTitle: e.target.value })} />
        <Select value={block.content.formId}
          onValueChange={(value) => onUpdate(block.id, { ...block.content, formId: value })}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un formulaire" /></SelectTrigger>
          <SelectContent>
            {availableForms.map((form) => (
              <SelectItem key={form.id} value={form.id}>{form.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {availableForms.length === 0 && (
          <p className="text-sm text-gray-500">Aucun formulaire disponible. Créez d'abord un formulaire dans l'espace Formulaires.</p>
        )}
      </>
    )}

    {(block.type === 'artists-grid' || block.type === 'events-list' || block.type === 'shop-products') && (
      <>
        <Input placeholder="Titre de la section" value={block.content.title}
          onChange={(e) => onUpdate(block.id, { ...block.content, title: e.target.value })} />
        <div className="grid grid-cols-2 gap-4">
          <Input type="number" placeholder="Limite d'affichage" value={block.content.limit}
            onChange={(e) => onUpdate(block.id, { ...block.content, limit: parseInt(e.target.value) })} />
          <label className="flex items-center space-x-2">
            <input type="checkbox" checked={block.content.showAll}
              onChange={(e) => onUpdate(block.id, { ...block.content, showAll: e.target.checked })} />
            <span>Afficher tout</span>
          </label>
        </div>
      </>
    )}
  </div>
);

const BlockPreview: React.FC<{ block: Block }> = ({ block }) => (
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
          {block.content.buttonText && <Button className="mt-2">{block.content.buttonText}</Button>}
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
          <p className="text-sm text-gray-500">Synchronisé avec les données du back-office</p>
        </div>
      )}
      {block.type === 'contact-form' && (
        <div>
          <h3 className="font-bold">Formulaire de Contact</h3>
          <p className="text-sm text-gray-500">Les messages seront envoyés au back-office</p>
        </div>
      )}
    </div>
  </div>
);
