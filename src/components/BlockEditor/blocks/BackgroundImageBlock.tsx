import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { BackgroundImageManager } from '@/components/BackgroundImageManager';

interface BackgroundImageBlockContent {
  backgroundImage?: string;
  backgroundColor?: string;
  overlayOpacity?: number;
  overlayColor?: string;
  content?: string;
  height?: string;
  padding?: string;
  textColor?: string;
  textAlign?: 'left' | 'center' | 'right';
  textFont?: 'sans' | 'serif' | 'playfair' | 'roboto' | 'opensans';
  textSize?: string;
}

interface BackgroundImageBlockProps {
  content: BackgroundImageBlockContent;
  onChange: (content: BackgroundImageBlockContent) => void;
  isSelected?: boolean;
  previewMode?: boolean;
}

const GOOGLE_FONTS = [
  { value: 'sans', label: 'Inter (Sans-serif)' },
  { value: 'serif', label: 'Playfair Display (Serif)' },
  { value: 'playfair', label: 'Playfair Display' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'opensans', label: 'Open Sans' }
];

export const BackgroundImageBlock: React.FC<BackgroundImageBlockProps> = ({
  content,
  onChange,
  isSelected,
  previewMode
}) => {
  const [showImageManager, setShowImageManager] = useState(false);

  if (!previewMode && isSelected) {
    return (
      <Card className="p-6 space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="background">Fond</TabsTrigger>
            <TabsTrigger value="typography">Typographie</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label>Contenu</Label>
              <Textarea
                value={content.content || ''}
                onChange={(e) => onChange({ ...content, content: e.target.value })}
                placeholder="Texte à afficher sur l'image..."
                rows={6}
              />
            </div>

            <div>
              <Label>Alignement du texte</Label>
              <Select
                value={content.textAlign || 'center'}
                onValueChange={(value) => onChange({ ...content, textAlign: value as any })}
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
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <div>
              <Label>Image de fond</Label>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setShowImageManager(!showImageManager)}
              >
                {content.backgroundImage ? 'Changer l\'image' : 'Sélectionner une image'}
              </Button>
              {showImageManager && (
                <div className="mt-4">
                  <BackgroundImageManager
                    selectedImageUrl={content.backgroundImage}
                    onSelectImage={(url) => {
                      onChange({ ...content, backgroundImage: url });
                      setShowImageManager(false);
                    }}
                  />
                </div>
              )}
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
              <Label>Opacité du calque ({Math.round((content.overlayOpacity || 0.5) * 100)}%)</Label>
              <Slider
                value={[(content.overlayOpacity || 0.5) * 100]}
                onValueChange={([value]) => onChange({ ...content, overlayOpacity: value / 100 })}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Couleur du calque</Label>
              <Input
                type="color"
                value={content.overlayColor || '#000000'}
                onChange={(e) => onChange({ ...content, overlayColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Hauteur</Label>
              <Input
                value={content.height || '400px'}
                onChange={(e) => onChange({ ...content, height: e.target.value })}
                placeholder="400px, 100vh, etc."
              />
            </div>

            <div>
              <Label>Espacement intérieur</Label>
              <Input
                value={content.padding || '2rem'}
                onChange={(e) => onChange({ ...content, padding: e.target.value })}
                placeholder="2rem, 32px, etc."
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label>Police du texte</Label>
              <Select
                value={content.textFont || 'sans'}
                onValueChange={(value) => onChange({ ...content, textFont: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GOOGLE_FONTS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Taille du texte</Label>
              <Input
                value={content.textSize || '1.125rem'}
                onChange={(e) => onChange({ ...content, textSize: e.target.value })}
                placeholder="1.125rem, 18px, etc."
              />
            </div>

            <div>
              <Label>Couleur du texte</Label>
              <Input
                type="color"
                value={content.textColor || '#ffffff'}
                onChange={(e) => onChange({ ...content, textColor: e.target.value })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  const overlayStyle: React.CSSProperties = {
    backgroundColor: content.overlayColor || '#000000',
    opacity: content.overlayOpacity || 0.5
  };

  const getFontClass = (font?: string) => {
    const fontMap: Record<string, string> = {
      sans: 'font-sans',
      serif: 'font-serif',
      playfair: 'font-playfair',
      roboto: 'font-roboto',
      opensans: 'font-opensans'
    };
    return fontMap[font || 'sans'] || 'font-sans';
  };

  const containerStyle: React.CSSProperties = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : 'none',
    backgroundColor: content.backgroundColor || 'hsl(var(--muted))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: content.height || '400px',
    padding: content.padding || '2rem',
    position: 'relative'
  };

  const textStyle: React.CSSProperties = {
    color: content.textColor || '#ffffff',
    fontSize: content.textSize || '1.125rem'
  };

  return (
    <div style={containerStyle} className="relative overflow-hidden">
      <div className="absolute inset-0" style={overlayStyle}></div>
      <div 
        className={`relative z-10 h-full flex items-center`}
        style={{ justifyContent: content.textAlign || 'center' }}
      >
        <div 
          className={`w-full text-${content.textAlign || 'center'} ${getFontClass(content.textFont)}`}
          style={textStyle}
        >
          {content.content || 'Cliquez pour ajouter du contenu...'}
        </div>
      </div>
    </div>
  );
};
