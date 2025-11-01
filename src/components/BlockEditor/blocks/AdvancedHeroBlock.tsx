import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BackgroundImageManager } from '@/components/BackgroundImageManager';

export interface HeroBlockContent {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  buttonText?: string;
  buttonLink?: string;
  titleColor?: string;
  subtitleColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  titleFont?: 'sans' | 'serif' | 'playfair' | 'roboto' | 'opensans';
  subtitleFont?: 'sans' | 'serif' | 'playfair' | 'roboto' | 'opensans';
  titleSize?: string;
  subtitleSize?: string;
  overlayOpacity?: number;
  height?: string;
  padding?: string;
}

interface AdvancedHeroBlockProps {
  content: HeroBlockContent;
  onChange: (content: HeroBlockContent) => void;
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

export const AdvancedHeroBlock: React.FC<AdvancedHeroBlockProps> = ({
  content,
  onChange,
  isSelected,
  previewMode
}) => {
  const [showImageManager, setShowImageManager] = useState(false);

  if (isSelected && !previewMode) {
    return (
      <Card className="p-6 space-y-6">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="background">Fond</TabsTrigger>
            <TabsTrigger value="typography">Typographie</TabsTrigger>
            <TabsTrigger value="button">Bouton</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div>
              <Label>Titre</Label>
              <Input
                value={content.title}
                onChange={(e) => onChange({ ...content, title: e.target.value })}
                placeholder="Votre titre principal"
              />
            </div>
            <div>
              <Label>Sous-titre</Label>
              <Textarea
                value={content.subtitle}
                onChange={(e) => onChange({ ...content, subtitle: e.target.value })}
                placeholder="Votre sous-titre"
                rows={3}
              />
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
              <Label>Couleur de fond</Label>
              <Input
                type="color"
                value={content.backgroundColor || '#1a1f2e'}
                onChange={(e) => onChange({ ...content, backgroundColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Opacité de l'overlay ({Math.round((content.overlayOpacity || 0.3) * 100)}%)</Label>
              <Slider
                value={[(content.overlayOpacity || 0.3) * 100]}
                onValueChange={([value]) => onChange({ ...content, overlayOpacity: value / 100 })}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Hauteur</Label>
              <Input
                value={content.height || '500px'}
                onChange={(e) => onChange({ ...content, height: e.target.value })}
                placeholder="500px, 100vh, etc."
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div>
              <Label>Police du titre</Label>
              <Select
                value={content.titleFont || 'sans'}
                onValueChange={(value) => onChange({ ...content, titleFont: value as any })}
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
              <Label>Taille du titre</Label>
              <Input
                value={content.titleSize || '3rem'}
                onChange={(e) => onChange({ ...content, titleSize: e.target.value })}
                placeholder="3rem, 48px, etc."
              />
            </div>

            <div>
              <Label>Couleur du titre</Label>
              <Input
                type="color"
                value={content.titleColor || '#ffffff'}
                onChange={(e) => onChange({ ...content, titleColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Police du sous-titre</Label>
              <Select
                value={content.subtitleFont || 'sans'}
                onValueChange={(value) => onChange({ ...content, subtitleFont: value as any })}
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
              <Label>Taille du sous-titre</Label>
              <Input
                value={content.subtitleSize || '1.25rem'}
                onChange={(e) => onChange({ ...content, subtitleSize: e.target.value })}
                placeholder="1.25rem, 20px, etc."
              />
            </div>

            <div>
              <Label>Couleur du sous-titre</Label>
              <Input
                type="color"
                value={content.subtitleColor || '#ffffff'}
                onChange={(e) => onChange({ ...content, subtitleColor: e.target.value })}
              />
            </div>
          </TabsContent>

          <TabsContent value="button" className="space-y-4">
            <div>
              <Label>Texte du bouton</Label>
              <Input
                value={content.buttonText || ''}
                onChange={(e) => onChange({ ...content, buttonText: e.target.value })}
                placeholder="Découvrir"
              />
            </div>

            <div>
              <Label>Lien du bouton</Label>
              <Input
                value={content.buttonLink || ''}
                onChange={(e) => onChange({ ...content, buttonLink: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Couleur de fond du bouton</Label>
              <Input
                type="color"
                value={content.buttonBgColor || '#1a1f2e'}
                onChange={(e) => onChange({ ...content, buttonBgColor: e.target.value })}
              />
            </div>

            <div>
              <Label>Couleur du texte du bouton</Label>
              <Input
                type="color"
                value={content.buttonTextColor || '#ffffff'}
                onChange={(e) => onChange({ ...content, buttonTextColor: e.target.value })}
              />
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    );
  }

  const backgroundStyle: React.CSSProperties = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundColor: content.backgroundColor || 'hsl(var(--primary))',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: content.height || '500px',
    position: 'relative'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, ' + (content.overlayOpacity || 0.3) + ')'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    padding: content.padding || '4rem 1rem'
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

  const titleStyle: React.CSSProperties = {
    color: content.titleColor || '#ffffff',
    fontSize: content.titleSize || '3rem'
  };

  const subtitleStyle: React.CSSProperties = {
    color: content.subtitleColor || '#ffffff',
    fontSize: content.subtitleSize || '1.25rem'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: content.buttonBgColor || 'hsl(var(--primary))',
    color: content.buttonTextColor || 'hsl(var(--primary-foreground))'
  };

  const handleButtonClick = () => {
    if (content.buttonLink) {
      window.open(content.buttonLink, '_blank');
    }
  };

  return (
    <div style={backgroundStyle}>
      <div style={overlayStyle} />
      <div style={contentStyle} className="container mx-auto text-center">
        <h1 style={titleStyle} className={`font-bold mb-6 ${getFontClass(content.titleFont)}`}>
          {content.title}
        </h1>
        <p style={subtitleStyle} className={`mb-8 max-w-2xl mx-auto ${getFontClass(content.subtitleFont)}`}>
          {content.subtitle}
        </p>
        {content.buttonText && (
          <Button
            size="lg"
            style={buttonStyle}
            onClick={handleButtonClick}
            className="shadow-lg hover:opacity-90 transition-opacity"
          >
            {content.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};
