
import React from 'react';
import { Input } from '@/components/ui/input';
import { ButtonBlockContent } from '../types';

interface ButtonBlockProps {
  content: ButtonBlockContent;
  onChange: (content: ButtonBlockContent) => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ content, onChange }) => {
  const paddingStyle = typeof content.padding === 'string' 
    ? content.padding 
    : `${content.padding.top}px ${content.padding.right}px ${content.padding.bottom}px ${content.padding.left}px`;

  return (
    <div style={{ textAlign: content.align }}>
      <div
        style={{
          display: 'inline-block',
          backgroundColor: content.backgroundColor,
          color: content.textColor,
          padding: paddingStyle,
          borderRadius: `${content.borderRadius}px`,
          textDecoration: 'none',
          cursor: 'pointer'
        }}
      >
        <Input
          value={content.text}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Texte du bouton"
          style={{
            border: 'none',
            background: 'transparent',
            color: content.textColor,
            textAlign: 'center',
            padding: 0
          }}
        />
      </div>
    </div>
  );
};
