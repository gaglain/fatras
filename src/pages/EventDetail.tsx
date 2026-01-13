import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, MapPin, Edit } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { EventDashboard } from '@/components/EventDashboard';
import { EventDialog } from '@/components/events/EventDialog';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
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
    } catch {
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/events')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            {event.venue && (
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <MapPin className="h-4 w-4" />
                {event.venue}
                {event.city && ` - ${event.city}`}
              </p>
            )}
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)}>
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
                <p className="font-semibold">{event.status}</p>
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
