import { useState } from 'react';
import { Search, User, Calendar, CheckSquare, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useContacts } from '@/hooks/useContacts';
import { useEvents } from '@/hooks/useEvents';
import { useTasks } from '@/hooks/useTasks';
import { useCentralizedData } from '@/hooks/useCentralizedData';

export type UniversalType = 'contact' | 'event' | 'task' | 'artist';

export interface SearchItem {
  id: string;
  type: UniversalType;
  title: string;
  subtitle: string;
  external_id?: string;
  data: any;
}

interface UniversalSearchProps {
  onSelect?: (item: SearchItem) => void;
  placeholder?: string;
  allowMultiple?: boolean;
  selectedItems?: SearchItem[];
  onSelectionChange?: (items: SearchItem[]) => void;
  triggerText?: string;
  filterTypes?: UniversalType[];
  selectedId?: string;
}

export const UniversalSearch = ({
  onSelect,
  placeholder = 'Rechercher contacts, événements, tâches ou spectacles...',
  allowMultiple = false,
  selectedItems = [],
  onSelectionChange,
  triggerText = 'Rechercher',
  filterTypes = ['contact', 'event'],
  selectedId
}: UniversalSearchProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [internalSelection, setInternalSelection] = useState<SearchItem[]>(selectedItems);

  const { contacts } = useContacts();
  const { events } = useEvents();
  const { tasks } = useTasks();
  const { artists } = useCentralizedData();

  // Construire les éléments recherchables selon les types demandés
  const searchItems: SearchItem[] = [
    // Contacts
    ...(filterTypes.includes('contact')
      ? contacts.map((contact) => ({
          id: contact.id,
          type: 'contact' as const,
          title: `${contact.first_name} ${contact.last_name}`.trim(),
          subtitle: contact.email || contact.position || 'Contact',
          external_id: (contact as any).external_id,
          data: contact,
        }))
      : []),
    // Événements
    ...(filterTypes.includes('event')
      ? events.map((event) => ({
          id: event.id,
          type: 'event' as const,
          title: event.title,
          subtitle: event.venue || (event as any).city || 'Événement',
          external_id: (event as any).external_id,
          data: event,
        }))
      : []),
    // Tâches
    ...(filterTypes.includes('task')
      ? (Array.isArray(tasks) ? tasks : []).map((task: any) => ({
          id: task.id,
          type: 'task' as const,
          title: task.title,
          subtitle: task.description || 'Tâche',
          data: task,
        }))
      : []),
    // Spectacles (artistes)
    ...(filterTypes.includes('artist')
      ? (Array.isArray(artists) ? artists : []).map((artist: any) => ({
          id: artist.id,
          type: 'artist' as const,
          title: artist.name,
          subtitle: artist.genre || 'Spectacle',
          data: artist,
        }))
      : []),
  ];

  // Filtrer par terme de recherche
  const filteredItems = searchItems.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.subtitle.toLowerCase().includes(searchLower) ||
      (item.external_id && item.external_id.toLowerCase().includes(searchLower))
    );
  });

  const handleSelect = (item: SearchItem) => {
    if (allowMultiple) {
      const newSelection = internalSelection.find((s) => s.id === item.id)
        ? internalSelection.filter((s) => s.id !== item.id)
        : [...internalSelection, item];

      setInternalSelection(newSelection);
      onSelectionChange?.(newSelection);
    } else {
      onSelect?.(item);
      setOpen(false);
    }
  };

  const removeSelected = (itemId: string) => {
    const newSelection = internalSelection.filter((item) => item.id !== itemId);
    setInternalSelection(newSelection);
    onSelectionChange?.(newSelection);
  };

  const getIcon = (type: UniversalType) => {
    switch (type) {
      case 'contact':
        return <User className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'task':
        return <CheckSquare className="h-4 w-4" />;
      case 'artist':
        return <Sparkles className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTypeColor = (type: UniversalType) => {
    switch (type) {
      case 'contact':
        return 'bg-blue-100 text-blue-800';
      case 'event':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-amber-100 text-amber-800';
      case 'artist':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-muted text-foreground';
    }
  };

  const getTypeLabel = (type: UniversalType) => {
    switch (type) {
      case 'contact':
        return 'Contact';
      case 'event':
        return 'Événement';
      case 'task':
        return 'Tâche';
      case 'artist':
        return 'Spectacle';
      default:
        return '';
    }
  };

  // Trouver l'élément sélectionné pour l'afficher dans le bouton
  const selectedItem = selectedId ? searchItems.find(item => item.id === selectedId) : null;

  return (
    <div className="space-y-2">
      {/* Éléments sélectionnés */}
      {allowMultiple && internalSelection.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {internalSelection.map((item) => (
            <Badge key={item.id} variant="secondary" className="flex items-center gap-1 pr-1">
              {getIcon(item.type)}
              <span>{item.external_id && `${item.external_id} - `}{item.title}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeSelected(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Déclencheur de recherche */}
      <Dialog open={open} onOpenChange={setOpen} modal={false}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left">
            <Search className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className={selectedItem ? 'text-foreground' : 'text-muted-foreground'}>
              {selectedItem ? (
                <>
                  {selectedItem.external_id && <span className="text-muted-foreground mr-1">{selectedItem.external_id}</span>}
                  {selectedItem.title}
                </>
              ) : (
                triggerText
              )}
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[640px]">
          <DialogHeader>
            <DialogTitle>Recherche universelle</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>

            {/* Résultats */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Aucun résultat trouvé' : 'Tapez pour rechercher'}
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors ${
                      allowMultiple && internalSelection.find((s) => s.id === item.id)
                        ? 'bg-accent border-primary'
                        : 'border-border'
                    }`}
                    onClick={() => handleSelect(item)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getTypeColor(item.type)}`}>
                          {getIcon(item.type)}
                        </div>
                        <div>
                          <div className="font-medium">
                            {item.external_id && (
                              <span className="text-sm text-muted-foreground mr-2">{item.external_id}</span>
                            )}
                            {item.title}
                          </div>
                          <div className="text-sm text-muted-foreground">{item.subtitle}</div>
                        </div>
                      </div>

                      <Badge variant="secondary" className="capitalize">
                        {getTypeLabel(item.type)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Actions */}
            {allowMultiple && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
