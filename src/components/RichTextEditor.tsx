import React, { useRef, useCallback, useState } from 'react';
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
  Type,
  Image
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';

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
  const { uploadImage, isUploading } = useFileUpload();
  const [imageUploading, setImageUploading] = useState(false);

  const execCommand = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const makeImagesResizable = useCallback(() => {
    if (!editorRef.current) return;
    
    const images = editorRef.current.querySelectorAll('img');
    images.forEach((img) => {
      if (!img.hasAttribute('data-resizable')) {
        img.setAttribute('data-resizable', 'true');
        img.style.cursor = 'nwse-resize';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        
        let isResizing = false;
        let startX = 0;
        let startWidth = 0;

        const onMouseDown = (e: MouseEvent) => {
          e.preventDefault();
          isResizing = true;
          startX = e.clientX;
          startWidth = img.offsetWidth;
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const diff = e.clientX - startX;
          const newWidth = Math.max(50, Math.min(startWidth + diff, editorRef.current?.offsetWidth || 800));
          img.style.width = `${newWidth}px`;
        };

        const onMouseUp = () => {
          isResizing = false;
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', onMouseUp);
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        };

        img.addEventListener('mousedown', onMouseDown);
      }
    });
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
      makeImagesResizable();
    }
  }, [onChange, makeImagesResizable]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    setImageUploading(true);
    try {
      const result = await uploadImage(file);
      
      // Insérer l'image dans l'éditeur
      const img = `<img src="${result.url}" alt="${result.name}" style="max-width: 100%; height: auto;" />`;
      document.execCommand('insertHTML', false, img);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        makeImagesResizable();
      }
    } catch (error) {
      console.error('Image upload error:', error);
    } finally {
      setImageUploading(false);
    }
  }, [uploadImage, onChange, makeImagesResizable]);

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

  // Initialize resizable images on mount and when value changes
  React.useEffect(() => {
    makeImagesResizable();
  }, [value, makeImagesResizable]);

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

          <div className="h-6 w-px bg-border mx-1" />

          {/* Image upload */}
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => document.getElementById('image-upload')?.click()}
            disabled={imageUploading}
            title="Insérer une image"
            className="h-8 w-8 p-1 hover:bg-accent transition-colors"
          >
            <Image className="h-3.5 w-3.5" />
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
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '<br><br>');
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
          }
        }}
        className={cn(
          "min-h-[200px] p-4 outline-none text-sm leading-relaxed",
          "prose prose-sm max-w-none",
          "focus:bg-accent/5 transition-colors",
          "richtext-content",
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