import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, MapPin, Edit, User, History, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { EventDashboard } from '@/components/EventDashboard';
import { EventDialog } from '@/components/events/EventDialog';
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

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [linkedOpportunities, setLinkedOpportunities] = useState<LinkedOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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
          // Merge without duplicates
          const existingIds = new Set(allOpps.map(o => o.id));
          linkedOpps.forEach(o => {
            if (!existingIds.has(o.id)) {
              allOpps.push(o);
            }
          });
        }
      }

      setLinkedOpportunities(allOpps);

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
            <h1 className="text-2xl sm:text-3xl font-bold">{event.title}</h1>
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

      {/* Event Info Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {event.status && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Statut</p>
                <Badge className={getStatusColor(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
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
            {owner && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Propriétaire</p>
                <p className="font-semibold flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {owner.first_name || owner.last_name 
                    ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() 
                    : owner.username || owner.email}
                </p>
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

      {/* Linked Opportunities */}
      {linkedOpportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <History className="h-5 w-5" />
              Opportunités liées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {linkedOpportunities.map((opp) => (
                <div 
                  key={opp.id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate('/opportunities')}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{opp.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {opp.venue && `${opp.venue} • `}
                        {opp.date && format(new Date(opp.date), 'PPP', { locale: fr })}
                        {opp.budget && ` • ${opp.budget}€`}
                      </p>
                    </div>
                  </div>
                  <Badge className="mt-2 sm:mt-0 w-fit">
                    {getOpportunityStatusLabel(opp.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dashboard */}
      <EventDashboard eventId={event.id} eventName={event.title} />

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
    </div>
  );
};
