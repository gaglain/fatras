
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X } from 'lucide-react';
import { ImageBlockContent } from '../types';

interface ImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, onChange }) => {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({ 
          ...content, 
          src: e.target?.result as string,
          alt: file.name 
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    onChange({ ...content, src: '', alt: '' });
  };

  return (
    <div className="space-y-4">
      {content.src ? (
        <div className="relative">
          <div style={{ textAlign: content.alignment }}>
            <img
              src={content.src}
              alt={content.alt}
              style={{
                maxWidth: `${content.width}%`,
                height: content.height || 'auto',
                display: 'inline-block',
                borderRadius: content.borderRadius ? `${content.borderRadius}px` : '0'
              }}
            />
          </div>
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={removeImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg">
          <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p className="text-gray-500 mb-4">Ajouter une image</p>
          <div className="space-y-2">
            <label className="cursor-pointer">
              <Button variant="outline" size="sm" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Télécharger un fichier
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
            <div className="text-sm text-gray-500">ou</div>
            <Input
              type="url"
              placeholder="URL de l'image"
              value={content.src}
              onChange={(e) => onChange({ ...content, src: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Largeur (%)</label>
          <Input
            type="number"
            min="10"
            max="100"
            value={content.width}
            onChange={(e) => onChange({ ...content, width: parseInt(e.target.value) || 100 })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hauteur</label>
          <Input
            placeholder="auto"
            value={content.height || ''}
            onChange={(e) => onChange({ ...content, height: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Alignement</label>
          <Select value={content.alignment} onValueChange={(value: 'left' | 'center' | 'right') => onChange({ ...content, alignment: value })}>
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
        <div>
          <label className="block text-sm font-medium mb-1">Bordure arrondie (px)</label>
          <Input
            type="number"
            min="0"
            value={content.borderRadius || 0}
            onChange={(e) => onChange({ ...content, borderRadius: parseInt(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Texte alternatif</label>
        <Input
          placeholder="Description de l'image"
          value={content.alt}
          onChange={(e) => onChange({ ...content, alt: e.target.value })}
        />
      </div>
    </div>
  );
};
