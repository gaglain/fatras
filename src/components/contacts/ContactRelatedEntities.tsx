import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Target, Briefcase, CheckSquare, Map, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Contact } from '@/types/contact.types';

interface ContactRelatedEntitiesProps {
  contact: Contact;
}

interface RelatedEntity {
  id: string;
  title: string;
  type: 'event' | 'opportunity' | 'contract' | 'task' | 'roadshow';
  status: string;
  date?: string;
  venue?: string;
  amount?: number;
}

export const ContactRelatedEntities: React.FC<ContactRelatedEntitiesProps> = ({ contact }) => {
  const { user } = useAuth();
  const [entities, setEntities] = useState<RelatedEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (contact.id && user) {
      fetchRelatedEntities();
    }
  }, [contact.id, user]);

  const fetchRelatedEntities = async () => {
    if (!contact.id || !user) return;

    setLoading(true);
    try {
      const [eventsRes, opportunitiesRes, quotesRes, tasksRes, roadshowRes] = await Promise.all([
        // Événements directement liés
        supabase
          .from('events')
          .select('id, title, status, start_date, venue')
          .eq('contact_id', contact.id)
          .eq('user_id', user.id),
        
        // Opportunités
        supabase
          .from('opportunities')
          .select('id, title, status, date, venue, budget')
          .eq('contact_id', contact.id)
          .eq('user_id', user.id),
        
        // Contrats via les devis
        supabase
          .from('quotes')
          .select('id, title, status, created_at, total_amount')
          .eq('contact_id', contact.id)
          .eq('user_id', user.id),
        
        // Tâches
        supabase
          .from('tasks')
          .select('id, title, status, due_date')
          .eq('contact_id', contact.id)
          .eq('user_id', user.id),
        
        // Roadshow stops avec contacts liés
        supabase
          .from('roadshow_stops')
          .select('id, city, venue, status, event_date')
          .eq('user_id', user.id)
      ]);

      const relatedEntities: RelatedEntity[] = [];

      // Ajouter les événements
      if (eventsRes.data) {
        eventsRes.data.forEach(event => {
          relatedEntities.push({
            id: event.id,
            title: event.title,
            type: 'event',
            status: event.status,
            date: event.start_date,
            venue: event.venue
          });
        });
      }

      // Ajouter les opportunités
      if (opportunitiesRes.data) {
        opportunitiesRes.data.forEach(opportunity => {
          relatedEntities.push({
            id: opportunity.id,
            title: opportunity.title,
            type: 'opportunity',
            status: opportunity.status,
            date: opportunity.date,
            venue: opportunity.venue,
            amount: opportunity.budget
          });
        });
      }

      // Ajouter les contrats/devis
      if (quotesRes.data) {
        quotesRes.data.forEach(quote => {
          relatedEntities.push({
            id: quote.id,
            title: quote.title,
            type: 'contract',
            status: quote.status,
            date: quote.created_at,
            amount: quote.total_amount
          });
        });
      }

      // Ajouter les tâches
      if (tasksRes.data) {
        tasksRes.data.forEach(task => {
          relatedEntities.push({
            id: task.id,
            title: task.title,
            type: 'task',
            status: task.status,
            date: task.due_date
          });
        });
      }

      // Vérifier également les événements liés via contact_events
      const linkedEventsRes = await supabase
        .from('contact_events')
        .select('*')
        .eq('contact_id', contact.id);

      if (linkedEventsRes.data) {
        for (const item of linkedEventsRes.data) {
          try {
            const { data: eventData } = await supabase
              .from('events')
              .select('id, title, status, start_date, venue')
              .eq('id', item.event_id)
              .single();
              
            if (eventData && !relatedEntities.find(e => e.id === eventData.id && e.type === 'event')) {
              relatedEntities.push({
                id: eventData.id,
                title: eventData.title,
                type: 'event',
                status: eventData.status,
                date: eventData.start_date,
                venue: eventData.venue
              });
            }
          } catch (error) {
            console.error('Erreur lors du chargement de l\'événement lié:', error);
          }
        }
      }

      setEntities(relatedEntities);
    } catch (error) {
      console.error('Erreur lors du chargement des entités liées:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEntityIcon = (type: string) => {
    switch (type) {
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'opportunity': return <Target className="h-4 w-4" />;
      case 'contract': return <FileText className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'roadshow': return <Map className="h-4 w-4" />;
      default: return <Briefcase className="h-4 w-4" />;
    }
  };

  const getEntityLabel = (type: string) => {
    switch (type) {
      case 'event': return 'Événement';
      case 'opportunity': return 'Opportunité';
      case 'contract': return 'Devis';
      case 'task': return 'Tâche';
      case 'roadshow': return 'Tournée';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'pending':
      case 'todo': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const navigateToEntity = (entity: RelatedEntity) => {
    const routes = {
      event: '/events',
      opportunity: '/opportunities',
      contract: '/quotes',
      task: '/tasks',
      roadshow: '/roadshow'
    };
    
    window.location.href = routes[entity.type];
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Éléments liés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  if (entities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Éléments liés</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Aucun élément lié à ce contact</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Éléments liés ({entities.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entities.map((entity) => (
            <div 
              key={`${entity.type}-${entity.id}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
              onClick={() => navigateToEntity(entity)}
            >
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                  {getEntityIcon(entity.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{entity.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {getEntityLabel(entity.type)}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Badge className={getStatusColor(entity.status)}>
                      {entity.status}
                    </Badge>
                    {entity.date && <span>{formatDate(entity.date)}</span>}
                    {entity.venue && <span>• {entity.venue}</span>}
                    {entity.amount && <span>• {entity.amount.toLocaleString()}€</span>}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};