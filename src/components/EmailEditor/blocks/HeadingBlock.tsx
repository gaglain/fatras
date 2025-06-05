
import React from 'react';
import { Input } from '@/components/ui/input';
import { HeadingBlockContent } from '../types';

interface HeadingBlockProps {
  content: HeadingBlockContent;
  onChange: (content: HeadingBlockContent) => void;
}

export const HeadingBlock: React.FC<HeadingBlockProps> = ({ content, onChange }) => {
  const HeadingTag = `h${content.level}` as keyof JSX.IntrinsicElements;

  return (
    <HeadingTag
      style={{
        textAlign: content.textAlign,
        color: content.color,
        margin: 0,
        padding: 0
      }}
    >
      <Input
        value={content.text}
        onChange={(e) => onChange({ ...content, text: e.target.value })}
        placeholder="Votre titre"
        style={{
          border: 'none',
          background: 'transparent',
          fontSize: 'inherit',
          fontWeight: 'inherit',
          textAlign: content.textAlign,
          color: content.color,
          padding: 0
        }}
      />
    </HeadingTag>
  );
};
