
import React from 'react';
import { Input } from '@/components/ui/input';
import { ButtonBlockContent } from '../types';

interface ButtonBlockProps {
  content: ButtonBlockContent;
  onChange: (content: ButtonBlockContent) => void;
}

export const ButtonBlock: React.FC<ButtonBlockProps> = ({ content, onChange }) => {
  return (
    <div style={{ textAlign: content.alignment }}>
      <div
        style={{
          display: 'inline-block',
          backgroundColor: content.backgroundColor,
          color: content.textColor,
          padding: content.padding,
          borderRadius: content.borderRadius,
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
