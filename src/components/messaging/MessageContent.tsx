import React from 'react';
import { cn } from '@/lib/utils';

interface MessageContentProps {
  content: string;
  className?: string;
}

/**
 * Renders message content with styled @mentions.
 * Supports both unified @[Name](id) format and legacy @Name format.
 * Mentions are displayed in white bold (matching chat aesthetic).
 */
export const MessageContent: React.FC<MessageContentProps> = ({ content, className }) => {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  // First try structured @[Name](id) format
  const structuredRegex = /@\[([^\]]+)\]\([^)]+\)/g;
  let match;
  let hasStructured = false;

  while ((match = structuredRegex.exec(content)) !== null) {
    hasStructured = true;
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>
      );
    }
    parts.push(
      <span
        key={`mention-${match.index}`}
        className="text-white font-semibold"
      >
        @{match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (hasStructured) {
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
    }
    return <span className={className}>{parts}</span>;
  }

  // Fallback: legacy @Name patterns
  const mentionRegex = /(@[\w\s]+?)(?=\s@|$|[.,!?;:])/g;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}`}>{content.substring(lastIndex, match.index)}</span>
      );
    }
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

  if (lastIndex < content.length) {
    parts.push(<span key={`text-${lastIndex}`}>{content.substring(lastIndex)}</span>);
  }

  if (parts.length === 0) {
    return <span className={className}>{content}</span>;
  }

  return <span className={className}>{parts}</span>;
};
