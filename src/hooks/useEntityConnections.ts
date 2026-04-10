import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { linkContactToEntityAction, unlinkContactFromEntityAction } from './useEntityConnectionHelpers';

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

const emptyConnections = (): ConnectedEntities => ({
  contacts: [], events: [], opportunities: [], quotes: [], tasks: [], artists: [], roadshow_stops: []
});

interface JoinedEntity { id: string; title: string; status: string; }

export const useEntityConnections = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const getContactConnections = async (contactId: string): Promise<ConnectedEntities> => {
    if (!user) return emptyConnections();

    setLoading(true);
    try {
      logger.debug('Recherche des connexions pour contact:', contactId);

      const [eventsRes, opportunitiesRes, quotesRes, tasksRes, taskEntitiesRes, roadshowRes, eventsMapRes, opportunitiesMapRes, quotesMapRes] = await Promise.all([
        supabase.from('events').select('id, title, status, start_date').eq('contact_id', contactId),
        supabase.from('opportunities').select('id, title, status, date').eq('contact_id', contactId),
        supabase.from('quotes').select('id, title, status, created_at').eq('contact_id', contactId),
        supabase.from('tasks').select('id, title, status, due_date').eq('contact_id', contactId),
        supabase.from('task_entities').select('task_id, tasks(id, title, status, due_date)').eq('entity_type', 'contact').eq('entity_id', contactId),
        supabase.from('roadshow_contacts').select('roadshow_stop_id, role, roadshow_stops(id, city, status, event_date)').eq('contact_id', contactId),
        supabase.from('contact_events').select('event_id, centralized_events!inner(id, title, status, start_date)').eq('contact_id', contactId),
        supabase.from('contact_opportunities').select('opportunity_id, role, opportunities(id, title, status, date)').eq('contact_id', contactId),
        supabase.from('contact_quotes').select('quote_id, role, quotes(id, title, status, created_at)').eq('contact_id', contactId),
      ]);

      const connections = emptyConnections();
      const eventMap = new Map<string, EntityConnection>();
      const opportunityMap = new Map<string, EntityConnection>();
      const quoteMap = new Map<string, EntityConnection>();
      const taskMap = new Map<string, EntityConnection>();

      const toConn = (e: any, type: string, dateField: string, role?: string): EntityConnection => ({
        id: e.id, entity_type: type, entity_id: e.id, title: e.title || e.city || '',
        status: e.status, date: e[dateField] || undefined, role
      });

      // Direct events
      eventsRes.data?.forEach(e => eventMap.set(e.id, toConn(e, 'event', 'start_date')));
      // Junction events
      if (eventsMapRes.data && !eventsMapRes.error) {
        eventsMapRes.data.forEach((item: any) => {
          const ev = Array.isArray(item.centralized_events) ? item.centralized_events[0] : item.centralized_events;
          if (ev && !eventMap.has(ev.id)) eventMap.set(ev.id, toConn(ev, 'event', 'start_date'));
        });
      }

      opportunitiesRes.data?.forEach(o => opportunityMap.set(o.id, toConn(o, 'opportunity', 'date')));
      if (opportunitiesMapRes.data) {
        opportunitiesMapRes.data.forEach((item: any) => {
          if (item.opportunities && !opportunityMap.has(item.opportunities.id))
            opportunityMap.set(item.opportunities.id, toConn(item.opportunities, 'opportunity', 'date', item.role));
        });
      }

      quotesRes.data?.forEach(q => quoteMap.set(q.id, toConn(q, 'quote', 'created_at')));
      if (quotesMapRes.data) {
        quotesMapRes.data.forEach((item: any) => {
          if (item.quotes && !quoteMap.has(item.quotes.id))
            quoteMap.set(item.quotes.id, toConn(item.quotes, 'quote', 'created_at', item.role));
        });
      }

      tasksRes.data?.forEach(t => taskMap.set(t.id, toConn(t, 'task', 'due_date')));
      if (taskEntitiesRes.data) {
        taskEntitiesRes.data.forEach((item: any) => {
          if (item.tasks && !taskMap.has(item.tasks.id))
            taskMap.set(item.tasks.id, toConn(item.tasks, 'task', 'due_date'));
        });
      }

      if (roadshowRes.data) {
        roadshowRes.data.forEach((item: any) => {
          if (item.roadshow_stops) {
            connections.roadshow_stops.push({
              id: item.roadshow_stops.id, entity_type: 'roadshow_stop', entity_id: item.roadshow_stops.id,
              title: item.roadshow_stops.city, status: item.roadshow_stops.status,
              date: item.roadshow_stops.event_date || undefined, role: item.role || undefined
            });
          }
        });
      }

      connections.events = Array.from(eventMap.values());
      connections.opportunities = Array.from(opportunityMap.values());
      connections.quotes = Array.from(quoteMap.values());
      connections.tasks = Array.from(taskMap.values());

      return connections;
    } catch (error) {
      logger.error('Erreur lors du chargement des connexions:', error);
      toast.error('Erreur lors du chargement des éléments liés');
      return emptyConnections();
    } finally {
      setLoading(false);
    }
  };

  const linkContactToEntity = async (contactId: string, entityType: string, entityId: string, role = 'primary') => {
    if (!user) return false;
    return linkContactToEntityAction(contactId, entityType, entityId, role, user.id);
  };

  const unlinkContactFromEntity = async (contactId: string, entityType: string, entityId: string) => {
    if (!user) return false;
    return unlinkContactFromEntityAction(contactId, entityType, entityId);
  };

  return { loading, getContactConnections, linkContactToEntity, unlinkContactFromEntity };
};
