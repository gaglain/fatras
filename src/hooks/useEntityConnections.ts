import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

export const useEntityConnections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Obtenir toutes les entités liées à un contact
  const getContactConnections = async (contactId: string): Promise<ConnectedEntities> => {
    if (!user) return {} as ConnectedEntities;

    setLoading(true);
    try {
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
        // Événements liés directement
        supabase
          .from('events')
          .select('id, title, status, start_date')
          .eq('contact_id', contactId)
          .eq('user_id', user.id),
        
        // Opportunités liées directement
        supabase
          .from('opportunities')
          .select('id, title, status, date')
          .eq('contact_id', contactId)
          .eq('user_id', user.id),
        
        // Devis liés directement
        supabase
          .from('quotes')
          .select('id, title, status, created_at')
          .eq('contact_id', contactId)
          .eq('user_id', user.id),
        
        // Tâches liées directement
        supabase
          .from('tasks')
          .select('id, title, status, due_date')
          .eq('contact_id', contactId)
          .eq('user_id', user.id),
        
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

        // Événements via table de liaison contact_events
        supabase
          .from('contact_events')
          .select(`
            event_id,
            events!inner(id, title, status, start_date)
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
      const eventMap = new Map();
      const opportunityMap = new Map();
      const quoteMap = new Map();
      const taskMap = new Map();

      // Traiter les événements directs
      if (eventsRes.data) {
        eventsRes.data.forEach(event => {
          eventMap.set(event.id, {
            id: event.id,
            entity_type: 'event',
            entity_id: event.id,
            title: event.title,
            status: event.status,
            date: event.start_date
          });
        });
      }

      // Traiter les événements via liaison
      if (eventsMapRes.data && !eventsMapRes.error) {
        eventsMapRes.data.forEach((item: any) => {
          if (item.events && Array.isArray(item.events) && item.events.length > 0) {
            const event = item.events[0];
            if (event && !eventMap.has(event.id)) {
              eventMap.set(event.id, {
                id: event.id,
                entity_type: 'event',
                entity_id: event.id,
                title: event.title,
                status: event.status,
                date: event.start_date
              });
            }
          } else if (item.events && typeof item.events === 'object') {
            const event = item.events;
            if (!eventMap.has(event.id)) {
              eventMap.set(event.id, {
                id: event.id,
                entity_type: 'event',
                entity_id: event.id,
                title: event.title,
                status: event.status,
                date: event.start_date
              });
            }
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
            date: opp.date
          });
        });
      }

      // Traiter les opportunités via liaison
      if (opportunitiesMapRes.data) {
        opportunitiesMapRes.data.forEach(item => {
          if (item.opportunities && !opportunityMap.has(item.opportunities.id)) {
            opportunityMap.set(item.opportunities.id, {
              id: item.opportunities.id,
              entity_type: 'opportunity',
              entity_id: item.opportunities.id,
              title: item.opportunities.title,
              status: item.opportunities.status,
              date: item.opportunities.date,
              role: item.role
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
        quotesMapRes.data.forEach(item => {
          if (item.quotes && !quoteMap.has(item.quotes.id)) {
            quoteMap.set(item.quotes.id, {
              id: item.quotes.id,
              entity_type: 'quote',
              entity_id: item.quotes.id,
              title: item.quotes.title,
              status: item.quotes.status,
              date: item.quotes.created_at,
              role: item.role
            });
          }
        });
      }

      // Traiter les tâches directes
      if (tasksRes.data) {
        console.log('📋 Tâches directes trouvées:', tasksRes.data);
        tasksRes.data.forEach(task => {
          taskMap.set(task.id, {
            id: task.id,
            entity_type: 'task',
            entity_id: task.id,
            title: task.title,
            status: task.status,
            date: task.due_date
          });
        });
      }

      // Traiter les tâches via task_entities
      if (taskEntitiesRes.data) {
        console.log('📋 Tâches via task_entities trouvées:', taskEntitiesRes.data);
        taskEntitiesRes.data.forEach(item => {
          if (item.tasks && !taskMap.has(item.tasks.id)) {
            taskMap.set(item.tasks.id, {
              id: item.tasks.id,
              entity_type: 'task',
              entity_id: item.tasks.id,
              title: item.tasks.title,
              status: item.tasks.status,
              date: item.tasks.due_date
            });
          }
        });
      }
      
      console.log('📊 Total tâches dans taskMap:', taskMap.size);

      // Traiter les roadshow stops
      if (roadshowRes.data) {
        roadshowRes.data.forEach(item => {
          if (item.roadshow_stops) {
            connections.roadshow_stops.push({
              id: item.roadshow_stops.id,
              entity_type: 'roadshow_stop',
              entity_id: item.roadshow_stops.id,
              title: `${item.roadshow_stops.city}`,
              status: item.roadshow_stops.status,
              date: item.roadshow_stops.event_date,
              role: item.role
            });
          }
        });
      }

      // Convertir les maps en arrays
      connections.events = Array.from(eventMap.values());
      connections.opportunities = Array.from(opportunityMap.values());
      connections.quotes = Array.from(quoteMap.values());
      connections.tasks = Array.from(taskMap.values());

      console.log('✅ Connexions finales pour le contact:', {
        events: connections.events.length,
        opportunities: connections.opportunities.length,
        quotes: connections.quotes.length,
        tasks: connections.tasks.length,
        roadshow_stops: connections.roadshow_stops.length
      });

      return connections;
    } catch (error) {
      console.error('Erreur lors du chargement des connexions:', error);
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

      const insertData: any = {
        contact_id: contactId
      };

      if (entityType === 'event') {
        insertData.event_id = entityId;
      } else if (entityType === 'opportunity') {
        insertData.opportunity_id = entityId;
        insertData.role = role;
      } else if (entityType === 'quote') {
        insertData.quote_id = entityId;
        insertData.role = role;
      } else if (entityType === 'roadshow_stop') {
        insertData.roadshow_stop_id = entityId;
        insertData.role = role;
      }

      const { error } = await supabase
        .from(table as any)
        .insert(insertData);

      if (error) throw error;
      toast.success('Liaison créée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la création de la liaison:', error);
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

      const { error } = await supabase
        .from(mapping.table as any)
        .delete()
        .eq('contact_id', contactId)
        .eq(mapping.field, entityId);

      if (error) throw error;
      toast.success('Liaison supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la liaison:', error);
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