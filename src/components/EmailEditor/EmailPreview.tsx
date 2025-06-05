
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { EmailBlock } from './types';

interface EmailPreviewProps {
  blocks: EmailBlock[];
  onClose: () => void;
  onSave: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ blocks, onClose, onSave }) => {
  const renderBlockForPreview = (block: EmailBlock) => {
    switch (block.type) {
      case 'text':
        return (
          <p
            style={{
              fontSize: block.content.fontSize,
              fontWeight: block.content.fontWeight,
              textAlign: block.content.textAlign,
              color: block.content.color,
              margin: '10px 0'
            }}
          >
            {block.content.text}
          </p>
        );
      case 'heading':
        const HeadingTag = `h${block.content.level}` as keyof JSX.IntrinsicElements;
        return (
          <HeadingTag
            style={{
              textAlign: block.content.textAlign,
              color: block.content.color,
              margin: '20px 0 10px 0'
            }}
          >
            {block.content.text}
          </HeadingTag>
        );
      case 'image':
        return block.content.src ? (
          <div style={{ textAlign: block.content.alignment, margin: '10px 0' }}>
            <img
              src={block.content.src}
              alt={block.content.alt}
              style={{
                maxWidth: `${block.content.width}%`,
                height: block.content.height || 'auto'
              }}
            />
          </div>
        ) : null;
      case 'button':
        return (
          <div style={{ textAlign: block.content.alignment, margin: '20px 0' }}>
            <a
              href={block.content.link}
              style={{
                display: 'inline-block',
                backgroundColor: block.content.backgroundColor,
                color: block.content.textColor,
                padding: block.content.padding,
                borderRadius: block.content.borderRadius,
                textDecoration: 'none'
              }}
            >
              {block.content.text}
            </a>
          </div>
        );
      case 'spacer':
        return <div style={{ height: block.content.height, margin: '5px 0' }} />;
      case 'divider':
        return (
          <hr
            style={{
              border: 'none',
              borderTop: `${block.content.thickness}px ${block.content.style} ${block.content.color}`,
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
