import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEvents } from '@/hooks/useEvents';

interface EventSearchComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const EventSearchCombobox: React.FC<EventSearchComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Sélectionner un événement..."
}) => {
  const [open, setOpen] = React.useState(false);
  const { events, loading } = useEvents();

  const eventsList = Array.isArray(events) ? events : [];
  const selectedEvent = eventsList.find(e => e.id === value);

  if (loading) {
    return (
      <Button variant="outline" disabled className="w-full justify-between">
        Chargement...
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedEvent ? selectedEvent.title : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Rechercher un événement..." />
          <CommandEmpty>Aucun événement trouvé.</CommandEmpty>
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
              Aucun événement
            </CommandItem>
            {eventsList.map((event) => (
              <CommandItem
                key={event.id}
                value={`${event.title} ${event.venue || ''} ${event.city || ''}`}
                onSelect={() => {
                  onValueChange(event.id);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === event.id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div className="flex flex-col">
                  <span>{event.title}</span>
                  {(event.venue || event.city) && (
                    <span className="text-xs text-muted-foreground">
                      {[event.venue, event.city].filter(Boolean).join(' - ')}
                    </span>
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
