import React, { useEffect, useState } from 'react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class', 'src', 'alt', 'width', 'height'],
  });
};

interface EmailPreviewProps {
  blocks: any[];
  onClose: () => void;
  onSave: () => void;
  includeSignature?: boolean;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({ blocks, onClose, onSave, includeSignature }) => {
  const [signature, setSignature] = useState<string>('');

  useEffect(() => {
    if (!includeSignature) { setSignature(''); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('email_signature')
        .eq('user_id', user.id)
        .maybeSingle();
      setSignature((data as any)?.email_signature?.trim() || '');
    })();
  }, [includeSignature]);
  const renderBlockForPreview = (block: any) => {
    switch (block.type) {
      case 'text':
        return (
          <div
            style={{ margin: '10px 0' }}
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content.html || '') }}
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
        // Use PNG icons to match email client rendering (Gmail blocks inline SVG)
        const socialIconUrls: Record<string, string> = {
          facebook: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/facebook.png',
          instagram: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/instagram.png',
          linkedin: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/linkedin.png',
          youtube: 'https://raw.githubusercontent.com/encharm/Font-Awesome-SVG-PNG/master/white/png/32/youtube.png'
        };

        return (
          <div style={{ textAlign: block.content.align || 'center', margin: '20px 0' }}>
            <div style={{ display: 'inline-flex', gap: 12 }}>
              {block.content.platforms
                ?.filter((platform: any) => platform.url && platform.enabled !== false && socialIconUrls[platform.type])
                .map((platform: any, idx: number) => (
                  <a
                    key={idx}
                    href={platform.url}
                    style={{ display: 'inline-flex', textDecoration: 'none', lineHeight: 0 }}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        backgroundColor: platform.color || '#3498db',
                        borderRadius: 9999,
                        padding: 8
                      }}
                    >
                      <img
                        src={socialIconUrls[platform.type]}
                        alt={platform.type}
                        width={20}
                        height={20}
                        style={{ display: 'block', border: 0, outline: 'none' }}
                      />
                    </span>
                  </a>
                ))}
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
            {includeSignature && signature && (
              <div
                style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #eee', fontSize: 14, color: '#333' }}
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(signature) }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
