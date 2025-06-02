
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload } from 'lucide-react';
import { ImageBlockContent } from '../types';

interface ImageBlockProps {
  content: ImageBlockContent;
  isEditing: boolean;
  onChange: (content: ImageBlockContent) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, isEditing, onChange }) => {
  const [isEditingImage, setIsEditingImage] = useState(false);

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

  const getSizeClass = (size?: string) => {
    switch (size) {
      case 'sm': return 'max-w-sm';
      case 'md': return 'max-w-md';
      case 'lg': return 'max-w-lg';
      case 'full': return 'w-full';
      default: return 'max-w-md';
    }
  };

  if (isEditing && isEditingImage) {
    return (
      <Card className="m-4">
        <CardContent className="p-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <div className="flex items-center space-x-4">
                <img src={content.src} alt={content.alt} className="w-20 h-20 object-cover rounded" />
                <div>
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
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Changer l'image
                  </Button>
                </div>
              </div>
            </div>
            
            <Input
              value={content.alt}
              onChange={(e) => onChange({ ...content, alt: e.target.value })}
              placeholder="Texte alternatif"
            />
            
            <Input
              value={content.caption || ''}
              onChange={(e) => onChange({ ...content, caption: e.target.value })}
              placeholder="Légende (optionnelle)"
            />
            
            <div className="flex items-center space-x-4">
              <Select
                value={content.alignment}
                onValueChange={(value: 'left' | 'center' | 'right') => 
                  onChange({ ...content, alignment: value })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={content.size || 'md'}
                onValueChange={(value) => onChange({ ...content, size: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Petit</SelectItem>
                  <SelectItem value="md">Moyen</SelectItem>
                  <SelectItem value="lg">Grand</SelectItem>
                  <SelectItem value="full">Pleine largeur</SelectItem>
                </SelectContent>
              </Select>
              
              <Button onClick={() => setIsEditingImage(false)}>
                Terminer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`px-4 py-6 flex ${content.alignment === 'center' ? 'justify-center' : content.alignment === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
        onClick={() => isEditing && setIsEditingImage(true)}
      >
        <img
          src={content.src}
          alt={content.alt}
          className={`${getSizeClass(content.size)} h-auto rounded-lg shadow-lg`}
        />
        {content.caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">{content.caption}</p>
        )}
      </div>
    </div>
  );
};
