
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Facebook, Instagram, Linkedin, Youtube } from 'lucide-react';

interface EmailPreviewProps {
  blocks: any[];
  onClose: () => void;
  onSave: () => void;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ blocks, onClose, onSave }) => {
  const renderBlockForPreview = (block: any) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            style={{ margin: '10px 0' }}
            dangerouslySetInnerHTML={{ __html: block.content.html || '' }}
          />
        );
      case 'heading':
        const HeadingTag = block.content.level || 'h1';
        return React.createElement(
          HeadingTag,
          {
            style: {
              textAlign: block.content.align || 'left',
              color: block.content.color || '#000000',
              margin: '20px 0 10px 0'
            }
          },
          block.content.text
        );
      case 'image':
        return block.content.src ? (
          <div style={{ textAlign: block.content.align || 'center', margin: '10px 0' }}>
            <img
              src={block.content.src}
              alt={block.content.alt || ''}
              style={{
                maxWidth: `${block.content.width || 100}%`,
                width: `${block.content.width || 100}%`,
                height: 'auto',
                borderRadius: block.content.borderRadius ? `${block.content.borderRadius}px` : '0'
              }}
            />
          </div>
        ) : null;
      case 'button':
        return (
          <div style={{ textAlign: block.content.align || 'center', margin: '20px 0' }}>
            <a
              href={block.content.url || '#'}
              style={{
                display: 'inline-block',
                backgroundColor: block.content.backgroundColor || '#2563EB',
                color: block.content.textColor || '#FFFFFF',
                padding: '12px 24px',
                borderRadius: `${block.content.borderRadius || 6}px`,
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              {block.content.text}
            </a>
          </div>
        );
      case 'spacer':
        return <div style={{ height: block.content.height || 40, margin: '5px 0' }} />;
      case 'divider':
        return (
          <hr
            style={{
              border: 'none',
              borderTop: `${block.content.height || 1}px solid ${block.content.color || '#E5E7EB'}`,
              margin: '20px 0'
            }}
          />
        );
      case 'social':
        return (
          <div style={{ textAlign: block.content.align || 'center', margin: '20px 0' }}>
            <div style={{ display: 'inline-flex', gap: 12 }}>
              {block.content.platforms
                ?.filter((platform: any) => platform.url && platform.enabled !== false && platform.type !== 'twitter')
                .map((platform: any, idx: number) => {
                  const Icon = platform.type === 'facebook' ? Facebook :
                               platform.type === 'instagram' ? Instagram :
                               platform.type === 'linkedin' ? Linkedin :
                               platform.type === 'youtube' ? Youtube : null;
                  if (!Icon) return null;
                  return (
                    <a
                      key={idx}
                      href={platform.url}
                      style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 40, height: 40, borderRadius: '50%',
                        backgroundColor: platform.color || '#3498db', color: '#fff', textDecoration: 'none'
                      }}
                    >
                      <Icon size={18} />
                    </a>
                  );
                })}
            </div>
          </div>
        );
      case 'video':
        if (!block.content?.url) return null;
        const match = (block.content.url as string).match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
        const videoId = match && match[2].length === 11 ? match[2] : '';
        if (!videoId) return null;
        return (
          <div style={{ textAlign: block.content.align || 'center', margin: '20px 0' }}>
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Aperçu vidéo YouTube"
              style={{ maxWidth: '100%', borderRadius: 8 }}
              onError={(e: any) => { e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/0.jpg`; }}
            />
          </div>
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
