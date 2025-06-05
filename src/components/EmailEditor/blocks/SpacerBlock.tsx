
import React from 'react';
import { SpacerBlockContent } from '../types';

interface SpacerBlockProps {
  content: SpacerBlockContent;
  onChange: (content: SpacerBlockContent) => void;
}

export const SpacerBlock: React.FC<SpacerBlockProps> = ({ content }) => {
  return (
    <div
      style={{ height: content.height }}
      className="border border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm"
    >
      Espacement ({content.height}px)
    </div>
  );
};
