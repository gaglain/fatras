import React, { useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, Heading1, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight,
  Undo2, Redo2, Quote, Eraser,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
}

/**
 * Éditeur de texte enrichi style Word/WordPress pour notes & paroles.
 * Sortie : HTML (compatible affichage et conversion en texte brut pour PDF).
 */
export const SongRichTextEditor: React.FC<Props> = ({
  value,
  onChange,
  placeholder = 'Écrivez ici…',
  minHeight = 200,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  // Synchronise la valeur externe → DOM uniquement si différente (évite de casser le curseur)
  useEffect(() => {
    if (ref.current && value !== ref.current.innerHTML) {
      ref.current.innerHTML = value || '';
    }
  }, [value]);

  const exec = useCallback((cmd: string, val?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, val);
    if (ref.current) onChange(ref.current.innerHTML);
  }, [onChange]);

  const handleInput = () => {
    if (ref.current) onChange(ref.current.innerHTML);
  };

  const Btn = ({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      title={title}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn('h-8 w-8 p-0', active && 'bg-accent')}
    >
      {children}
    </Button>
  );

  return (
    <div className={cn('rounded-md border border-input bg-background', className)}>
      <div className="flex flex-wrap items-center gap-0.5 border-b border-input p-1">
        <Btn onClick={() => exec('undo')} title="Annuler"><Undo2 className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('redo')} title="Rétablir"><Redo2 className="h-4 w-4" /></Btn>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Btn onClick={() => exec('formatBlock', '<h1>')} title="Titre 1"><Heading1 className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<h2>')} title="Titre 2"><Heading2 className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<h3>')} title="Titre 3"><Heading3 className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<p>')} title="Paragraphe"><span className="text-xs font-semibold">P</span></Btn>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Btn onClick={() => exec('bold')} title="Gras"><Bold className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('italic')} title="Italique"><Italic className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('underline')} title="Souligné"><Underline className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('strikeThrough')} title="Barré"><Strikethrough className="h-4 w-4" /></Btn>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Btn onClick={() => exec('insertUnorderedList')} title="Liste à puces"><List className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('insertOrderedList')} title="Liste numérotée"><ListOrdered className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('formatBlock', '<blockquote>')} title="Citation"><Quote className="h-4 w-4" /></Btn>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Btn onClick={() => exec('justifyLeft')} title="Aligner à gauche"><AlignLeft className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('justifyCenter')} title="Centrer"><AlignCenter className="h-4 w-4" /></Btn>
        <Btn onClick={() => exec('justifyRight')} title="Aligner à droite"><AlignRight className="h-4 w-4" /></Btn>
        <Separator orientation="vertical" className="mx-1 h-6" />
        <Btn onClick={() => exec('removeFormat')} title="Effacer la mise en forme"><Eraser className="h-4 w-4" /></Btn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onBlur={handleInput}
        data-placeholder={placeholder}
        className={cn(
          'prose prose-sm max-w-none p-3 focus:outline-none',
          'text-foreground leading-relaxed',
          '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-2',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:my-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:my-1.5',
          '[&_ul]:list-disc [&_ul]:pl-6',
          '[&_ol]:list-decimal [&_ol]:pl-6',
          '[&_blockquote]:border-l-2 [&_blockquote]:border-primary [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
          '[&:empty]:before:content-[attr(data-placeholder)] [&:empty]:before:text-muted-foreground',
        )}
        style={{ minHeight }}
      />
    </div>
  );
};
