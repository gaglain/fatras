import React from 'react';
import { cn } from '@/lib/utils';
import { Image } from 'lucide-react';

interface ImageBlockContent {
  src: string;
  alt: string;
  caption?: string;
  alignment: 'left' | 'center' | 'right';
  size: 'sm' | 'md' | 'lg' | 'full';
  borderRadius?: string;
  shadow?: string;
  margin?: string;
}

interface AdvancedImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
  isSelected?: boolean;
  previewMode?: boolean;
}

export const AdvancedImageBlock: React.FC<AdvancedImageBlockProps> = ({
  content,
  onChange,
  isSelected = false,
  previewMode = false
}) => {
  const getAlignmentClass = () => {
    switch (content.alignment) {
      case 'center': return 'mx-auto';
      case 'right': return 'ml-auto';
      default: return 'mr-auto';
    }
  };

  const getSizeClass = () => {
    switch (content.size) {
      case 'sm': return 'w-48';
      case 'lg': return 'w-full max-w-2xl';
      case 'full': return 'w-full';
      default: return 'w-full max-w-md';
    }
  };

  const containerClasses = cn(
    'flex',
    content.alignment === 'center' && 'justify-center',
    content.alignment === 'right' && 'justify-end',
    content.margin || 'my-4'
  );

  const imageClasses = cn(
    getSizeClass(),
    getAlignmentClass(),
    content.borderRadius || 'rounded-lg',
    content.shadow || 'shadow-md',
    'object-cover'
  );

  if (!content.src) {
    return (
      <div className={containerClasses}>
        <div className={cn(imageClasses, 'border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-48 bg-gray-50')}>
          <Image className="h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">Aucune image sélectionnée</p>
          <p className="text-gray-400 text-xs">Configurez l'URL dans le panneau de droite</p>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <figure className={getSizeClass()}>
        <img
          src={content.src}
          alt={content.alt}
          className={imageClasses}
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
        {content.caption && (
          <figcaption className="text-sm text-muted-foreground mt-2 text-center">
            {content.caption}
          </figcaption>
        )}
      </figure>
    </div>
  );
};