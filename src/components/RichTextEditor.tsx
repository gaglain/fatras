import React, { useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Link,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Tapez votre message...",
  className
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const formatButtons = [
    { icon: Bold, command: 'bold', tooltip: 'Gras' },
    { icon: Italic, command: 'italic', tooltip: 'Italique' },
    { icon: Underline, command: 'underline', tooltip: 'Souligné' },
    { icon: List, command: 'insertUnorderedList', tooltip: 'Liste à puces' },
    { icon: ListOrdered, command: 'insertOrderedList', tooltip: 'Liste numérotée' },
    { icon: AlignLeft, command: 'justifyLeft', tooltip: 'Aligner à gauche' },
    { icon: AlignCenter, command: 'justifyCenter', tooltip: 'Centrer' },
    { icon: AlignRight, command: 'justifyRight', tooltip: 'Aligner à droite' },
  ];

  const fontSizes = ['12px', '14px', '16px', '18px', '20px', '24px'];

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b border-border p-2 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1">
          {/* Format buttons */}
          {formatButtons.map(({ icon: Icon, command, tooltip }) => (
            <Button
              key={command}
              variant="ghost"
              size="sm"
              onClick={() => execCommand(command)}
              title={tooltip}
              className="h-8 w-8 p-1 hover:bg-accent transition-colors"
            >
              <Icon className="h-3.5 w-3.5" />
            </Button>
          ))}
          
          <div className="h-6 w-px bg-border mx-1" />
          
          {/* Font size */}
          <select
            className="text-xs border border-border rounded px-2 py-1 bg-background"
            onChange={(e) => execCommand('fontSize', e.target.value)}
            defaultValue="3"
          >
            {fontSizes.map((size, index) => (
              <option key={size} value={index + 1}>
                {size}
              </option>
            ))}
          </select>
          
          <div className="h-6 w-px bg-border mx-1" />
          
          {/* Link button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Entrez l\'URL du lien:');
              if (url) execCommand('createLink', url);
            }}
            title="Insérer un lien"
            className="h-8 w-8 p-1 hover:bg-accent transition-colors"
          >
            <Link className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        dangerouslySetInnerHTML={{ __html: value }}
        className={cn(
          "min-h-[200px] p-4 outline-none text-sm leading-relaxed",
          "prose prose-sm max-w-none",
          "focus:bg-accent/5 transition-colors",
          !value && "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />
    </div>
  );
};