import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { RoadshowStop, transformStopFromDB, convertToTourStop, convertFromTourStop } from './useRoadshowStopTransformers';

// Re-export for consumers
export type { RoadshowStop };

interface ArtistLineupItem {
  userId: string;
  confirmed: boolean;
}

const syncEventToNylas = async (eventId: string, trigger: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-event-to-nylas', {
      body: { event_id: eventId, trigger, grant_id_override: '1689aa22-c0cc-48b2-ac09-6f221aff790f' }
    });
    if (error) logger.warn('Nylas sync failed (non-blocking):', error);
    else if (data?.success) logger.info(`Nylas sync ${data.action}: event ${eventId}`);
  } catch (err) { logger.warn('Nylas sync error (non-blocking):', err); }
};

const syncLinkedEventsToNylas = async (stopId: string) => {
  try {
    const { data: links } = await supabase.from('roadshow_stop_events').select('event_id').eq('roadshow_stop_id', stopId);
    if (links?.length) {
      for (const link of links) syncEventToNylas(link.event_id, 'route_sheet_updated');
      logger.info(`Triggered Nylas sync for ${links.length} linked events of stop ${stopId}`);
    }
  } catch (err) { logger.warn('Error syncing linked events:', err); }
};

const syncLineupWithChannel = async (
  stopId: string, newLineup: ArtistLineupItem[], oldLineup: ArtistLineupItem[],
  stopInfo: { city: string; venue: string }
) => {
  try {
    const { data: channel } = await supabase.from('messaging_channels').select('id, name').eq('roadshow_id', stopId).maybeSingle();
    if (!channel) return;

    const oldIds = new Set(oldLineup.map(a => a.userId));
    const newIds = new Set(newLineup.map(a => a.userId));
    const added = newLineup.filter(a => !oldIds.has(a.userId));
    const removed = oldLineup.filter(a => !newIds.has(a.userId));

    for (const artist of added) {
      const { data: existing } = await supabase.from('messaging_channel_members').select('id').eq('channel_id', channel.id).eq('user_id', artist.userId).maybeSingle();
      if (!existing) await supabase.from('messaging_channel_members').insert({ channel_id: channel.id, user_id: artist.userId, role: 'member' });
      await supabase.from('notifications').insert({
        user_id: artist.userId, type: 'roadshow_assignment', title: 'Assignation à une feuille de route',
        message: `Vous avez été ajouté à la feuille de route "${stopInfo.city} - ${stopInfo.venue}". Veuillez confirmer votre disponibilité.`,
        read: false, data: { roadshow_stop_id: stopId, channel_id: channel.id, action: 'confirm_availability' }
      });
    }

    if (added.length > 0) {
      try {
        await supabase.functions.invoke('send-roadshow-assignment-email', {
          body: { userIds: added.map(a => a.userId), stopId, city: stopInfo.city, venue: stopInfo.venue }
        });
      } catch (e) { logger.error('Failed to invoke assignment email function:', e); }
    }

    for (const artist of removed) {
      await supabase.from('messaging_channel_members').delete().eq('channel_id', channel.id).eq('user_id', artist.userId);
    }
  } catch (error) { logger.error('Error syncing lineup with channel:', error); }
};

