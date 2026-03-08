import React from 'react';
import { cn } from '@/lib/utils';

interface MentionRendererProps {
  content: string;
  className?: string;
}

/**
 * Renders text content with styled @mentions.
 * Supports both formats:
 * - @[DisplayName](user_id) — structured format from MentionableTextarea
 * - <span class="mention-tag" data-mention-id="..." data-mention-name="...">@Name</span> — HTML from RichTextEditor
 * - @Name — legacy simple format
 */
export const MentionRenderer: React.FC<MentionRendererProps> = ({ content, className }) => {
  if (!content) return null;

  // If content contains HTML mention tags, render as HTML
  if (content.includes('mention-tag') || content.includes('<')) {
    return (
      <span 
        className={className}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }

  // Handle @[Name](id) format
  const mentionRegex = /@\[([^\]]+)\]\([^)]+\)/g;
  if (mentionRegex.test(content)) {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    // Reset regex
    mentionRegex.lastIndex = 0;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>
        );
      }
      parts.push(
        <span
          key={`mention-${match.index}`}
          className="text-primary font-semibold bg-primary/10 px-1 rounded"
        >
          @{match[1]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    
    return <span className={className}>{parts}</span>;
  }

  // Fallback: simple @Name detection
  const simpleRegex = /(@[\w\s]+?)(?=\s@|$|[.,!?;:])/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = simpleRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>);
    }
    parts.push(
      <span key={`mention-${match.index}`} className="text-primary font-semibold">
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[1].length;
  }

  if (lastIndex < content.length) {
    parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
  }

  if (parts.length === 0) {
    return <span className={className}>{content}</span>;
  }

  return <span className={className}>{parts}</span>;
};
