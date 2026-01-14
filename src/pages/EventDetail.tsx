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
  Link as LinkIcon,
  Mail,
  Phone,
  Building,
  Target,
  CheckSquare,
  Eye,
  Clock,
  Users,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { EventDashboard } from '@/components/EventDashboard';
import { EventDialog } from '@/components/events/EventDialog';
import { ContactEventManager } from '@/components/contacts/ContactEventManager';
import { OpportunityEventManager } from '@/components/events/OpportunityEventManager';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Owner {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
}

interface LinkedOpportunity {
  id: string;
  title: string;
  status: string;
  venue: string | null;
  date: string | null;
  budget: number | null;
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

interface LinkedTask {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  priority: string | null;
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending': return 'En attente';
    case 'option': return 'Option';
    case 'confirmed': return 'Confirmé';
    case 'cancelled': return 'Annulé';
    case 'completed': return 'Terminé';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'option': return 'bg-blue-100 text-blue-800';
    case 'confirmed': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    case 'completed': return 'bg-purple-100 text-purple-800';
    case 'open': return 'bg-green-100 text-green-800';
    case 'applied': return 'bg-blue-100 text-blue-800';
    case 'won': return 'bg-emerald-100 text-emerald-800';
    case 'lost': return 'bg-red-100 text-red-800';
    case 'todo': return 'bg-gray-100 text-gray-800';
    case 'in_progress': return 'bg-blue-100 text-blue-800';
    case 'done': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getOpportunityStatusLabel = (status: string) => {
  switch (status) {
    case 'open': return 'Ouverte';
    case 'applied': return 'Candidaturé';
    case 'won': return 'Remportée';
    case 'lost': return 'Perdue';
    default: return status;
  }
};

const getTaskStatusLabel = (status: string) => {
  switch (status) {
    case 'todo': return 'À faire';
    case 'in_progress': return 'En cours';
    case 'done': return 'Terminé';
    default: return status;
  }
};

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [linkedOpportunities, setLinkedOpportunities] = useState<LinkedOpportunity[]>([]);
  const [linkedContacts, setLinkedContacts] = useState<LinkedContact[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contactManagerOpen, setContactManagerOpen] = useState(false);
  const [opportunityManagerOpen, setOpportunityManagerOpen] = useState(false);

  const fetchEvent = async () => {
    if (!id || !user?.id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setEvent(data);

      // Fetch owner if exists
      if (data.owner_id) {
        const { data: ownerData } = await supabase
          .from('user_profiles')
          .select('user_id, first_name, last_name, username, email')
          .eq('user_id', data.owner_id)
          .single();
        
        if (ownerData) setOwner(ownerData);
      }

      // Fetch linked contacts - from BOTH contact_id field AND contact_events junction table
      let allContacts: LinkedContact[] = [];
      
      // 1. Direct contact from contact_id field
      if (data.contact_id) {
        const { data: directContact } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, company, role')
          .eq('id', data.contact_id)
          .single();
        
        if (directContact) {
          allContacts.push(directContact);
        }
      }
      
      // 2. Contacts from junction table contact_events
      const { data: contactLinks } = await supabase
        .from('contact_events')
        .select('contact_id')
        .eq('event_id', id);

      if (contactLinks && contactLinks.length > 0) {
        const contactIds = contactLinks.map(l => l.contact_id);
        const { data: contacts } = await supabase
          .from('contacts')
          .select('id, first_name, last_name, email, phone, company, role')
          .in('id', contactIds);
        
        if (contacts) {
          // Dedupe
          const existingIds = new Set(allContacts.map(c => c.id));
          contacts.forEach(c => {
            if (!existingIds.has(c.id)) {
              allContacts.push(c);
            }
          });
        }
      }
      
      setLinkedContacts(allContacts);

      // Fetch linked opportunities (directly via event_id or via opportunity_events)
      const { data: directOpps } = await supabase
        .from('opportunities')
        .select('id, title, status, venue, date, budget')
        .eq('event_id', id);

      const { data: oppLinks } = await supabase
        .from('opportunity_events')
        .select('opportunity_id')
        .eq('event_id', id);

      let allOpps = directOpps || [];
      
      if (oppLinks && oppLinks.length > 0) {
        const oppIds = oppLinks.map(l => l.opportunity_id);
        const { data: linkedOpps } = await supabase
          .from('opportunities')
          .select('id, title, status, venue, date, budget')
          .in('id', oppIds);
        
        if (linkedOpps) {
          const existingIds = new Set(allOpps.map(o => o.id));
          linkedOpps.forEach(o => {
            if (!existingIds.has(o.id)) {
              allOpps.push(o);
            }
          });
        }
      }

      setLinkedOpportunities(allOpps);

      // Fetch linked tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, title, status, due_date, priority')
        .eq('event_id', id);

      if (tasks) setLinkedTasks(tasks);

    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Erreur lors du chargement du spectacle');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Spectacle non trouvé</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux spectacles
          </Button>
        </div>
      </div>
    );
  }

