
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { ImageBlockContent } from '../types';

interface ImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('url');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const src = e.target?.result as string;
        onChange({ ...content, src });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlChange = (url: string) => {
    onChange({ ...content, src: url });
  };

  if (isEditing) {
    return (
      <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex space-x-2">
          <Button
            variant={uploadMethod === 'url' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('url')}
          >
            <LinkIcon className="h-4 w-4 mr-2" />
            URL
          </Button>
          <Button
            variant={uploadMethod === 'file' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setUploadMethod('file')}
          >
            <Upload className="h-4 w-4 mr-2" />
            Fichier
          </Button>
        </div>

        {uploadMethod === 'url' ? (
          <div>
            <label className="block text-sm font-medium mb-2">URL de l'image</label>
            <Input
              value={content.src}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="https://exemple.com/image.jpg"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-2">Télécharger une image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id={`image-upload-${Date.now()}`}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById(`image-upload-${Date.now()}`)?.click()}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              Choisir un fichier
            </Button>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2">Texte alternatif</label>
          <Input
            value={content.alt}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            placeholder="Description de l'image"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Alignement</label>
            <Select
              value={content.align}
              onValueChange={(value: 'left' | 'center' | 'right') => 
                onChange({ ...content, align: value })
              }
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

          <div>
            <label className="block text-sm font-medium mb-2">Largeur (%)</label>
            <Input
              type="number"
              value={content.width}
              onChange={(e) => onChange({ ...content, width: parseInt(e.target.value) || 100 })}
              min="10"
              max="100"
              placeholder="100"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          <Button onClick={() => setIsEditing(false)} className="flex-1">
            Terminer
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)}>
            Annuler
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`p-4 cursor-pointer hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 ${
        content.align === 'center' ? 'text-center' : 
        content.align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => setIsEditing(true)}
    >
      {content.src ? (
        <div style={{ textAlign: content.align }}>
          <img
            src={content.src}
            alt={content.alt}
            style={{
              maxWidth: `${content.width}%`,
              height: 'auto',
              display: content.align === 'center' ? 'inline-block' : 
                     content.align === 'right' ? 'block' : 'block',
              marginLeft: content.align === 'right' ? 'auto' : 
                         content.align === 'center' ? 'auto' : '0',
              marginRight: content.align === 'left' ? 'auto' : 
                          content.align === 'center' ? 'auto' : '0'
            }}
            className="rounded-lg shadow-sm"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-gray-500">
          <Upload className="h-12 w-12 mb-2" />
          <p className="text-sm">Cliquez pour ajouter une image</p>
          <p className="text-xs">URL ou fichier local</p>
        </div>
      )}
    </div>
  );
};
