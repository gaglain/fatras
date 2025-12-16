import React from 'react';
import { Block, BlockStyle, ViewportMode } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check } from 'lucide-react';

interface BlockRendererProps {
  block: Block;
  viewport: ViewportMode;
}

const getPaddingClass = (padding?: string) => {
  switch (padding) {
    case 'none': return 'p-0';
    case 'sm': return 'p-4';
    case 'md': return 'p-6 md:p-8';
    case 'lg': return 'p-8 md:p-12';
    case 'xl': return 'p-12 md:p-16';
    default: return 'p-6';
  }
};

const getMarginClass = (margin?: string) => {
  switch (margin) {
    case 'none': return 'm-0';
    case 'sm': return 'my-2';
    case 'md': return 'my-4';
    case 'lg': return 'my-8';
    case 'xl': return 'my-12';
    default: return '';
  }
};

const getFontSizeClass = (size?: string) => {
  switch (size) {
    case 'sm': return 'text-sm';
    case 'base': return 'text-base';
    case 'lg': return 'text-lg';
    case 'xl': return 'text-xl';
    case '2xl': return 'text-2xl';
    case '3xl': return 'text-3xl';
    default: return 'text-base';
  }
};

const getTextAlignClass = (align?: string) => {
  switch (align) {
    case 'left': return 'text-left';
    case 'center': return 'text-center';
    case 'right': return 'text-right';
    default: return 'text-left';
  }
};

