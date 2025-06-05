
import React from 'react';
import { DividerBlockContent } from '../types';

interface DividerBlockProps {
  content: DividerBlockContent;
  onChange: (content: DividerBlockContent) => void;
}

export const DividerBlock: React.FC<DividerBlockProps> = ({ content }) => {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `${content.thickness}px ${content.style} ${content.color}`,
        margin: '10px 0'
      }}
    />
  );
};
