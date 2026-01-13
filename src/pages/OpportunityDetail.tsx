import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Edit, 
  User, 
  History, 
  Mail,
  Phone,
  Building,
  Target,
  CheckSquare,
  DollarSign,
  Clock,
  Percent,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Owner {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
}

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

interface Opportunity {
  id: string;
  title: string;
  description: string | null;
  venue: string | null;
  location: string | null;
  date: string | null;
  budget: number | null;
  probability_percentage: number | null;
  status: string | null;
  deadline: string | null;
  requirements: string | null;
  contact: string | null;
  artist_id: string | null;
  contact_id: string | null;
  event_id: string | null;
  task_id: string | null;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

const getStatusLabel = (status: string | null) => {
  switch (status) {
    case 'open': return 'Ouverte';
    case 'applied': return 'Candidaturé';
    case 'won': return 'Remportée';
    case 'lost': return 'Perdue';
    default: return status || 'Non défini';
  }
};

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800';
    case 'applied': return 'bg-blue-100 text-blue-800';
    case 'won': return 'bg-emerald-100 text-emerald-800';
    case 'lost': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

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

export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [linkedContacts, setLinkedContacts] = useState<LinkedContact[]>([]);
  const [linkedEvents, setLinkedEvents] = useState<LinkedEvent[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [linkedArtists, setLinkedArtists] = useState<LinkedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunity = async () => {
    if (!id || !user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setOpportunity(data);

      // Fetch owner if exists
      if (data.owner_id) {
        const { data: ownerData } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, email')
          .eq('user_id', data.owner_id)
          .single();
        
        if (ownerData) setOwner(ownerData);
      }

      // Fetch linked contacts via junction table
      const { data: contactLinks } = await supabase
        .from('contact_opportunities')
        .select('contact_id, role')
        .eq('opportunity_id', id);

      if (contactLinks && contactLinks.length > 0) {
        const contactIds = contactLinks.map(l => l.contact_id);
        const { data: contactsData } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, company')
          .in('id', contactIds);

        if (contactsData) {
          setLinkedContacts(contactsData.map(c => ({
            ...c,
            role: contactLinks.find(l => l.contact_id === c.id)?.role || null
          })));
        }
      }

      // Also check direct contact_id link
      if (data.contact_id) {
        const { data: directContact } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, company')
          .eq('id', data.contact_id)
          .single();
        
        if (directContact && !linkedContacts.find(c => c.id === directContact.id)) {
          setLinkedContacts(prev => [...prev, { ...directContact, role: 'Principal' }]);
        }
      }

      // Fetch linked events via junction table
      const { data: eventLinks } = await supabase
        .from('opportunity_events')
        .select('event_id')
        .eq('opportunity_id', id);

      if (eventLinks && eventLinks.length > 0) {
        const eventIds = eventLinks.map(l => l.event_id);
        const { data: eventsData } = await supabase
          .from('events')
          .select('id, title, start_date, venue, city, status')
          .in('id', eventIds);

        if (eventsData) {
          setLinkedEvents(eventsData);
        }
      }

      // Also check direct event_id link
      if (data.event_id) {
        const { data: directEvent } = await supabase
          .from('events')
          .select('id, title, start_date, venue, city, status')
          .eq('id', data.event_id)
          .single();
        
        if (directEvent) {
          setLinkedEvents(prev => {
            if (prev.find(e => e.id === directEvent.id)) return prev;
            return [...prev, directEvent];
          });
        }
      }

      // Fetch linked artists via junction table
      const { data: artistLinks } = await supabase
        .from('artist_opportunities')
        .select('artist_id')
        .eq('opportunity_id', id);

      if (artistLinks && artistLinks.length > 0) {
        const artistIds = artistLinks.map(l => l.artist_id);
        const { data: artistsData } = await supabase
          .from('centralized_artists')
          .select('id, name, genre, image')
          .in('id', artistIds);

        if (artistsData) {
          setLinkedArtists(artistsData);
        }
      }

      // Also check direct artist_id link
      if (data.artist_id) {
        const { data: directArtist } = await supabase
          .from('centralized_artists')
          .select('id, name, genre, image')
          .eq('id', data.artist_id)
          .single();
        
        if (directArtist) {
          setLinkedArtists(prev => {
            if (prev.find(a => a.id === directArtist.id)) return prev;
            return [...prev, directArtist];
          });
        }
      }

      // Fetch linked task
      if (data.task_id) {
        const { data: taskData } = await supabase
          .from('tasks')
          .select('id, title, status, due_date, priority')
          .eq('id', data.task_id)
          .single();
        
        if (taskData) setLinkedTasks([taskData]);
      }

    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement de l\'opportunité');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunity();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Button variant="ghost" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <div className="mt-8 text-center">
          <p className="text-muted-foreground">Opportunité non trouvée</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/opportunities')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(opportunity.status)}>
                {getStatusLabel(opportunity.status)}
              </Badge>
              {opportunity.probability_percentage && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Percent className="h-3 w-3" />
                  {opportunity.probability_percentage}%
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/opportunities')}>
          <Edit className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lieu</p>
                <p className="font-medium">{opportunity.venue || 'Non défini'}</p>
                <p className="text-xs text-muted-foreground">{opportunity.location || ''}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">
                  {opportunity.date 
                    ? format(new Date(opportunity.date), 'dd MMMM yyyy', { locale: fr })
                    : 'Non définie'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">{opportunity.budget ? `${opportunity.budget.toLocaleString('fr-FR')}€` : 'Non défini'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-medium">
                  {opportunity.deadline 
                    ? format(new Date(opportunity.deadline), 'dd MMMM yyyy', { locale: fr })
                    : 'Non définie'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({linkedContacts.length})</TabsTrigger>
          <TabsTrigger value="events">Événements ({linkedEvents.length})</TabsTrigger>
          <TabsTrigger value="artists">Artistes ({linkedArtists.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tâches ({linkedTasks.length})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Détails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {opportunity.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Description</p>
                    <p className="text-sm">{opportunity.description}</p>
                  </div>
                )}
                {opportunity.requirements && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Exigences</p>
                    <p className="text-sm whitespace-pre-wrap">{opportunity.requirements}</p>
                  </div>
                )}
                {opportunity.contact && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contact</p>
                    <p className="text-sm">{opportunity.contact}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner & Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Propriétaire & Informations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {owner ? (
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {(owner.first_name?.[0] || owner.email?.[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {owner.first_name || owner.last_name 
                          ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim()
                          : owner.username || owner.email}
                      </p>
                      {owner.email && (
                        <p className="text-sm text-muted-foreground">{owner.email}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucun propriétaire assigné</p>
                )}
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Créé le</p>
                    <p>{format(new Date(opportunity.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Modifié le</p>
                    <p>{format(new Date(opportunity.updated_at), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contacts Tab */}
        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Contacts liés ({linkedContacts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedContacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun contact lié</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedContacts.map((contact) => (
                    <Card
                      key={contact.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {contact.first_name[0]}{contact.last_name[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{contact.first_name} {contact.last_name}</p>
                            {contact.company && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                                <Building className="h-3 w-3" />
                                {contact.company}
                              </p>
                            )}
                            {contact.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </p>
                            )}
                            {contact.role && (
                              <Badge variant="secondary" className="mt-1 text-xs">{contact.role}</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Événements liés ({linkedEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun événement lié</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate(`/events/${event.id}`)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium truncate">{event.title}</h4>
                        <Badge className="mt-2 text-xs">{getEventStatusLabel(event.status)}</Badge>
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {event.start_date && (
                            <p className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(event.start_date), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                          )}
                          {event.venue && (
                            <p className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {event.venue}{event.city ? ` - ${event.city}` : ''}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Artists Tab */}
        <TabsContent value="artists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Artistes liés ({linkedArtists.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedArtists.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucun artiste lié</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedArtists.map((artist) => (
                    <Card
                      key={artist.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate(`/artists/${artist.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            {artist.image ? (
                              <img src={artist.image} alt={artist.name} className="object-cover" />
                            ) : (
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {artist.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium">{artist.name}</p>
                            <p className="text-sm text-muted-foreground">{artist.genre}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5" />
                Tâches liées ({linkedTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {linkedTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune tâche liée</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate('/tasks')}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <Badge className="mt-2 text-xs">{getTaskStatusLabel(task.status)}</Badge>
                        {task.due_date && (
                          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}
                          </p>
                        )}
                        {task.priority && (
                          <Badge variant="outline" className="mt-1 text-xs">{task.priority}</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