export const useRoadshowStops = () => {
  const { user } = useAuth();
  const [stops, setStops] = useState<RoadshowStop[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStops = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('roadshow_stops').select('*').eq('is_archived', false).order('event_date', { ascending: true });
      if (error) throw error;
      setStops((data || []).map(transformStopFromDB));
    } catch (error) { logger.error('Error fetching roadshow stops:', error); }
    finally { setLoading(false); }
  };

  const createStop = async (stopData: Partial<RoadshowStop>) => {
    if (!user) return null;
    try {
      const { data, error } = await (supabase.from('roadshow_stops').insert({
        user_id: user.id, city: stopData.city!, venue: stopData.venue!,
        address: stopData.address, event_date: stopData.event_date || null, event_time: stopData.event_time || null,
        check_in_time: stopData.check_in_time || null, departure_time: stopData.departure_time || null,
        meeting_point_time: stopData.meeting_point_time || null, meeting_point_location: stopData.meeting_point_location || null,
        departure_to_show_time: stopData.departure_to_show_time || null, soundcheck_time: stopData.soundcheck_time || null,
        doors_time: stopData.doors_time || null, show_start_time: stopData.show_start_time || null,
        show_end_time: stopData.show_end_time || null, curfew_time: stopData.curfew_time || null,
        meal_time: stopData.meal_time || null, meal_location: stopData.meal_location || null,
        capacity: stopData.capacity || 0, tickets_available: stopData.tickets_available || 0,
        status: stopData.status || 'pending', crew: stopData.crew || [], equipment: stopData.equipment || [],
        notes: stopData.notes, artists: stopData.artists || [],
        accommodation: stopData.accommodation, accommodation_address: stopData.accommodation_address,
        local_contact: stopData.local_contact, local_contact_phone: stopData.local_contact_phone,
        transport: stopData.transport, artist_lineup: stopData.artist_lineup || [], invitations: stopData.invitations
      } as any).select().single()) as any;
      if (error) throw error;
      const transformed = transformStopFromDB(data);
      setStops(prev => [...prev, transformed]);
      return transformed;
    } catch (error) { logger.error('Error creating roadshow stop:', error); return null; }
  };

  const updateStop = async (stopId: string, stopData: Partial<RoadshowStop>) => {
    if (!user) return null;
    try {
      const currentStop = stops.find(s => s.id === stopId);
      const oldLineup = currentStop?.artist_lineup || [];

      const { data, error } = await (supabase.from('roadshow_stops').update({
        city: stopData.city, venue: stopData.venue, address: stopData.address,
        event_date: stopData.event_date || null, event_time: stopData.event_time || null,
        check_in_time: stopData.check_in_time || null, departure_time: stopData.departure_time || null,
        meeting_point_time: stopData.meeting_point_time || null, meeting_point_location: stopData.meeting_point_location || null,
        departure_to_show_time: stopData.departure_to_show_time || null, soundcheck_time: stopData.soundcheck_time || null,
        doors_time: stopData.doors_time || null, show_start_time: stopData.show_start_time || null,
        show_end_time: stopData.show_end_time || null, curfew_time: stopData.curfew_time || null,
        meal_time: stopData.meal_time || null, meal_location: stopData.meal_location || null,
        capacity: stopData.capacity, tickets_available: stopData.tickets_available, status: stopData.status,
        crew: stopData.crew, equipment: stopData.equipment, notes: stopData.notes, artists: stopData.artists,
        accommodation: stopData.accommodation, accommodation_address: stopData.accommodation_address,
        local_contact: stopData.local_contact, local_contact_phone: stopData.local_contact_phone,
        transport: stopData.transport, artist_lineup: stopData.artist_lineup, invitations: stopData.invitations
      } as any).eq('id', stopId).select().single()) as any;
      if (error) throw error;

      const transformed = transformStopFromDB(data);
      const newLineup = stopData.artist_lineup || [];
      if (JSON.stringify(newLineup) !== JSON.stringify(oldLineup)) {
        await syncLineupWithChannel(stopId, newLineup, oldLineup, { city: data.city, venue: data.venue });
      }
      setStops(prev => prev.map(s => s.id === stopId ? transformed : s));
      syncLinkedEventsToNylas(stopId);
      return transformed;
    } catch (error) { logger.error('Error updating roadshow stop:', error); return null; }
  };

  const archiveStop = async (stopId: string) => {
    if (!user) return false;
    try {
      const { error } = await (supabase.from('roadshow_stops').update({ is_archived: true } as any).eq('id', stopId)) as any;
      if (error) throw error;
      setStops(prev => prev.filter(s => s.id !== stopId));
      return true;
    } catch (error) { logger.error('Error archiving roadshow stop:', error); return false; }
  };

  const restoreStop = async (stopId: string) => {
    if (!user) return false;
    try {
      const { error } = await (supabase.from('roadshow_stops').update({ is_archived: false } as any).eq('id', stopId)) as any;
      if (error) throw error;
      await fetchStops();
      return true;
    } catch (error) { logger.error('Error restoring roadshow stop:', error); return false; }
  };

  const fetchArchivedStops = async (): Promise<RoadshowStop[]> => {
    if (!user) return [];
    try {
      const { data, error } = await supabase.from('roadshow_stops').select('*').eq('is_archived', true).order('event_date', { ascending: false });
      if (error) throw error;
      return (data || []).map(s => ({ ...transformStopFromDB(s), is_archived: true }));
    } catch (error) { logger.error('Error fetching archived stops:', error); return []; }
  };

  useEffect(() => { if (user) fetchStops(); }, [user]);

  return {
    stops, loading, fetchStops, createStop, updateStop, archiveStop, restoreStop, fetchArchivedStops,
    convertToTourStop, convertFromTourStop,
    tourStops: stops.map(convertToTourStop)
  };
};
