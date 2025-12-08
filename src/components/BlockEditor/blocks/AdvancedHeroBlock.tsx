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
import { Switch } from '@/components/ui/switch';

export interface HeroBlockContent {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  buttonText?: string;
  buttonLink?: string;
  showButton?: boolean;
  titleColor?: string;
  subtitleColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
  buttonBorderRadius?: string;
  buttonSize?: 'sm' | 'default' | 'lg';
  titleFont?: 'sans' | 'serif' | 'playfair' | 'roboto' | 'opensans';
  subtitleFont?: 'sans' | 'serif' | 'playfair' | 'roboto' | 'opensans';
  titleSize?: string;
  subtitleSize?: string;
  overlayOpacity?: number;
  height?: string;
  padding?: string;
  textAlign?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'center' | 'bottom';
  titleWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  subtitleWeight?: 'normal' | 'medium' | 'semibold' | 'bold';
  animation?: 'none' | 'fade' | 'slide-up' | 'slide-down' | 'zoom';
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

const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'medium', label: 'Medium' },
  { value: 'semibold', label: 'Semi-bold' },
  { value: 'bold', label: 'Gras' }
];

const ANIMATIONS = [
  { value: 'none', label: 'Aucune' },
  { value: 'fade', label: 'Fondu' },
  { value: 'slide-up', label: 'Glissement vers le haut' },
  { value: 'slide-down', label: 'Glissement vers le bas' },
  { value: 'zoom', label: 'Zoom' }
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="background">Fond</TabsTrigger>
            <TabsTrigger value="typography">Typographie</TabsTrigger>
            <TabsTrigger value="button">Bouton</TabsTrigger>
            <TabsTrigger value="layout">Disposition</TabsTrigger>
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
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Graisse du titre</Label>
                <Select
                  value={content.titleWeight || 'bold'}
                  onValueChange={(value) => onChange({ ...content, titleWeight: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                <Label>Graisse du sous-titre</Label>
                <Select
                  value={content.subtitleWeight || 'normal'}
                  onValueChange={(value) => onChange({ ...content, subtitleWeight: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map((w) => (
                      <SelectItem key={w.value} value={w.value}>
                        {w.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </TabsContent>

          <TabsContent value="button" className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <Label htmlFor="show-button" className="cursor-pointer">Afficher le bouton</Label>
              <Switch
                id="show-button"
                checked={content.showButton !== false}
                onCheckedChange={(checked) => onChange({ ...content, showButton: checked })}
              />
            </div>

            {content.showButton !== false && (
              <>
                <div className="grid grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Couleur de fond</Label>
                    <Input
                      type="color"
                      value={content.buttonBgColor || '#1a1f2e'}
                      onChange={(e) => onChange({ ...content, buttonBgColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label>Couleur du texte</Label>
                    <Input
                      type="color"
                      value={content.buttonTextColor || '#ffffff'}
                      onChange={(e) => onChange({ ...content, buttonTextColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Taille du bouton</Label>
                    <Select
                      value={content.buttonSize || 'lg'}
                      onValueChange={(value) => onChange({ ...content, buttonSize: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sm">Petit</SelectItem>
                        <SelectItem value="default">Moyen</SelectItem>
                        <SelectItem value="lg">Grand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Arrondi des coins</Label>
                    <Input
                      value={content.buttonBorderRadius || '0.375rem'}
                      onChange={(e) => onChange({ ...content, buttonBorderRadius: e.target.value })}
                      placeholder="0.375rem, 9999px, etc."
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="layout" className="space-y-4">
            <div>
              <Label>Alignement horizontal</Label>
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

            <div>
              <Label>Alignement vertical</Label>
              <Select
                value={content.verticalAlign || 'center'}
                onValueChange={(value) => onChange({ ...content, verticalAlign: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Haut</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="bottom">Bas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Padding</Label>
              <Input
                value={content.padding || '4rem 1rem'}
                onChange={(e) => onChange({ ...content, padding: e.target.value })}
                placeholder="4rem 1rem, 2rem, etc."
              />
            </div>

            <div>
              <Label>Animation d'entrée</Label>
              <Select
                value={content.animation || 'none'}
                onValueChange={(value) => onChange({ ...content, animation: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ANIMATIONS.map((anim) => (
                    <SelectItem key={anim.value} value={anim.value}>
                      {anim.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
    position: 'relative',
    display: 'flex',
    alignItems: content.verticalAlign === 'top' ? 'flex-start' : content.verticalAlign === 'bottom' ? 'flex-end' : 'center'
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, ' + (content.overlayOpacity || 0.3) + ')'
  };

  const contentStyle: React.CSSProperties = {
    position: 'relative',
    zIndex: 1,
    padding: content.padding || '4rem 1rem',
    textAlign: content.textAlign || 'center',
    width: '100%'
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

  const getWeightClass = (weight?: string) => {
    const weightMap: Record<string, string> = {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold'
    };
    return weightMap[weight || 'bold'] || 'font-bold';
  };

  const getAnimationClass = () => {
    switch (content.animation) {
      case 'fade': return 'animate-fade-in';
      case 'slide-up': return 'animate-slide-up';
      case 'slide-down': return 'animate-slide-down';
      case 'zoom': return 'animate-scale-in';
      default: return '';
    }
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
    color: content.buttonTextColor || 'hsl(var(--primary-foreground))',
    borderRadius: content.buttonBorderRadius || '0.375rem'
  };

  const handleButtonClick = () => {
    if (content.buttonLink) {
      window.open(content.buttonLink, '_blank');
    }
  };

  const alignmentClass = content.textAlign === 'left' ? 'text-left' : content.textAlign === 'right' ? 'text-right' : 'text-center';
  const maxWidthClass = content.textAlign === 'center' ? 'mx-auto' : content.textAlign === 'right' ? 'ml-auto' : '';

  return (
    <div style={backgroundStyle}>
      <div style={overlayStyle} />
      <div style={contentStyle} className={`container mx-auto ${getAnimationClass()}`}>
        <h1 
          style={titleStyle} 
          className={`mb-6 ${getFontClass(content.titleFont)} ${getWeightClass(content.titleWeight)}`}
        >
          {content.title}
        </h1>
        <p 
          style={subtitleStyle} 
          className={`mb-8 max-w-2xl ${maxWidthClass} ${getFontClass(content.subtitleFont)} ${getWeightClass(content.subtitleWeight)}`}
        >
          {content.subtitle}
        </p>
        {content.showButton !== false && content.buttonText && (
          <Button
            size={content.buttonSize || 'lg'}
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
