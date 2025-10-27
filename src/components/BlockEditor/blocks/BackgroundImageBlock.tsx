import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface BackgroundImageBlockContent {
  backgroundImage?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
  overlayColor?: string;
  content?: string;
  height?: string;
  padding?: string;
  textColor?: string;
  textAlign?: string;
}

interface BackgroundImageBlockProps {
  content: BackgroundImageBlockContent;
  onChange: (content: BackgroundImageBlockContent) => void;
  isSelected?: boolean;
  previewMode?: boolean;
}

export const BackgroundImageBlock: React.FC<BackgroundImageBlockProps> = ({
  content,
  onChange,
  isSelected,
  previewMode
}) => {
  const [isEditingImage, setIsEditingImage] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onChange({ ...content, backgroundImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const overlayStyle = {
    backgroundColor: `${content.overlayColor || 'black'}`,
    opacity: (content.overlayOpacity || 50) / 100
  };

  if (!previewMode && isSelected) {
    return (
      <div className="border-2 border-primary rounded-lg p-6 bg-card space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Bloc avec Image de Fond</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Image de fond</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={content.backgroundImage || ''}
                onChange={(e) => onChange({ ...content, backgroundImage: e.target.value })}
                placeholder="URL de l'image"
              />
              <Button variant="outline" onClick={() => document.getElementById('bg-image-upload')?.click()}>
                <Upload className="h-4 w-4" />
              </Button>
              <input
                id="bg-image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </div>
          </div>

          <div>
            <Label>Couleur de fond (si pas d'image)</Label>
            <Input
              type="color"
              value={content.backgroundColor || '#000000'}
              onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
            />
          </div>

          <div>
            <Label>Opacité du calque ({content.overlayOpacity || 50}%)</Label>
            <input
              type="range"
              min="0"
              max="100"
              value={content.overlayOpacity || 50}
              onChange={(e) => onChange({ ...content, overlayOpacity: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <Label>Couleur du calque</Label>
            <Select
              value={content.overlayColor || 'black'}
              onValueChange={(value) => onChange({ ...content, overlayColor: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="black">Noir</SelectItem>
                <SelectItem value="white">Blanc</SelectItem>
                <SelectItem value="hsl(var(--primary))">Primaire</SelectItem>
                <SelectItem value="hsl(var(--secondary))">Secondaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Hauteur</Label>
            <Select
              value={content.height || 'h-96'}
              onValueChange={(value) => onChange({ ...content, height: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="h-48">Petite (12rem)</SelectItem>
                <SelectItem value="h-64">Moyenne (16rem)</SelectItem>
                <SelectItem value="h-96">Grande (24rem)</SelectItem>
                <SelectItem value="h-screen">Plein écran</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Contenu</Label>
            <Textarea
              value={content.content || ''}
              onChange={(e) => onChange({ ...content, content: e.target.value })}
              placeholder="Texte à afficher sur l'image..."
              rows={4}
            />
          </div>

          <div>
            <Label>Couleur du texte</Label>
            <Select
              value={content.textColor || 'text-white'}
              onValueChange={(value) => onChange({ ...content, textColor: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-white">Blanc</SelectItem>
                <SelectItem value="text-black">Noir</SelectItem>
                <SelectItem value="text-primary">Primaire</SelectItem>
                <SelectItem value="text-secondary">Secondaire</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Alignement du texte</Label>
            <Select
              value={content.textAlign || 'center'}
              onValueChange={(value) => onChange({ ...content, textAlign: value })}
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
  }

  return (
    <div 
      className={`relative ${content.height || 'h-96'} ${content.padding || 'p-8'} overflow-hidden`}
      style={{
        backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'none',
        backgroundColor: content.backgroundColor || '#000000',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0" style={overlayStyle}></div>
      <div className={`relative z-10 h-full flex items-center justify-${content.textAlign || 'center'}`}>
        <div className={`w-full text-${content.textAlign || 'center'} ${content.textColor || 'text-white'}`}>
          <div className="prose prose-lg max-w-none" style={{ color: 'inherit' }}>
            {content.content || 'Cliquez pour modifier le contenu...'}
          </div>
        </div>
      </div>
    </div>
  );
};