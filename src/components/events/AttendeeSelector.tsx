import { useState, useEffect } from 'react';
import { Check, X, User, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface AttendeeSelectorProps {
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
  disabled?: boolean;
}

export const AttendeeSelector = ({
  selectedEmails,
  onSelectionChange,
  disabled = false
}: AttendeeSelectorProps) => {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, user_id, first_name, last_name, email, avatar_url')
        .eq('is_active', true)
        .not('email', 'is', null)
        .order('first_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = (email: string) => {
    if (selectedEmails.includes(email)) {
      onSelectionChange(selectedEmails.filter(e => e !== email));
    } else {
      onSelectionChange([...selectedEmails, email]);
    }
  };

  const removeEmail = (email: string) => {
    onSelectionChange(selectedEmails.filter(e => e !== email));
  };

  const getUserDisplayName = (user: UserProfile) => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return user.email || 'Utilisateur';
  };

  const getSelectedUserName = (email: string) => {
    const user = users.find(u => u.email === email);
    return user ? getUserDisplayName(user) : email;
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="flex items-center gap-2">
              <User className="h-4 w-4" />
              {selectedEmails.length > 0
                ? `${selectedEmails.length} invité(s) sélectionné(s)`
                : 'Sélectionner des invités...'}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher un utilisateur..." />
            <CommandList>
              <CommandEmpty>
                {loading ? 'Chargement...' : 'Aucun utilisateur trouvé.'}
              </CommandEmpty>
              <CommandGroup heading="Utilisateurs">
                {users.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={`${user.first_name} ${user.last_name} ${user.email}`}
                    onSelect={() => user.email && toggleUser(user.email)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <div className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        selectedEmails.includes(user.email || '')
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground"
                      )}>
                        {selectedEmails.includes(user.email || '') && (
                          <Check className="h-3 w-3" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {getUserDisplayName(user)}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected attendees badges */}
      {selectedEmails.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedEmails.map((email) => (
            <Badge
              key={email}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="max-w-32 truncate">
                {getSelectedUserName(email)}
              </span>
              <button
                type="button"
                onClick={() => removeEmail(email)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
