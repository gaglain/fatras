import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { MentionableUser } from '@/hooks/useMentionableUsers';

interface MentionSuggestionsProps {
  suggestions: MentionableUser[];
  onSelect: (user: MentionableUser) => void;
  onClose: () => void;
  style?: React.CSSProperties;
  className?: string;
}

export const MentionSuggestions: React.FC<MentionSuggestionsProps> = ({
  suggestions,
  onSelect,
  onClose,
  style,
  className,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Reset index when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        onSelect(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, [suggestions, selectedIndex, onSelect, onClose]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        'z-50 w-72 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto',
        className
      )}
    >
      {suggestions.map((user, index) => (
        <button
          key={user.user_id}
          type="button"
          className={cn(
            'w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-accent transition-colors',
            index === selectedIndex && 'bg-accent'
          )}
          onClick={() => onSelect(user)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          <Avatar className="h-6 w-6">
            {user.avatar_url && <AvatarImage src={user.avatar_url} />}
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {(user.first_name?.[0] || user.email?.[0] || 'U').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{user.displayName}</p>
            {user.email && (
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
