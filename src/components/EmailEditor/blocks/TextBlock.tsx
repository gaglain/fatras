
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { TextBlockContent } from '../types';

interface TextBlockProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
}

export const TextBlock: React.FC<TextBlockProps> = ({ content, onChange }) => {
  return (
    <div>
      <Textarea
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Tapez votre texte ici..."
        style={{
          fontSize: content.fontSize,
          fontWeight: content.fontWeight,
          textAlign: content.textAlign,
          color: content.color,
          border: 'none',
          resize: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
};
