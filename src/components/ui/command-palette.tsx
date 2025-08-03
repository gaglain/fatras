import * as React from "react";
import { useEffect, useState } from "react";
import { Search, Hash, Calendar, Users, MessageSquare, FileText, Settings, Contact, Music, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useContacts } from "@/hooks/useContacts";
import { useEvents } from "@/hooks/useEvents";
import { useTasks } from "@/hooks/useTasks";
import { useArtists } from "@/hooks/useArtists";

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
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { setTheme } = useTheme();
  
  const { contacts = [] } = useContacts();
  const { events = [] } = useEvents();
  const { tasks = [] } = useTasks();
  const { artists = [] } = useArtists();
  
  // Filter data based on search
  const filteredContacts = contacts.filter(contact => 
    contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
  
  const filteredEvents = events.filter(event =>
    event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
  
  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);
  
  const filteredArtists = artists.filter(artist =>
    artist.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.show_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

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
        <CommandInput 
          placeholder="Tapez une commande ou recherchez..." 
          value={searchTerm}
          onValueChange={setSearchTerm}
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          {/* Search Results */}
          {searchTerm && (
            <>
              {filteredContacts.length > 0 && (
                <CommandGroup heading="Contacts">
                  {filteredContacts.map((contact) => (
                    <CommandItem
                      key={contact.id}
                      onSelect={() => runCommand(() => navigate(`/contacts`))}
                    >
                      <Contact className="mr-2 h-4 w-4" />
                      {contact.first_name} {contact.last_name}
                      {contact.email && <span className="ml-2 text-muted-foreground text-xs">({contact.email})</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {filteredEvents.length > 0 && (
                <CommandGroup heading="Événements">
                  {filteredEvents.map((event) => (
                    <CommandItem
                      key={event.id}
                      onSelect={() => runCommand(() => navigate(`/events`))}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {event.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {filteredTasks.length > 0 && (
                <CommandGroup heading="Tâches">
                  {filteredTasks.map((task) => (
                    <CommandItem
                      key={task.id}
                      onSelect={() => runCommand(() => navigate(`/tasks`))}
                    >
                      <CheckSquare className="mr-2 h-4 w-4" />
                      {task.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {filteredArtists.length > 0 && (
                <CommandGroup heading="Artistes">
                  {filteredArtists.map((artist) => (
                    <CommandItem
                      key={artist.id}
                      onSelect={() => runCommand(() => navigate(`/artists`))}
                    >
                      <Music className="mr-2 h-4 w-4" />
                      {artist.first_name} {artist.last_name}
                      {artist.show_name && <span className="ml-2 text-muted-foreground text-xs">({artist.show_name})</span>}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </>
          )}
          
          {/* Default Navigation */}
          {!searchTerm && (
            <>
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
                <CommandItem
                  onSelect={() => runCommand(() => navigate("/artists"))}
                >
                  <Music className="mr-2 h-4 w-4" />
                  Artistes
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
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}