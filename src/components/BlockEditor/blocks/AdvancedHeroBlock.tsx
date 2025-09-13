import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface HeroBlockContent {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor: string;
  buttonText?: string;
  buttonLink?: string;
  titleColor: string;
  subtitleColor: string;
  titleFont: string;
  titleSize: string;
  overlayOpacity: number;
  height: string;
  padding: string;
}

interface AdvancedHeroBlockProps {
  content: HeroBlockContent;
  onChange: (content: HeroBlockContent) => void;
  isSelected?: boolean;
  previewMode?: boolean;
}

export const AdvancedHeroBlock: React.FC<AdvancedHeroBlockProps> = ({
  content,
  onChange,
  isSelected = false,
  previewMode = false
}) => {
  const heroStyle = {
    backgroundImage: content.backgroundImage ? `url(${content.backgroundImage})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative' as const
  };

  const overlayStyle = {
    backgroundColor: `rgba(0, 0, 0, ${content.overlayOpacity / 100})`,
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  };

  return (
    <div 
      className={cn(
        'relative flex items-center justify-center',
        content.backgroundColor || 'bg-primary',
        content.height || 'h-96',
        content.padding || 'p-8'
      )}
      style={heroStyle}
    >
      {content.backgroundImage && content.overlayOpacity > 0 && (
        <div style={overlayStyle} />
      )}
      
      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <h1 className={cn(
          content.titleSize || 'text-4xl',
          content.titleFont || 'font-bold',
          content.titleColor || 'text-white',
          'mb-4'
        )}>
          {content.title}
        </h1>
        
        {content.subtitle && (
          <p className={cn(
            'text-lg mb-6',
            content.subtitleColor || 'text-white/90'
          )}>
            {content.subtitle}
          </p>
        )}
        
        {content.buttonText && (
          <Button 
            size="lg"
            className="bg-white text-primary hover:bg-white/90"
            onClick={() => content.buttonLink && window.open(content.buttonLink, '_blank')}
          >
            {content.buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};