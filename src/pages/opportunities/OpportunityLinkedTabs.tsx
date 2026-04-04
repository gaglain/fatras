import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, MapPin, User, CheckSquare, Target, Mail, Building, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface LinkedContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string | null;
}

interface LinkedEvent {
  id: string;
  title: string;
  start_date: string | null;
  venue: string | null;
  city: string | null;
  status: string | null;
}

interface LinkedTask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  priority: string | null;
}

interface LinkedArtist {
  id: string;
  name: string;
  genre: string;
  image: string | null;
}

const getEventStatusLabel = (status: string | null) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'option': return 'Option';
    case 'confirmed': return 'Confirmé';
    case 'cancelled': return 'Annulé';
    case 'completed': return 'Terminé';
    default: return status || 'Non défini';
  }
};

const getTaskStatusLabel = (status: string | null) => {
  switch (status) {
    case 'todo': return 'À faire';
    case 'in_progress': return 'En cours';
    case 'done': return 'Terminé';
    default: return status || 'Non défini';
  }
};

interface OpportunityLinkedTabsProps {
  type: 'contacts' | 'events' | 'artists' | 'tasks';
  contacts?: LinkedContact[];
  events?: LinkedEvent[];
  artists?: LinkedArtist[];
  tasks?: LinkedTask[];
}

export const OpportunityLinkedTab: React.FC<OpportunityLinkedTabsProps> = ({ type, contacts = [], events = [], artists = [], tasks = [] }) => {
  const navigate = useNavigate();

  if (type === 'contacts') {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Contacts liés ({contacts.length})</CardTitle></CardHeader>
        <CardContent>
          {contacts.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Aucun contact lié</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate(`/contacts/${contact.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{contact.first_name[0]}{contact.last_name[0]}</AvatarFallback></Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{contact.first_name} {contact.last_name}</p>
                        {contact.company && <p className="text-sm text-muted-foreground flex items-center gap-1 truncate"><Building className="h-3 w-3" />{contact.company}</p>}
                        {contact.email && <p className="text-xs text-muted-foreground flex items-center gap-1 truncate"><Mail className="h-3 w-3" />{contact.email}</p>}
                        {contact.role && <Badge variant="secondary" className="mt-1 text-xs">{contact.role}</Badge>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'events') {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Événements liés ({events.length})</CardTitle></CardHeader>
        <CardContent>
          {events.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Aucun événement lié</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate(`/events/${event.id}`)}>
                  <CardContent className="p-4">
                    <h4 className="font-medium truncate">{event.title}</h4>
                    <Badge className="mt-2 text-xs">{getEventStatusLabel(event.status)}</Badge>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      {event.start_date && <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(event.start_date), 'dd/MM/yyyy', { locale: fr })}</p>}
                      {event.venue && <p className="flex items-center gap-1 truncate"><MapPin className="h-3 w-3" />{event.venue}{event.city ? ` - ${event.city}` : ''}</p>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (type === 'artists') {
    return (
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" />Artistes liés ({artists.length})</CardTitle></CardHeader>
        <CardContent>
          {artists.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Aucun artiste lié</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {artists.map((artist) => (
                <Card key={artist.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate(`/artists/${artist.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        {artist.image ? <img src={artist.image} alt={artist.name} className="object-cover" /> : <AvatarFallback className="bg-primary/10 text-primary">{artist.name.slice(0, 2).toUpperCase()}</AvatarFallback>}
                      </Avatar>
                      <div><p className="font-medium">{artist.name}</p><p className="text-sm text-muted-foreground">{artist.genre}</p></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // tasks
  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><CheckSquare className="h-5 w-5" />Tâches liées ({tasks.length})</CardTitle></CardHeader>
      <CardContent>
        {tasks.length === 0 ? <p className="text-sm text-muted-foreground text-center py-8">Aucune tâche liée</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <Card key={task.id} className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={() => navigate('/tasks')}>
                <CardContent className="p-4">
                  <h4 className="font-medium truncate">{task.title}</h4>
                  <Badge className="mt-2 text-xs">{getTaskStatusLabel(task.status)}</Badge>
                  {task.due_date && <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}</p>}
                  {task.priority && <Badge variant="outline" className="mt-1 text-xs">{task.priority}</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
