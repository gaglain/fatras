
import React from 'react';
import { Input } from '@/components/ui/input';
import { ImageBlockContent } from '../types';

interface ImageBlockProps {
  content: ImageBlockContent;
  onChange: (content: ImageBlockContent) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({ content, onChange }) => {
  return (
    <div style={{ textAlign: content.alignment }}>
      {content.src ? (
        <img
          src={content.src}
          alt={content.alt}
          style={{
            maxWidth: `${content.width}%`,
            height: content.height || 'auto',
            display: 'inline-block'
          }}
        />
      ) : (
        <div className="border-2 border-dashed border-gray-300 p-8 text-center">
          <p className="text-gray-500 mb-2">Aucune image sélectionnée</p>
          <Input
            type="url"
            placeholder="URL de l'image"
            value={content.src}
            onChange={(e) => onChange({ ...content, src: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};