const getGapClass = (gap?: string) => {
  switch (gap) {
    case 'sm': return 'gap-2';
    case 'md': return 'gap-4';
    case 'lg': return 'gap-8';
    default: return 'gap-4';
  }
};

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, viewport }) => {
  const { content, style = {} } = block;
  const isMobile = viewport === 'mobile';
  const isTablet = viewport === 'tablet';

  const blockStyle: React.CSSProperties = {
    backgroundColor: style.backgroundColor || undefined,
    color: style.textColor || undefined,
  };

  const baseClasses = cn(
    getPaddingClass(style.padding),
    getMarginClass(style.margin),
    getTextAlignClass(style.textAlign),
    getFontSizeClass(style.fontSize),
    style.fontWeight && `font-${style.fontWeight}`
  );

  switch (block.type) {
    case 'hero':
      return (
        <div
          className={cn('relative bg-cover bg-center flex items-center justify-center', baseClasses)}
          style={{
            ...blockStyle,
            backgroundImage: `url(${content.backgroundImage})`,
            minHeight: isMobile ? '300px' : isTablet ? '400px' : '500px'
          }}
        >
          {content.overlay !== false && (
            <div 
              className="absolute inset-0 bg-black" 
              style={{ opacity: (content.overlayOpacity || 50) / 100 }}
            />
          )}
          <div className="relative z-10 text-center text-white max-w-3xl px-4">
            <h1 className={cn('font-bold mb-4', isMobile ? 'text-2xl' : 'text-4xl md:text-5xl')}>
              {content.title}
            </h1>
            <p className={cn('mb-6', isMobile ? 'text-base' : 'text-lg md:text-xl')}>
              {content.subtitle}
            </p>
            {content.buttonText && (
              <Button className="bg-white text-black hover:bg-gray-100">
                {content.buttonText}
              </Button>
            )}
          </div>
        </div>
      );

    case 'text':
      return (
        <div className={baseClasses} style={blockStyle}>
          <div className="max-w-4xl mx-auto whitespace-pre-wrap">
            {content.content}
          </div>
        </div>
      );

    case 'image':
      const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', full: 'w-full' };
      return (
        <div className={cn(baseClasses, 'flex justify-center')} style={blockStyle}>
          <img
            src={content.src}
            alt={content.alt}
            className={cn('h-auto rounded-lg', sizeMap[content.size as keyof typeof sizeMap] || 'max-w-md')}
          />
        </div>
      );

    case 'columns':
      const colsClass = isMobile ? 'grid-cols-1' : `grid-cols-${content.columns || 2}`;
      return (
        <div className={baseClasses} style={blockStyle}>
          <div className={cn('grid max-w-6xl mx-auto', colsClass, getGapClass(content.gap))}>
            {(content.items || []).map((item: any, i: number) => (
              <div key={i} className="p-4">
                {item.title && <h3 className="font-semibold text-lg mb-2">{item.title}</h3>}
                <p className="text-muted-foreground">{item.content}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'gallery':
      const galleryCols = isMobile ? 2 : content.columns || 3;
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-6 text-center">{content.title}</h2>
          )}
          <div 
            className={cn('grid gap-4 max-w-6xl mx-auto')}
            style={{ gridTemplateColumns: `repeat(${galleryCols}, 1fr)` }}
          >
            {(content.images || []).map((img: string, i: number) => (
              <img key={i} src={img} alt="" className="w-full h-48 object-cover rounded-lg" />
            ))}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.title}</h2>
          )}
          <div className={cn('grid gap-6 max-w-5xl mx-auto', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
            {(content.items || []).map((item: any, i: number) => (
              <div key={i} className="bg-background rounded-lg p-6 shadow-sm border">
                <p className="text-muted-foreground mb-4 italic">"{item.content}"</p>
                <div className="flex items-center gap-3">
                  {item.avatar && (
                    <img src={item.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                  )}
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case 'faq':
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-6 text-center">{content.title}</h2>
          )}
          <Accordion type="single" collapsible className="max-w-3xl mx-auto">
            {(content.items || []).map((item: any, i: number) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      );

    case 'pricing':
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.title}</h2>
          )}
          <div className={cn('grid gap-6 max-w-5xl mx-auto', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
            {(content.items || []).map((item: any, i: number) => (
              <div 
                key={i} 
                className={cn(
                  'rounded-xl p-6 border',
                  item.highlighted ? 'border-primary bg-primary/5 shadow-lg scale-105' : 'bg-background'
                )}
              >
                <h3 className="text-xl font-bold mb-2">{item.name}</h3>
                <p className="text-3xl font-bold mb-4">{item.price}</p>
                <ul className="space-y-2 mb-6">
                  {(item.features || []).map((f: string, j: number) => (
                    <li key={j} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className={cn('w-full', item.highlighted && 'bg-primary')}>
                  Choisir
                </Button>
              </div>
            ))}
          </div>
        </div>
      );

    case 'team':
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-8 text-center">{content.title}</h2>
          )}
          <div className={cn('grid gap-6 max-w-5xl mx-auto', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
            {(content.items || []).map((item: any, i: number) => (
              <div key={i} className="text-center">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
                />
                <h3 className="font-semibold text-lg">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-2">{item.role}</p>
                {item.bio && <p className="text-sm">{item.bio}</p>}
              </div>
            ))}
          </div>
        </div>
      );

    case 'counter':
      return (
        <div className={baseClasses} style={blockStyle}>
          <div className={cn('flex justify-center', isMobile ? 'flex-col gap-8' : 'gap-16')}>
            {(content.items || []).map((item: any, i: number) => (
              <div key={i} className="text-center">
                <p className={cn('font-bold', isMobile ? 'text-3xl' : 'text-4xl md:text-5xl')}>
                  {item.value}
                </p>
                <p className="text-sm uppercase tracking-wider mt-2 opacity-80">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      );

    case 'cta':
      return (
        <div className={cn(baseClasses, 'text-center')} style={blockStyle}>
          <h2 className={cn('font-bold mb-4', isMobile ? 'text-xl' : 'text-2xl md:text-3xl')}>
            {content.title}
          </h2>
          {content.subtitle && (
            <p className="mb-6 opacity-90">{content.subtitle}</p>
          )}
          {content.buttonText && (
            <Button size="lg" variant="secondary">
              {content.buttonText}
            </Button>
          )}
        </div>
      );

    case 'spacer':
      const heights = { sm: '20px', md: '40px', lg: '80px', xl: '120px' };
      return <div style={{ height: heights[content.height as keyof typeof heights] || '40px' }} />;

    case 'divider':
      return (
        <div className={baseClasses}>
          <hr className={cn('border-t', content.width === 'full' ? 'w-full' : 'w-1/2 mx-auto')} />
        </div>
      );

    case 'contact-form':
      return (
        <div className={baseClasses} style={blockStyle}>
          {content.title && (
            <h2 className="text-2xl font-bold mb-6 text-center">{content.title}</h2>
          )}
          <div className="max-w-md mx-auto space-y-4">
            <input 
              type="text" 
              placeholder="Nom" 
              className="w-full p-3 border rounded-lg"
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="w-full p-3 border rounded-lg"
            />
            <textarea 
              placeholder="Message" 
              rows={4} 
              className="w-full p-3 border rounded-lg"
            />
            <Button className="w-full">Envoyer</Button>
          </div>
        </div>
      );

    default:
      return (
        <div className={baseClasses} style={blockStyle}>
          <p className="text-muted-foreground">Bloc: {block.type}</p>
        </div>
      );
  }
};
