import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { HeroEditorTabs } from './HeroEditorTabs';

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

const getFontClass = (font?: string) => {
  const fontMap: Record<string, string> = { sans: 'font-sans', roboto: 'font-roboto', opensans: 'font-opensans' };
  return fontMap[font || 'sans'] || 'font-sans';
};

const getWeightClass = (weight?: string) => {
  const weightMap: Record<string, string> = { normal: 'font-normal', medium: 'font-medium', semibold: 'font-semibold', bold: 'font-bold' };
  return weightMap[weight || 'bold'] || 'font-bold';
};

const getAnimationClass = (animation?: string) => {
  switch (animation) {
    case 'fade': return 'animate-fade-in';
    case 'slide-up': return 'animate-slide-up';
    case 'slide-down': return 'animate-slide-down';
    case 'zoom': return 'animate-scale-in';
    default: return '';
  }
};

export const AdvancedHeroBlock: React.FC<AdvancedHeroBlockProps> = ({ content, onChange, isSelected, previewMode }) => {
  if (isSelected && !previewMode) {
    return (
      <Card className="p-6 space-y-6">
        <HeroEditorTabs content={content} onChange={onChange} />
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

  const maxWidthClass = content.textAlign === 'center' ? 'mx-auto' : content.textAlign === 'right' ? 'ml-auto' : '';

  return (
    <div style={backgroundStyle}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: `rgba(0, 0, 0, ${content.overlayOpacity || 0.3})` }} />
      <div style={{ position: 'relative', zIndex: 1, padding: content.padding || '4rem 1rem', textAlign: content.textAlign || 'center', width: '100%' }} className={`container mx-auto ${getAnimationClass(content.animation)}`}>
        <h1 style={{ color: content.titleColor || '#ffffff', fontSize: content.titleSize || '3rem' }} className={`mb-6 ${getFontClass(content.titleFont)} ${getWeightClass(content.titleWeight)}`}>
          {content.title}
        </h1>
        <p style={{ color: content.subtitleColor || '#ffffff', fontSize: content.subtitleSize || '1.25rem' }} className={`mb-8 max-w-2xl ${maxWidthClass} ${getFontClass(content.subtitleFont)} ${getWeightClass(content.subtitleWeight)}`}>
          {content.subtitle}
        </p>
        {content.showButton !== false && content.buttonText && (
          <Button
            size={content.buttonSize || 'lg'}
            style={{ backgroundColor: content.buttonBgColor || 'hsl(var(--primary))', color: content.buttonTextColor || 'hsl(var(--primary-foreground))', borderRadius: content.buttonBorderRadius || '0.375rem' }}
            onClick={() => content.buttonLink && window.open(content.buttonLink, '_blank')}
            className="shadow-lg hover:opacity-90 transition-opacity"
          >
            {content.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};
