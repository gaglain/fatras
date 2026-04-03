import React from 'react';
import DOMPurify from 'dompurify';
import { EmailBlock } from './emailBlockTypes';
import { Facebook, Instagram, Linkedin, Youtube, Share2, Image as ImageIcon } from 'lucide-react';

const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
  });
};

const extractYouTubeId = (url: string): string => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : '';
};

interface EmailBlockPreviewProps {
  block: EmailBlock;
}

export const EmailBlockPreview: React.FC<EmailBlockPreviewProps> = ({ block }) => {
  switch (block.type) {
    case 'text':
      return <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(block.content.html || '<p>Texte vide</p>') }} />;
    case 'heading':
      return (
        <div style={{ color: block.content.color, textAlign: block.content.align }}>
          {block.content.level === 'h1' && <h1 className="text-3xl font-bold">{block.content.text}</h1>}
          {block.content.level === 'h2' && <h2 className="text-2xl font-bold">{block.content.text}</h2>}
          {block.content.level === 'h3' && <h3 className="text-xl font-bold">{block.content.text}</h3>}
        </div>
      );
    case 'button':
      return (
        <div style={{ textAlign: block.content.align }}>
          <button style={{ backgroundColor: block.content.backgroundColor, color: block.content.textColor, borderRadius: `${block.content.borderRadius}px`, padding: '12px 24px', fontWeight: 'bold' }}>
            {block.content.text}
          </button>
        </div>
      );
    case 'image':
      return block.content.src ? (
        <div style={{ textAlign: block.content.align || 'center' }}>
          <img src={block.content.src} alt={block.content.alt} style={{ maxWidth: `${block.content.width || 100}%`, width: `${block.content.width || 100}%`, height: 'auto', display: 'inline-block' }} />
        </div>
      ) : (
        <div className="border-2 border-dashed rounded p-8 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Ajoutez une URL d'image</p>
        </div>
      );
    case 'video':
      return block.content.url ? (
        <div style={{ textAlign: block.content.align || 'center' }}>
          <div className="relative inline-block max-w-full">
            <img src={`https://img.youtube.com/vi/${extractYouTubeId(block.content.url)}/maxresdefault.jpg`} alt="Aperçu vidéo YouTube" className="max-w-full rounded"
              onError={(e) => { e.currentTarget.src = `https://img.youtube.com/vi/${extractYouTubeId(block.content.url)}/0.jpg`; }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-red-600 rounded-full p-4 shadow-lg">
                <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed rounded p-8 text-center text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2" /><p className="text-sm">Ajoutez une URL YouTube</p>
        </div>
      );
    case 'divider':
      return <hr style={{ borderColor: block.content.color, borderWidth: `${block.content.height}px` }} />;
    case 'spacer':
      return <div style={{ height: `${block.content.height}px` }} className="bg-muted/20" />;
    case 'social':
      return (
        <div style={{ textAlign: block.content.align || 'center' }}>
          <div className="inline-flex gap-3">
            {block.content.platforms?.filter((p: any) => p.enabled && p.url).map((platform: any, idx: number) => {
              const Icon = platform.type === 'facebook' ? Facebook : platform.type === 'instagram' ? Instagram : platform.type === 'linkedin' ? Linkedin : platform.type === 'youtube' ? Youtube : Share2;
              return (
                <a key={idx} href={platform.url || '#'} className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: platform.color || '#3498db' }} title={platform.type}>
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      );
    case 'columns':
      return (
        <div className="grid grid-cols-2 gap-4">
          {block.content.columns?.map((col: any, idx: number) => (
            <div key={idx} className="border-l-2 border-muted pl-4">
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(col.html || '<p>Colonne vide</p>') }} />
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
};
