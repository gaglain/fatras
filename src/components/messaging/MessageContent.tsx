import React from 'react';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

/**
 * Renders message content with styled @mentions
 * Mentions are highlighted with a distinct background color
 */
export const MessageContent: React.FC<MessageContentProps> = ({ content, className }) => {
  // Match @Name patterns (names can include spaces until we hit another @ or end)
  const mentionRegex = /(@[\w\s]+?)(?=\s@|$|[.,!?;:])/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {content.substring(lastIndex, match.index)}
        </span>
      );
    }
    
    // Add the mention with simple white styling
    parts.push(
      <span 
        key={`mention-${match.index}`}
        className="text-white font-semibold"
      >
        {match[1]}
      </span>
    );
    
    lastIndex = match.index + match[1].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(
      <span key={`text-${lastIndex}`}>
        {content.substring(lastIndex)}
      </span>
    );
  }
  
  // If no mentions found, just return the content
  if (parts.length === 0) {
    return <span className={className}>{content}</span>;
  }
  
  return <span className={className}>{parts}</span>;
};
