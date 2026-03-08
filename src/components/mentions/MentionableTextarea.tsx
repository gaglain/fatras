import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMentionableUsers, MentionableUser } from '@/hooks/useMentionableUsers';

interface MentionableTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

/**
 * Universal textarea with @mention autocomplete.
 * Stores mentions as @[DisplayName](user_id) in the value.
 * Features: debounced search, smart dropdown positioning.
 */
export const MentionableTextarea: React.FC<MentionableTextareaProps> = ({
  value,
  onChange,
  placeholder,
  className,
  rows = 4,
  disabled,
}) => {
  const { filterUsers } = useMentionableUsers();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<MentionableUser[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(-1);
  const [mentionQuery, setMentionQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Compute dropdown position based on available space
  const updateDropdownPosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    setDropdownPosition(spaceBelow < 220 ? 'top' : 'bottom');
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart || 0;
    onChange(newValue);

    // Detect @mention trigger
    const textBefore = newValue.substring(0, cursorPos);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt >= 0) {
      const query = textBefore.substring(lastAt + 1);
      if (query.length <= 30 && !/\n/.test(query)) {
        setMentionStart(lastAt);
        setMentionQuery(query);

        // Debounced filtering (150ms)
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          const filtered = filterUsers(query);
          setSuggestions(filtered);
          setShowSuggestions(filtered.length > 0);
          setSelectedIndex(0);
          updateDropdownPosition();
        }, 150);
        return;
      }
    }

    setShowSuggestions(false);
    setMentionStart(-1);
  }, [onChange, filterUsers, updateDropdownPosition]);

  const insertMention = useCallback((user: MentionableUser) => {
    if (mentionStart < 0) return;

    const before = value.substring(0, mentionStart);
    const cursorPos = textareaRef.current?.selectionStart || mentionStart + mentionQuery.length + 1;
    const after = value.substring(cursorPos);

    // Insert as @[DisplayName](user_id)
    const mention = `@[${user.displayName}](${user.user_id})`;
    const newValue = `${before}${mention} ${after}`;

    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(-1);
    setMentionQuery('');

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = before.length + mention.length + 1;
        textareaRef.current.setSelectionRange(newPos, newPos);
        textareaRef.current.focus();
      }
    }, 0);
  }, [mentionStart, mentionQuery, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setShowSuggestions(false);
    }
  }, [showSuggestions, suggestions, selectedIndex, insertMention]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Display value: render @[Name](id) as @Name for display
  const displayValue = useMemo(
    () => value.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1'),
    [value]
  );

  return (
    <div className="relative" ref={containerRef}>
      <Textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        rows={rows}
        disabled={disabled}
      />

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className={cn(
            "absolute z-50 w-72 bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto",
            dropdownPosition === 'bottom' ? 'mt-1 top-full' : 'mb-1 bottom-full'
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
              onClick={() => insertMention(user)}
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
      )}
    </div>
  );
};
