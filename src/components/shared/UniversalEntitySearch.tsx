import React, { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Plus, 
  User, 
  Target, 
  Calendar, 
  CheckSquare,
  Music,
  FileText,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type EntityType = 'contact' | 'opportunity' | 'event' | 'task' | 'artist' | 'quote' | 'email';

interface Entity {
  id: string;
  type: EntityType;
  title: string;
  subtitle?: string;
  status?: string;
  date?: string;
}

interface UniversalEntitySearchProps {
  entityTypes: EntityType[];
  excludeIds?: string[];
  onSelect: (entity: Entity) => void;
  placeholder?: string;
  className?: string;
}

const entityIcons: Record<EntityType, React.ComponentType<any>> = {
  contact: User,
  opportunity: Target,
  event: Calendar,
  task: CheckSquare,
  artist: Music,
  quote: FileText,
  email: Mail,
};

const entityLabels: Record<EntityType, string> = {
  contact: 'Contact',
  opportunity: 'Opportunité',
  event: 'Événement',
  task: 'Tâche',
  artist: 'Artiste',
  quote: 'Devis',
  email: 'Email',
};

const entityColors: Record<EntityType, string> = {
  contact: 'bg-blue-100 text-blue-800',
  opportunity: 'bg-green-100 text-green-800',
  event: 'bg-orange-100 text-orange-800',
  task: 'bg-purple-100 text-purple-800',
  artist: 'bg-pink-100 text-pink-800',
  quote: 'bg-yellow-100 text-yellow-800',
  email: 'bg-gray-100 text-gray-800',
};

export const UniversalEntitySearch: React.FC<UniversalEntitySearchProps> = ({
  entityTypes,
  excludeIds = [],
  onSelect,
  placeholder = 'Rechercher...',
  className = ''
}) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    const searchEntities = async () => {
      if (!user) return;
      setLoading(true);

      try {
        const allResults: Entity[] = [];

        // Search contacts
        if (entityTypes.includes('contact')) {
          const { data: contacts } = await supabase
            .from('contacts')
            .select('id, first_name, last_name, company, email')
            .eq('user_id', user.id)
            .or(`first_name.ilike.%${searchQuery}%,last_name.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
            .limit(10);

          contacts?.forEach(c => {
            if (!excludeIds.includes(c.id)) {
              allResults.push({
                id: c.id,
                type: 'contact',
                title: `${c.first_name} ${c.last_name}`,
                subtitle: c.company || c.email || undefined,
              });
            }
          });
        }

        // Search opportunities
        if (entityTypes.includes('opportunity')) {
          const { data: opportunities } = await supabase
            .from('opportunities')
            .select('id, title, status, venue, date')
            .eq('user_id', user.id)
            .ilike('title', `%${searchQuery}%`)
            .limit(10);

          opportunities?.forEach(o => {
            if (!excludeIds.includes(o.id)) {
              allResults.push({
                id: o.id,
                type: 'opportunity',
                title: o.title,
                subtitle: o.venue || undefined,
                status: o.status,
                date: o.date || undefined,
              });
            }
          });
        }

        // Search events
        if (entityTypes.includes('event')) {
          const { data: events } = await supabase
            .from('events')
            .select('id, title, status, venue, city, start_date')
            .eq('user_id', user.id)
            .or(`title.ilike.%${searchQuery}%,venue.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
            .limit(10);

          events?.forEach(e => {
            if (!excludeIds.includes(e.id)) {
              allResults.push({
                id: e.id,
                type: 'event',
                title: e.title,
                subtitle: e.venue ? `${e.venue}${e.city ? `, ${e.city}` : ''}` : undefined,
                status: e.status || undefined,
                date: e.start_date || undefined,
              });
            }
          });
        }

        // Search tasks
        if (entityTypes.includes('task')) {
          const { data: tasks } = await supabase
            .from('tasks')
            .select('id, title, status, due_date')
            .eq('user_id', user.id)
            .ilike('title', `%${searchQuery}%`)
            .limit(10);

          tasks?.forEach(t => {
            if (!excludeIds.includes(t.id)) {
              allResults.push({
                id: t.id,
                type: 'task',
                title: t.title,
                status: t.status,
                date: t.due_date || undefined,
              });
            }
          });
        }

        // Search artists
        if (entityTypes.includes('artist')) {
          const { data: artists } = await supabase
            .from('centralized_artists')
            .select('id, name, genre, status')
            .eq('user_id', user.id)
            .or(`name.ilike.%${searchQuery}%,genre.ilike.%${searchQuery}%`)
            .limit(10);

          artists?.forEach(a => {
            if (!excludeIds.includes(a.id)) {
              allResults.push({
                id: a.id,
                type: 'artist',
                title: a.name,
                subtitle: a.genre,
                status: a.status,
              });
            }
          });
        }

        // Search quotes
        if (entityTypes.includes('quote')) {
          const { data: quotes } = await supabase
            .from('quotes')
            .select('id, title, quote_number, status, total_amount')
            .eq('user_id', user.id)
            .or(`title.ilike.%${searchQuery}%,quote_number.ilike.%${searchQuery}%`)
            .limit(10);

          quotes?.forEach(q => {
            if (!excludeIds.includes(q.id)) {
              allResults.push({
                id: q.id,
                type: 'quote',
                title: q.title,
                subtitle: `${q.quote_number} - ${q.total_amount?.toLocaleString()}€`,
                status: q.status || undefined,
              });
            }
          });
        }

        setResults(allResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchEntities, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, user, entityTypes, excludeIds]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Recherche en cours...
        </div>
      )}

      {!loading && searchQuery.length >= 2 && results.length === 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Aucun résultat trouvé
        </div>
      )}

      {results.length > 0 && (
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {results.map((entity) => {
              const Icon = entityIcons[entity.type];
              return (
                <Card 
                  key={`${entity.type}-${entity.id}`}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelect(entity)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={`p-2 rounded-full ${entityColors[entity.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{entity.title}</p>
                          {entity.subtitle && (
                            <p className="text-xs text-muted-foreground truncate">{entity.subtitle}</p>
                          )}
                          {entity.date && (
                            <p className="text-xs text-muted-foreground">{formatDate(entity.date)}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {entityLabels[entity.type]}
                        </Badge>
                        <Button size="sm" variant="ghost">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}

      {searchQuery.length < 2 && searchQuery.length > 0 && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Tapez au moins 2 caractères pour rechercher
        </div>
      )}
    </div>
  );
};
