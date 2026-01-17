import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface User {
  user_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;
  avatar_url?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  users: User[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MentionInput: React.FC<MentionInputProps> = ({
  value,
  onChange,
  onKeyDown,
  users,
  placeholder,
  className,
  disabled
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const getUserDisplayName = (user: User) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
    return fullName || user.username || user.email?.split('@')[0] || 'Utilisateur';
  };

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    onChange(newValue);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex >= 0) {
      // Check if there's no space between @ and cursor
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      if (!/\s/.test(textAfterAt)) {
        setMentionStart(lastAtIndex);
        setMentionQuery(textAfterAt.toLowerCase());
        
        const filtered = users.filter(user => {
          const displayName = getUserDisplayName(user).toLowerCase();
          const username = (user.username || '').toLowerCase();
          const email = (user.email || '').toLowerCase();
          return displayName.includes(textAfterAt.toLowerCase()) ||
                 username.includes(textAfterAt.toLowerCase()) ||
                 email.includes(textAfterAt.toLowerCase());
        }).slice(0, 5);
        
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowSuggestions(false);
    setMentionStart(-1);
    setMentionQuery('');
  }, [onChange, users]);

  const insertMention = useCallback((user: User) => {
    if (mentionStart < 0) return;
    
    const displayName = getUserDisplayName(user);
    const beforeMention = value.substring(0, mentionStart);
    const afterMention = value.substring(mentionStart + mentionQuery.length + 1);
    
    // Insert mention with a special format: @[Name](user_id)
    const newValue = `${beforeMention}@${displayName} ${afterMention}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionStart(-1);
    setMentionQuery('');
    
    // Focus back to input
    setTimeout(() => {
      inputRef.current?.focus();
      const newCursorPos = beforeMention.length + displayName.length + 2;
      inputRef.current?.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }, [mentionStart, mentionQuery, value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
        return;
      }
    }
    
    onKeyDown?.(e);
  }, [showSuggestions, suggestions, selectedIndex, insertMention, onKeyDown]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-1 bg-popover border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.user_id}
              type="button"
              className={cn(
                "w-full px-3 py-2 flex items-center gap-2 text-left text-sm hover:bg-accent transition-colors",
                index === selectedIndex && "bg-accent"
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
                <p className="font-medium truncate">{getUserDisplayName(user)}</p>
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

// Utility function to extract mentioned user IDs from a message
export const extractMentions = (content: string, users: User[]): string[] => {
  const mentionedIds: string[] = [];
  
  // Match @Name patterns
  const mentionRegex = /@([\w\s]+?)(?=\s|$|@)/g;
  let match;
  
  while ((match = mentionRegex.exec(content)) !== null) {
    const mentionedName = match[1].trim().toLowerCase();
    
    const matchedUser = users.find(user => {
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim().toLowerCase();
      const username = (user.username || '').toLowerCase();
      return fullName === mentionedName || username === mentionedName;
    });
    
    if (matchedUser && !mentionedIds.includes(matchedUser.user_id)) {
      mentionedIds.push(matchedUser.user_id);
    }
  }
  
  return mentionedIds;
};
