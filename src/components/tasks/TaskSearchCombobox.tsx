import React from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTasks } from '@/hooks/useTasks';

interface TaskSearchComboboxProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export const TaskSearchCombobox: React.FC<TaskSearchComboboxProps> = ({
  value,
  onValueChange,
  placeholder = "Sélectionner une tâche..."
}) => {
  const [open, setOpen] = React.useState(false);
  const { tasks, loading } = useTasks();

  const tasksList = Array.isArray(tasks) ? tasks : [];
  const selectedTask = tasksList.find(t => t.id === value);

  if (loading) {
    return (
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between" type="button">
            Chargement...
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
      </Popover>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-left"
          type="button"
        >
          {selectedTask ? selectedTask.title : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent onOpenAutoFocus={(e) => e.preventDefault()} className="w-[400px] p-0 z-[9999]" align="start">
        <Command shouldFilter={true}>
          <CommandInput placeholder="Rechercher une tâche..." className="h-9" />
          <CommandList>
            <CommandEmpty>Aucune tâche trouvée.</CommandEmpty>
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
                Aucune tâche
              </CommandItem>
              {tasksList.map((task) => (
                <CommandItem
                  key={task.id}
                  value={`${task.title} ${task.description || ''}`}
                  onSelect={() => {
                    onValueChange(task.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === task.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{task.title}</span>
                    {task.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1">{task.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};