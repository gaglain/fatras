import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { notifyOpportunityAssignment, notifyQuoteAssignment } from '@/utils/notificationHelpers';
import { logger } from '@/lib/logger';

export interface EntityConnection {
  id: string;
  entity_type: string;
  entity_id: string;
  title: string;
  status?: string;
  date?: string;
  role?: string;
}

export interface ConnectedEntities {
  contacts: EntityConnection[];
  events: EntityConnection[];
  opportunities: EntityConnection[];
  quotes: EntityConnection[];
  tasks: EntityConnection[];
  artists: EntityConnection[];
  roadshow_stops: EntityConnection[];
}

interface CentralizedEvent {
  id: string;
  title: string;
  status: string;
  start_date: string | null;
}

interface Opportunity {
  id: string;
  title: string;
  status: string;
  date: string | null;
}

interface Quote {
  id: string;
  title: string;
  status: string;
  created_at: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
}

interface RoadshowStop {
  id: string;
  city: string;
  status: string;
  event_date: string | null;
}

export const useEntityConnections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Obtenir toutes les entités liées à un contact
  const getContactConnections = async (contactId: string): Promise<ConnectedEntities> => {
    if (!user) {
      return {
        contacts: [],
        events: [],
        opportunities: [],
        quotes: [],
        tasks: [],
        artists: [],
        roadshow_stops: []
      } as ConnectedEntities;
    }

    setLoading(true);
    try {
      logger.debug('Recherche des connexions pour contact:', contactId, 'user:', user.id);
      
      const [
        eventsRes,
        opportunitiesRes,
        quotesRes,
        tasksRes,
        taskEntitiesRes,
        roadshowRes,
        eventsMapRes,
        opportunitiesMapRes,
        quotesMapRes
      ] = await Promise.all([
        // Événements liés directement (sans filtre user_id)
        supabase
          .from('events')
          .select('id, title, status, start_date')
          .eq('contact_id', contactId),
        
        // Opportunités liées directement (sans filtre user_id)
        supabase
          .from('opportunities')
          .select('id, title, status, date')
          .eq('contact_id', contactId),
        
        // Devis liés directement (sans filtre user_id)
        supabase
          .from('quotes')
          .select('id, title, status, created_at')
          .eq('contact_id', contactId),
        
        // Tâches liées directement (sans filtre user_id)
        supabase
          .from('tasks')
          .select('id, title, status, due_date')
          .eq('contact_id', contactId),
        
        // Tâches via task_entities
        supabase
          .from('task_entities')
          .select('task_id, tasks(id, title, status, due_date)')
          .eq('entity_type', 'contact')
          .eq('entity_id', contactId),
        
        // Roadshow stops liés via roadshow_contacts
        supabase
          .from('roadshow_contacts')
          .select('roadshow_stop_id, role, roadshow_stops(id, city, status, event_date)')
          .eq('contact_id', contactId),

        // Événements via table de liaison contact_events (centralized_events)
        supabase
          .from('contact_events')
          .select(`
            event_id,
            centralized_events!inner(id, title, status, start_date)
          `)
          .eq('contact_id', contactId),

        // Opportunités via table de liaison contact_opportunities
        supabase
          .from('contact_opportunities')
          .select('opportunity_id, role, opportunities(id, title, status, date)')
          .eq('contact_id', contactId),

        // Devis via table de liaison contact_quotes
        supabase
          .from('contact_quotes')
          .select('quote_id, role, quotes(id, title, status, created_at)')
          .eq('contact_id', contactId)
      ]);

      logger.debug('Résultats bruts des requêtes:', {
        events: eventsRes.data?.length,
        opportunities: opportunitiesRes.data?.length,
        quotes: quotesRes.data?.length,
        tasks: tasksRes.data?.length,
        taskEntities: taskEntitiesRes.data?.length
      });

      const connections: ConnectedEntities = {
        contacts: [],
        events: [],
        opportunities: [],
        quotes: [],
        tasks: [],
        artists: [],
        roadshow_stops: []
      };

      // Map pour éviter les doublons
      const eventMap = new Map<string, EntityConnection>();
      const opportunityMap = new Map<string, EntityConnection>();
      const quoteMap = new Map<string, EntityConnection>();
      const taskMap = new Map<string, EntityConnection>();

      // Traiter les événements directs
      if (eventsRes.data) {
        eventsRes.data.forEach(event => {
          eventMap.set(event.id, {
            id: event.id,
            entity_type: 'event',
            entity_id: event.id,
            title: event.title,
            status: event.status,
            date: event.start_date || undefined
          });
        });
      }

      // Traiter les événements via liaison (supporte centralized_events)
      if (eventsMapRes.data && !eventsMapRes.error) {
        eventsMapRes.data.forEach((item: { event_id: string; centralized_events: CentralizedEvent | CentralizedEvent[] }) => {
          // Normaliser l'événement joint (peut être centralized_events ou events selon la relation)
          const ev = Array.isArray(item.centralized_events)
            ? item.centralized_events[0]
            : item.centralized_events;

          if (ev && !eventMap.has(ev.id)) {
            eventMap.set(ev.id, {
              id: ev.id,
              entity_type: 'event',
              entity_id: ev.id,
              title: ev.title,
              status: ev.status,
              date: ev.start_date || undefined
            });
          }
        });
      }

      // Traiter les opportunités directes
      if (opportunitiesRes.data) {
        opportunitiesRes.data.forEach(opp => {
          opportunityMap.set(opp.id, {
            id: opp.id,
            entity_type: 'opportunity',
            entity_id: opp.id,
            title: opp.title,
            status: opp.status,
            date: opp.date || undefined
          });
        });
      }

      // Traiter les opportunités via liaison
      if (opportunitiesMapRes.data) {
        opportunitiesMapRes.data.forEach((item: { opportunity_id: string; role: string | null; opportunities: Opportunity | null }) => {
          if (item.opportunities && !opportunityMap.has(item.opportunities.id)) {
            opportunityMap.set(item.opportunities.id, {
              id: item.opportunities.id,
              entity_type: 'opportunity',
              entity_id: item.opportunities.id,
              title: item.opportunities.title,
              status: item.opportunities.status,
              date: item.opportunities.date || undefined,
              role: item.role || undefined
            });
          }
        });
      }

      // Traiter les devis directs
      if (quotesRes.data) {
        quotesRes.data.forEach(quote => {
          quoteMap.set(quote.id, {
            id: quote.id,
            entity_type: 'quote',
            entity_id: quote.id,
            title: quote.title,
            status: quote.status,
            date: quote.created_at
          });
        });
      }

      // Traiter les devis via liaison
      if (quotesMapRes.data) {
        quotesMapRes.data.forEach((item: { quote_id: string; role: string | null; quotes: Quote | null }) => {
          if (item.quotes && !quoteMap.has(item.quotes.id)) {
            quoteMap.set(item.quotes.id, {
              id: item.quotes.id,
              entity_type: 'quote',
              entity_id: item.quotes.id,
              title: item.quotes.title,
              status: item.quotes.status,
              date: item.quotes.created_at,
              role: item.role || undefined
            });
          }
        });
      }

      // Traiter les tâches directes
      if (tasksRes.data) {
        logger.debug('Tâches directes trouvées:', tasksRes.data.length);
        tasksRes.data.forEach(task => {
          taskMap.set(task.id, {
            id: task.id,
            entity_type: 'task',
            entity_id: task.id,
            title: task.title,
            status: task.status,
            date: task.due_date || undefined
          });
        });
      }

      // Traiter les tâches via task_entities
      if (taskEntitiesRes.data) {
        logger.debug('Tâches via task_entities trouvées:', taskEntitiesRes.data.length);
        taskEntitiesRes.data.forEach((item: { task_id: string; tasks: Task | null }) => {
          if (item.tasks && !taskMap.has(item.tasks.id)) {
            taskMap.set(item.tasks.id, {
              id: item.tasks.id,
              entity_type: 'task',
              entity_id: item.tasks.id,
              title: item.tasks.title,
              status: item.tasks.status,
              date: item.tasks.due_date || undefined
            });
          }
        });
      }
      
      logger.debug('Total tâches dans taskMap:', taskMap.size);

      // Traiter les roadshow stops
      if (roadshowRes.data) {
        roadshowRes.data.forEach((item: { roadshow_stop_id: string; role: string | null; roadshow_stops: RoadshowStop | null }) => {
          if (item.roadshow_stops) {
            connections.roadshow_stops.push({
              id: item.roadshow_stops.id,
              entity_type: 'roadshow_stop',
              entity_id: item.roadshow_stops.id,
              title: `${item.roadshow_stops.city}`,
              status: item.roadshow_stops.status,
              date: item.roadshow_stops.event_date || undefined,
              role: item.role || undefined
            });
          }
        });
      }

      // Convertir les maps en arrays
      connections.events = Array.from(eventMap.values());
      connections.opportunities = Array.from(opportunityMap.values());
      connections.quotes = Array.from(quoteMap.values());
      connections.tasks = Array.from(taskMap.values());

      logger.debug('Connexions finales pour le contact:', {
        events: connections.events.length,
        opportunities: connections.opportunities.length,
        quotes: connections.quotes.length,
        tasks: connections.tasks.length,
        roadshow_stops: connections.roadshow_stops.length
      });

      return connections;
    } catch (error) {
      logger.error('Erreur lors du chargement des connexions:', error);
      toast.error('Erreur lors du chargement des éléments liés');
      return {} as ConnectedEntities;
    } finally {
      setLoading(false);
    }
  };

  // Lier un contact à une entité
  const linkContactToEntity = async (
    contactId: string, 
    entityType: string, 
    entityId: string, 
    role: string = 'primary'
  ) => {
    if (!user) return false;

    try {
      const tableMappings: { [key: string]: string } = {
        event: 'contact_events',
        opportunity: 'contact_opportunities', 
        quote: 'contact_quotes',
        roadshow_stop: 'roadshow_contacts'
      };

      const table = tableMappings[entityType];
      if (!table) {
        if (entityType === 'task') {
          await supabase
            .from('task_entities')
            .insert({
              task_id: entityId,
              entity_type: 'contact',
              entity_id: contactId
            });
        }
        return true;
      }

      let error = null;
      
      if (entityType === 'event') {
        const res = await supabase
          .from('contact_events')
          .insert({ contact_id: contactId, event_id: entityId });
        error = res.error;
      } else if (entityType === 'opportunity') {
        const res = await supabase
          .from('contact_opportunities')
          .insert({ contact_id: contactId, opportunity_id: entityId, role });
        error = res.error;
      } else if (entityType === 'quote') {
        const res = await supabase
          .from('contact_quotes')
          .insert({ contact_id: contactId, quote_id: entityId, role });
        error = res.error;
      } else if (entityType === 'roadshow_stop') {
        const res = await supabase
          .from('roadshow_contacts')
          .insert({ contact_id: contactId, roadshow_stop_id: entityId, role });
        error = res.error;
      }

      if (error) throw error;

      // Envoyer une notification selon le type d'entité
      if (entityType === 'opportunity' || entityType === 'quote') {
        // Récupérer les informations du contact
        const { data: contactData } = await supabase
          .from('contacts')
          .select('user_id, first_name, last_name')
          .eq('id', contactId)
          .single();

        // Récupérer l'email de l'utilisateur qui fait l'assignation
        const { data: assignerData } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', user.id)
          .single();

        if (contactData?.user_id && assignerData?.email) {
          if (entityType === 'opportunity') {
            // Récupérer le titre de l'opportunité
            const { data: opportunityData } = await supabase
              .from('opportunities')
              .select('title')
              .eq('id', entityId)
              .single();

            if (opportunityData) {
              await notifyOpportunityAssignment({
                assignedToUserId: contactData.user_id,
                opportunityTitle: opportunityData.title,
                assignedByUserEmail: assignerData.email,
                opportunityId: entityId
              });
            }
          } else if (entityType === 'quote') {
            // Récupérer le titre du devis
            const { data: quoteData } = await supabase
              .from('quotes')
              .select('quote_number, title')
              .eq('id', entityId)
              .single();

            if (quoteData) {
              await notifyQuoteAssignment({
                assignedToUserId: contactData.user_id,
                quoteReference: quoteData.quote_number || quoteData.title,
                assignedByUserEmail: assignerData.email,
                quoteId: entityId
              });
            }
          }
        }
      }

      toast.success('Liaison créée avec succès');
      return true;
    } catch (error) {
      logger.error('Erreur lors de la création de la liaison:', error);
      toast.error('Erreur lors de la création de la liaison');
      return false;
    }
  };

  // Supprimer une liaison entre un contact et une entité
  const unlinkContactFromEntity = async (
    contactId: string, 
    entityType: string, 
    entityId: string
  ) => {
    if (!user) return false;

    try {
      const tableMappings: { [key: string]: { table: string, field: string } } = {
        event: { table: 'contact_events', field: 'event_id' },
        opportunity: { table: 'contact_opportunities', field: 'opportunity_id' },
        quote: { table: 'contact_quotes', field: 'quote_id' },
        roadshow_stop: { table: 'roadshow_contacts', field: 'roadshow_stop_id' }
      };

      const mapping = tableMappings[entityType];
      if (!mapping) {
        if (entityType === 'task') {
          await supabase
            .from('task_entities')
            .delete()
            .eq('task_id', entityId)
            .eq('entity_type', 'contact')
            .eq('entity_id', contactId);
        }
        return true;
      }

      let error = null;
      
      if (entityType === 'event') {
        const res = await supabase
          .from('contact_events')
          .delete()
          .eq('contact_id', contactId)
          .eq('event_id', entityId);
        error = res.error;
      } else if (entityType === 'opportunity') {
        const res = await supabase
          .from('contact_opportunities')
          .delete()
          .eq('contact_id', contactId)
          .eq('opportunity_id', entityId);
        error = res.error;
      } else if (entityType === 'quote') {
        const res = await supabase
          .from('contact_quotes')
          .delete()
          .eq('contact_id', contactId)
          .eq('quote_id', entityId);
        error = res.error;
      } else if (entityType === 'roadshow_stop') {
        const res = await supabase
          .from('roadshow_contacts')
          .delete()
          .eq('contact_id', contactId)
          .eq('roadshow_stop_id', entityId);
        error = res.error;
      }

      if (error) throw error;
      toast.success('Liaison supprimée avec succès');
      return true;
    } catch (error) {
      logger.error('Erreur lors de la suppression de la liaison:', error);
      toast.error('Erreur lors de la suppression de la liaison');
      return false;
    }
  };

  return {
    loading,
    getContactConnections,
    linkContactToEntity,
    unlinkContactFromEntity
  };
};
