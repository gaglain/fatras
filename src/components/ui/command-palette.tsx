import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Hash, Calendar, Users, MessageSquare, FileText, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <div
        className="relative group cursor-pointer"
        onClick={() => setOpen(true)}
      >
        <div className="flex items-center gap-2 px-3 py-2 text-sm bg-muted/50 hover:bg-muted transition-colors rounded-md border">
          <Search className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">Rechercher...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Tapez une commande ou recherchez..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/dashboard"))}
            >
              <Hash className="mr-2 h-4 w-4" />
              Dashboard
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/contacts"))}
            >
              <Users className="mr-2 h-4 w-4" />
              Contacts
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/events"))}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Événements
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/email-campaigns"))}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Campagnes Email
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate("/tasks"))}
            >
              <FileText className="mr-2 h-4 w-4" />
              Tâches
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="Thème">
            <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
              <span className="mr-2">☀️</span>
              Mode Clair
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
              <span className="mr-2">🌙</span>
              Mode Sombre
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
              <span className="mr-2">💻</span>
              Système
            </CommandItem>
          </CommandGroup>
          
          <CommandGroup heading="Réglages">
            <CommandItem
              onSelect={() => runCommand(() => navigate("/preferences"))}
            >
              <Settings className="mr-2 h-4 w-4" />
              Préférences
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}