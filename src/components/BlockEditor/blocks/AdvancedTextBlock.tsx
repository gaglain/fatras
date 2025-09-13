import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface TextBlockContent {
  content: string;
  alignment: 'left' | 'center' | 'right';
  fontSize: string;
  fontFamily: string;
  textColor: string;
  backgroundColor: string;
  padding: string;
  margin: string;
}

interface AdvancedTextBlockProps {
  content: TextBlockContent;
  onChange: (content: TextBlockContent) => void;
  isSelected?: boolean;
  previewMode?: boolean;
}

export const AdvancedTextBlock: React.FC<AdvancedTextBlockProps> = ({
  content,
  onChange,
  isSelected = false,
  previewMode = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleContentChange = (value: string) => {
    onChange({
      ...content,
      content: value
    });
  };

  const getAlignmentClass = () => {
    switch (content.alignment) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  const textClasses = cn(
    getAlignmentClass(),
    content.fontSize || 'text-base',
    content.fontFamily || 'font-sans',
    content.textColor || 'text-foreground',
    content.backgroundColor || 'bg-transparent',
    content.padding || 'p-4',
    content.margin || 'my-4'
  );

  if (previewMode || !isSelected) {
    return (
      <div 
        className={textClasses}
        onClick={() => !previewMode && setIsEditing(true)}
        style={{ cursor: !previewMode ? 'pointer' : 'default' }}
      >
        {content.content || 'Cliquez pour éditer le texte'}
      </div>
    );
  }

  if (isEditing) {
    return (
      <textarea
        className={cn(textClasses, 'border-2 border-primary resize-none min-h-[100px] w-full')}
        value={content.content}
        onChange={(e) => handleContentChange(e.target.value)}
        onBlur={() => setIsEditing(false)}
        autoFocus
        placeholder="Tapez votre texte ici..."
      />
    );
  }

  return (
    <div 
      className={cn(textClasses, 'border-2 border-dashed border-gray-300 cursor-pointer hover:border-primary')}
      onClick={() => setIsEditing(true)}
    >
      {content.content || 'Cliquez pour éditer le texte'}
    </div>
  );
};