  const totalConnections = linkedContacts.length + linkedOpportunities.length + linkedTasks.length;

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 lg:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
            className="w-fit"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div className="text-center sm:text-left">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
              <Badge className={getStatusColor(event.status || 'pending')}>
                {getStatusLabel(event.status || 'pending')}
              </Badge>
            </div>
            {event.venue && (
              <p className="text-muted-foreground flex items-center justify-center sm:justify-start gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {event.venue}
                {event.city && ` - ${event.city}`}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)} className="w-full sm:w-auto">
          <Edit className="mr-2 h-4 w-4" />
          Modifier
        </Button>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {event.start_date && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{format(new Date(event.start_date), 'dd/MM/yyyy', { locale: fr })}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div className="text-sm">
                <p className="text-muted-foreground">Contacts</p>
                <p className="font-medium">{linkedContacts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <div className="text-sm">
                <p className="text-muted-foreground">Opportunités</p>
                <p className="font-medium">{linkedOpportunities.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckSquare className="h-4 w-4 text-orange-600" />
              <div className="text-sm">
                <p className="text-muted-foreground">Tâches</p>
                <p className="font-medium">{linkedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {owner && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-purple-600" />
                <div className="text-sm">
                  <p className="text-muted-foreground">Propriétaire</p>
                  <p className="font-medium truncate">
                    {owner.first_name || owner.last_name 
                      ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() 
                      : owner.username || owner.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({linkedContacts.length})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités ({linkedOpportunities.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tâches ({linkedTasks.length})</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Event Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Détails de l'événement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {event.start_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date de début</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.start_date), 'PPP', { locale: fr })}
                      </p>
                    </div>
                  )}
                  {event.end_date && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Date de fin</p>
                      <p className="font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(event.end_date), 'PPP', { locale: fr })}
                      </p>
                    </div>
                  )}
                  {event.event_type && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Type</p>
                      <p className="font-semibold">{event.event_type}</p>
                    </div>
                  )}
                  {event.attendees_count && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Participants attendus</p>
                      <p className="font-semibold">{event.attendees_count}</p>
                    </div>
                  )}
                </div>
                {event.description && (
                  <div className="mt-6">
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-foreground">{event.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activité</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Contacts liés</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {linkedContacts.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Opportunités</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {linkedOpportunities.length}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="h-4 w-4 text-orange-600" />
                      <span className="text-sm font-medium">Tâches</span>
                    </div>
                    <Badge variant="secondary" className="text-base">
                      {linkedTasks.length}
                    </Badge>
                  </div>

                  <Separator />
                  
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Résumé</p>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total d'éléments liés</span>
                        <span className="font-medium">{totalConnections}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Contacts liés ({linkedContacts.length})
              </CardTitle>
              <Button onClick={() => setContactManagerOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {linkedContacts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucun contact lié à cet événement</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedContacts.map((contact) => (
                    <Card 
                      key={contact.id} 
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate(`/contacts/${contact.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {contact.first_name?.[0]}{contact.last_name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm truncate">
                                {contact.first_name} {contact.last_name}
                              </h4>
                              {contact.company && (
                                <p className="text-xs text-muted-foreground truncate">{contact.company}</p>
                              )}
                            </div>
                          </div>
                          {contact.email && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{contact.email}</span>
                            </div>
                          )}
                          {contact.phone && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          {contact.role && (
                            <Badge variant="outline" className="text-xs">{contact.role}</Badge>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Voir le profil
                            </span>
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

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Opportunités liées ({linkedOpportunities.length})
              </CardTitle>
              <Button onClick={() => setOpportunityManagerOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </CardHeader>
            <CardContent>
              {linkedOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune opportunité liée à cet événement</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedOpportunities.map((opp) => (
                    <Card 
                      key={opp.id} 
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate('/opportunities')}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{opp.title}</h4>
                            <Badge className={getStatusColor(opp.status)}>
                              {getOpportunityStatusLabel(opp.status)}
                            </Badge>
                          </div>
                          {opp.venue && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Building className="h-3.5 w-3.5 shrink-0" />
                              <span className="truncate">{opp.venue}</span>
                            </div>
                          )}
                          {opp.date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>{format(new Date(opp.date), 'dd/MM/yyyy', { locale: fr })}</span>
                            </div>
                          )}
                          {opp.budget && opp.budget > 0 && (
                            <div className="text-sm font-medium text-foreground">
                              {opp.budget}€
                            </div>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Voir détails
                            </span>
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
                <div className="text-center py-8">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Aucune tâche liée à cet événement</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {linkedTasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50"
                      onClick={() => navigate('/tasks')}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={getStatusColor(task.status)}>
                              {getTaskStatusLabel(task.status)}
                            </Badge>
                          </div>
                          {task.due_date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 shrink-0" />
                              <span>{format(new Date(task.due_date), 'dd/MM/yyyy', { locale: fr })}</span>
                            </div>
                          )}
                          {task.priority && (
                            <Badge variant="outline" className="text-xs">{task.priority}</Badge>
                          )}
                          <Separator />
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              Voir détails
                            </span>
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

        <TabsContent value="dashboard" className="space-y-4">
          <EventDashboard eventId={event.id} eventName={event.title} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editDialogOpen && (
        <EventDialog
          event={event}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onSave={() => {
            setEditDialogOpen(false);
            fetchEvent();
          }}
        />
      )}

      {/* Contact Manager */}
      <ContactEventManager
        isOpen={contactManagerOpen}
        onClose={() => {
          setContactManagerOpen(false);
          fetchEvent();
        }}
        eventId={event.id}
        eventTitle={event.title}
      />

      {/* Opportunity Manager */}
      <OpportunityEventManager
        isOpen={opportunityManagerOpen}
        onClose={() => {
          setOpportunityManagerOpen(false);
          fetchEvent();
        }}
        eventId={event.id}
        eventTitle={event.title}
        onUpdate={fetchEvent}
      />
    </div>
  );
};
