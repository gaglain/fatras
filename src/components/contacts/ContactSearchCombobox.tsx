import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContacts } from '@/hooks/useContacts';

interface ContactSearchComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const ContactSearchCombobox: React.FC<ContactSearchComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Sélectionner un contact..."
}) => {
  const [open, setOpen] = React.useState(false);
  const { contacts } = useContacts();

  const contactsList = contacts || [];
  const selectedContact = contactsList.find(c => c.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedContact
            ? `${selectedContact.first_name} ${selectedContact.last_name}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher un contact..." />
          <CommandEmpty>Aucun contact trouvé.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            <CommandItem
              value=""
              onSelect={() => {
                onValueChange("");
                setOpen(false);
              }}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  !value ? "opacity-100" : "opacity-0"
                )}
              />
              Aucun contact
            </CommandItem>
            {contactsList.map((contact) => (
              <CommandItem
                key={contact.id}
                value={`${contact.first_name} ${contact.last_name} ${contact.email}`}
                onSelect={() => {
                  onValueChange(contact.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === contact.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{contact.first_name} {contact.last_name}</span>
                  {contact.email && (
                    <span className="text-xs text-muted-foreground">{contact.email}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
