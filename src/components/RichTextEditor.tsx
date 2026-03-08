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
  Image,
  AtSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileUpload } from '@/hooks/useFileUpload';
import { toast } from 'sonner';
import { MentionSuggestions } from '@/components/mentions/MentionSuggestions';
import { useMentionableUsers, MentionableUser } from '@/hooks/useMentionableUsers';

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
  const [isComposing, setIsComposing] = useState(false);
  
  // Mention state
  const { filterUsers } = useMentionableUsers();
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<MentionableUser[]>([]);
  const [mentionPosition, setMentionPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

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

  // Detect @mention in contentEditable
  const checkForMention = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) {
      setShowMentions(false);
      return;
    }

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) {
      setShowMentions(false);
      return;
    }

    const text = textNode.textContent || '';
    const cursorOffset = range.startOffset;
    const textBeforeCursor = text.substring(0, cursorOffset);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      const query = textBeforeCursor.substring(lastAtIndex + 1);
      if (query.length <= 30 && !/\n/.test(query)) {
        const filtered = filterUsers(query);
        if (filtered.length > 0) {
          // Get caret position for popup placement
          const tempRange = document.createRange();
          tempRange.setStart(textNode, lastAtIndex);
          tempRange.setEnd(textNode, cursorOffset);
          const rect = tempRange.getBoundingClientRect();
          const editorRect = editorRef.current?.getBoundingClientRect();
          
          if (editorRect) {
            setMentionPosition({
              top: rect.bottom - editorRect.top + 4,
              left: rect.left - editorRect.left,
            });
          }

          setMentionQuery(query);
          setMentionSuggestions(filtered);
          setShowMentions(true);
          return;
        }
      }
    }

    setShowMentions(false);
  }, [filterUsers]);

  const insertMentionInEditor = useCallback((user: MentionableUser) => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;
    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent || '';
    const cursorOffset = range.startOffset;
    const textBeforeCursor = text.substring(0, cursorOffset);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex < 0) return;

    // Create mention element
    const mentionEl = document.createElement('span');
    mentionEl.className = 'mention-tag';
    mentionEl.contentEditable = 'false';
    mentionEl.setAttribute('data-mention-id', user.user_id);
    mentionEl.setAttribute('data-mention-name', user.displayName);
    mentionEl.textContent = `@${user.displayName}`;
    mentionEl.style.cssText = 'color: hsl(var(--primary)); font-weight: 600; background: hsl(var(--primary) / 0.1); padding: 1px 4px; border-radius: 4px; cursor: default;';

    // Replace @query with mention element
    const beforeText = text.substring(0, lastAtIndex);
    const afterText = text.substring(cursorOffset);

    const parent = textNode.parentNode;
    if (!parent) return;

    // Create text nodes
    const beforeNode = document.createTextNode(beforeText);
    const afterNode = document.createTextNode('\u00A0' + afterText); // non-breaking space after mention

    parent.insertBefore(beforeNode, textNode);
    parent.insertBefore(mentionEl, textNode);
    parent.insertBefore(afterNode, textNode);
    parent.removeChild(textNode);

    // Set cursor after mention
    const newRange = document.createRange();
    newRange.setStart(afterNode, 1);
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    setShowMentions(false);

    // Update value
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const handleInput = useCallback(() => {
    if (isComposing) return;
    if (editorRef.current) {
      requestAnimationFrame(() => {
        if (editorRef.current) {
          onChange(editorRef.current.innerHTML);
          makeImagesResizable();
          checkForMention();
        }
      });
    }
  }, [onChange, makeImagesResizable, isComposing, checkForMention]);

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
      
      const img = `<img src="${result.url}" alt="${result.name}" style="max-width: 100%; height: auto;" />`;
      document.execCommand('insertHTML', false, img);
      
      if (editorRef.current) {
        onChange(editorRef.current.innerHTML);
        makeImagesResizable();
      }
    } catch {
      // Image upload failed - toast already shown by hook
    } finally {
      setImageUploading(false);
    }
  }, [uploadImage, onChange, makeImagesResizable]);

  const triggerMention = useCallback(() => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertText', false, '@');
    // Trigger mention check after inserting @
    setTimeout(() => checkForMention(), 10);
  }, [checkForMention]);

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

  React.useEffect(() => {
    if (!editorRef.current) return;
    if (!isComposing && editorRef.current.innerHTML !== (value || '')) {
      editorRef.current.innerHTML = value || '';
    }
    makeImagesResizable();
  }, [value, makeImagesResizable, isComposing]);

  return (
    <div className={cn("border border-border rounded-lg overflow-hidden bg-background relative", className)}>
      {/* Toolbar */}
      <div className="border-b border-border p-2 bg-background/50 backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-1">
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

          <div className="h-6 w-px bg-border mx-1" />

          {/* Mention button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={triggerMention}
            title="Mentionner un utilisateur (@)"
            className="h-8 w-8 p-1 hover:bg-accent transition-colors"
          >
            <AtSign className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={(e) => {
          // Handle mention navigation
          if (showMentions && mentionSuggestions.length > 0) {
            if (e.key === 'Escape') {
              e.preventDefault();
              setShowMentions(false);
              return;
            }
          }

          const anyEvent: any = e as any;
          if (anyEvent.isComposing || (e.nativeEvent as any).isComposing || isComposing) return;
          if (e.key === 'Enter' && !showMentions) {
            e.preventDefault();
            if (e.shiftKey) {
              document.execCommand('insertLineBreak');
            } else {
              document.execCommand('insertParagraph');
            }
            if (editorRef.current) {
              onChange(editorRef.current.innerHTML);
            }
          }
        }}
        onClick={() => {
          // Check mention on click position change
          setTimeout(() => checkForMention(), 10);
        }}
        className={cn(
          "min-h-[200px] p-4 outline-none text-sm leading-relaxed",
          "prose prose-sm max-w-none",
          "focus:bg-accent/5 transition-colors",
          "richtext-content",
          !value && "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
        data-placeholder={placeholder}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => {
          setIsComposing(false);
          if (editorRef.current) onChange(editorRef.current.innerHTML);
        }}
        style={{
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />

      {/* Mention suggestions dropdown */}
      {showMentions && mentionSuggestions.length > 0 && (
        <MentionSuggestions
          suggestions={mentionSuggestions}
          onSelect={insertMentionInEditor}
          onClose={() => setShowMentions(false)}
          style={{
            position: 'absolute',
            top: mentionPosition.top + 56, // offset for toolbar height
            left: mentionPosition.left,
          }}
        />
      )}
    </div>
  );
};
