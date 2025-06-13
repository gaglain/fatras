
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { EmailBlock, TextBlockContent, HeadingBlockContent, ButtonBlockContent, DividerBlockContent, SpacerBlockContent, ImageBlockContent } from './types';

interface EmailPreviewProps {
  blocks: EmailBlock[];
  onClose: () => void;
  onSave: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ blocks, onClose, onSave }) => {
  const renderBlockForPreview = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        const textContent = block.content as TextBlockContent;
        return (
          <p
            style={{
              fontSize: textContent.fontSize,
              fontWeight: textContent.bold ? 'bold' : 'normal',
              textAlign: textContent.alignment,
              color: textContent.color,
              margin: '10px 0',
              fontStyle: textContent.italic ? 'italic' : 'normal'
            }}
          >
            {textContent.text}
          </p>
        );
      case 'heading':
        const headingContent = block.content as HeadingBlockContent;
        const HeadingTag = `h${headingContent.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            style={{
              textAlign: headingContent.alignment,
              color: headingContent.color,
              margin: '20px 0 10px 0'
            }}
          >
            {headingContent.text}
          </HeadingTag>
        );
      case 'image':
        const imageContent = block.content as ImageBlockContent;
        return imageContent.src ? (
          <div style={{ textAlign: imageContent.alignment, margin: '10px 0' }}>
            <img
              src={imageContent.src}
              alt={imageContent.alt}
              style={{
                maxWidth: `${imageContent.width}%`,
                height: imageContent.height || 'auto',
                borderRadius: imageContent.borderRadius ? `${imageContent.borderRadius}px` : '0'
              }}
            />
          </div>
        ) : null;
      case 'button':
        const buttonContent = block.content as ButtonBlockContent;
        const paddingStyle = typeof buttonContent.padding === 'string' 
          ? buttonContent.padding 
          : `${buttonContent.padding.top}px ${buttonContent.padding.right}px ${buttonContent.padding.bottom}px ${buttonContent.padding.left}px`;
        
        return (
          <div style={{ textAlign: buttonContent.alignment, margin: '20px 0' }}>
            <a
              href={buttonContent.url || buttonContent.link}
              style={{
                display: 'inline-block',
                backgroundColor: buttonContent.backgroundColor,
                color: buttonContent.textColor,
                padding: paddingStyle,
                borderRadius: `${buttonContent.borderRadius}px`,
                textDecoration: 'none'
              }}
            >
              {buttonContent.text}
            </a>
          </div>
        );
      case 'spacer':
        const spacerContent = block.content as SpacerBlockContent;
        return <div style={{ height: spacerContent.height, margin: '5px 0' }} />;
      case 'divider':
        const dividerContent = block.content as DividerBlockContent;
        return (
          <hr
            style={{
              border: 'none',
              borderTop: `${dividerContent.thickness}px ${dividerContent.style} ${dividerContent.color}`,
              margin: '20px 0'
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-6">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'éditeur
          </Button>
          <Button onClick={onSave} className="bg-purple-600 hover:bg-purple-700">
            <Send className="h-4 w-4 mr-2" />
            Utiliser ce design
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Aperçu de l'email</CardTitle>
          </CardHeader>
          <CardContent className="bg-white" style={{ fontFamily: 'Arial, sans-serif' }}>
            {blocks.map((block) => (
              <div key={block.id}>
                {renderBlockForPreview(block)}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
