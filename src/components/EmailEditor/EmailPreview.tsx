import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';

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
        // Fonction helper pour générer les SVG inline des logos
        const renderSocialLogo = (type: string) => {
          const svgPaths = {
            facebook: 'M22 12a10 10 0 1 0-11.56 9.9v-7h-2.2V12h2.2V9.8c0-2.17 1.29-3.37 3.27-3.37.95 0 1.94.17 1.94.17v2.13h-1.09c-1.07 0-1.41.66-1.41 1.34V12h2.4l-.38 2.9h-2.02v7A10 10 0 0 0 22 12z',
            instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 5a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm6-1.25a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5zM12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z',
            linkedin: 'M4.98 3.5C4.98 4.61 4.1 5.5 3 5.5S1.02 4.61 1.02 3.5C1.02 2.39 1.9 1.5 3 1.5s1.98.89 1.98 2zM1 8h4v13H1zM9 8h3.8v1.8h.05c.53-1 1.84-2.05 3.78-2.05 4.04 0 4.79 2.66 4.79 6.12V21H17v-5.3c0-1.27-.02-2.91-1.77-2.91-1.77 0-2.04 1.38-2.04 2.82V21H9z',
            youtube: 'M23.5 7.2a3 3 0 0 0-2.1-2.1C19.5 4.5 12 4.5 12 4.5s-7.5 0-9.4.6A3 3 0 0 0 .5 7.2C0 9.1 0 12 0 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z'
          } as const;
          
          const path = svgPaths[type as keyof typeof svgPaths];
          if (!path) return '';
          
          return `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="display:block"><path d="${path}"/></svg>`;
        };

        return (
          <div style={{ textAlign: block.content.align || 'center', margin: '20px 0' }}>
            <div style={{ display: 'inline-flex', gap: 12 }}>
              {block.content.platforms
                ?.filter((platform: any) => platform.url && platform.enabled !== false)
                .map((platform: any, idx: number) => {
                  const logo = renderSocialLogo(platform.type);
                  if (!logo) return null;
                  
                  return (
                    <a
                      key={idx}
                      href={platform.url}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: platform.color || '#000',
                        textDecoration: 'none',
                        lineHeight: 0
                      }}
                      dangerouslySetInnerHTML={{ __html: logo }}
                    />
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
