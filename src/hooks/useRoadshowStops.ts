import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { TourStop } from '@/types/roadshow.types';

export interface RoadshowStop {
  id: string;
  user_id: string;
  city: string;
  venue: string;
  address?: string;
  event_date?: string;
  event_time?: string;
  check_in_time?: string;
  departure_time?: string;
  capacity: number;
  tickets_available: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes?: string;
  artists: string[];
  accommodation?: string;
  accommodation_address?: string;
  local_contact?: string;
  local_contact_phone?: string;
  transport?: string;
  artist_lineup: {userId: string, confirmed: boolean}[];
  created_at: string;
  updated_at: string;
}

export const useRoadshowStops = () => {
  const { user } = useAuth();
  const [stops, setStops] = useState<RoadshowStop[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch roadshow stops from database
  const fetchStops = async () => {
    if (!user) return;

    try {
      console.log('📍 Fetching roadshow stops for user:', user.id);
      const { data, error } = await supabase
        .from('roadshow_stops')
        .select('*')
        .eq('user_id', user.id)
        .order('event_date', { ascending: true });

      if (error) throw error;

      console.log('📍 Fetched stops:', data?.length || 0);
      // Transform data to match our RoadshowStop interface
      const transformedStops: RoadshowStop[] = (data || []).map(stop => ({
        id: stop.id,
        user_id: stop.user_id,
        city: stop.city,
        venue: stop.venue,
        address: stop.address,
        event_date: stop.event_date,
        event_time: stop.event_time,
        check_in_time: stop.check_in_time,
        departure_time: stop.departure_time,
        capacity: stop.capacity,
        tickets_available: stop.tickets_available,
        status: stop.status as 'confirmed' | 'pending' | 'cancelled',
        crew: stop.crew,
        equipment: stop.equipment,
        notes: stop.notes,
        artists: stop.artists,
        accommodation: stop.accommodation,
        accommodation_address: stop.accommodation_address,
        local_contact: stop.local_contact,
        local_contact_phone: stop.local_contact_phone,
        transport: stop.transport,
        artist_lineup: Array.isArray(stop.artist_lineup) ? stop.artist_lineup.map((item: any) => ({
          userId: item.userId || '',
          confirmed: item.confirmed || false
        })) : [],
        created_at: stop.created_at,
        updated_at: stop.updated_at
      }));

      setStops(transformedStops);
    } catch (error) {
      console.error('Error fetching roadshow stops:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create a new roadshow stop
  const createStop = async (stopData: Partial<RoadshowStop>) => {
    if (!user) return null;

    try {
      console.log('📍 Creating new roadshow stop:', stopData);
      const { data, error } = await supabase
        .from('roadshow_stops')
        .insert({
          user_id: user.id,
          city: stopData.city!,
          venue: stopData.venue!,
          address: stopData.address,
          event_date: stopData.event_date || null,
          event_time: stopData.event_time || null,
          check_in_time: stopData.check_in_time || null,
          departure_time: stopData.departure_time || null,
          capacity: stopData.capacity || 0,
          tickets_available: stopData.tickets_available || 0,
          status: stopData.status || 'pending',
          crew: stopData.crew || [],
          equipment: stopData.equipment || [],
          notes: stopData.notes,
          artists: stopData.artists || [],
          accommodation: stopData.accommodation,
          accommodation_address: stopData.accommodation_address,
          local_contact: stopData.local_contact,
          local_contact_phone: stopData.local_contact_phone,
          transport: stopData.transport,
          artist_lineup: stopData.artist_lineup || []
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Roadshow stop created:', data);
      // Transform the returned data to match our interface
      const transformedStop: RoadshowStop = {
        id: data.id,
        user_id: data.user_id,
        city: data.city,
        venue: data.venue,
        address: data.address,
        event_date: data.event_date,
        event_time: data.event_time,
        check_in_time: data.check_in_time,
        departure_time: data.departure_time,
        capacity: data.capacity,
        tickets_available: data.tickets_available,
        status: data.status as 'confirmed' | 'pending' | 'cancelled',
        crew: data.crew,
        equipment: data.equipment,
        notes: data.notes,
        artists: data.artists,
        accommodation: data.accommodation,
        accommodation_address: data.accommodation_address,
        local_contact: data.local_contact,
        local_contact_phone: data.local_contact_phone,
        transport: data.transport,
        artist_lineup: Array.isArray(data.artist_lineup) ? data.artist_lineup.map((item: any) => ({
          userId: item.userId || '',
          confirmed: item.confirmed || false
        })) : [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setStops(prev => [...prev, transformedStop]);
      // Force refresh from database to ensure consistency
      await fetchStops();
      return transformedStop;
    } catch (error) {
      console.error('Error creating roadshow stop:', error);
      return null;
    }
  };

  // Update a roadshow stop
  const updateStop = async (stopId: string, stopData: Partial<RoadshowStop>) => {
    if (!user) return null;

    try {
      console.log('📍 Updating roadshow stop:', stopId, stopData);
      const { data, error } = await supabase
        .from('roadshow_stops')
        .update({
          city: stopData.city,
          venue: stopData.venue,
          address: stopData.address,
          event_date: stopData.event_date || null,
          event_time: stopData.event_time || null,
          check_in_time: stopData.check_in_time || null,
          departure_time: stopData.departure_time || null,
          capacity: stopData.capacity,
          tickets_available: stopData.tickets_available,
          status: stopData.status,
          crew: stopData.crew,
          equipment: stopData.equipment,
          notes: stopData.notes,
          artists: stopData.artists,
          accommodation: stopData.accommodation,
          accommodation_address: stopData.accommodation_address,
          local_contact: stopData.local_contact,
          local_contact_phone: stopData.local_contact_phone,
          transport: stopData.transport,
          artist_lineup: stopData.artist_lineup
        })
        .eq('id', stopId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Roadshow stop updated:', data);
      // Transform the returned data to match our interface
      const transformedStop: RoadshowStop = {
        id: data.id,
        user_id: data.user_id,
        city: data.city,
        venue: data.venue,
        address: data.address,
        event_date: data.event_date,
        event_time: data.event_time,
        check_in_time: data.check_in_time,
        departure_time: data.departure_time,
        capacity: data.capacity,
        tickets_available: data.tickets_available,
        status: data.status as 'confirmed' | 'pending' | 'cancelled',
        crew: data.crew,
        equipment: data.equipment,
        notes: data.notes,
        artists: data.artists,
        accommodation: data.accommodation,
        accommodation_address: data.accommodation_address,
        local_contact: data.local_contact,
        local_contact_phone: data.local_contact_phone,
        transport: data.transport,
        artist_lineup: Array.isArray(data.artist_lineup) ? data.artist_lineup.map((item: any) => ({
          userId: item.userId || '',
          confirmed: item.confirmed || false
        })) : [],
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      setStops(prev => prev.map(stop => stop.id === stopId ? transformedStop : stop));
      return transformedStop;
    } catch (error) {
      console.error('Error updating roadshow stop:', error);
      return null;
    }
  };

  // Delete a roadshow stop
  const deleteStop = async (stopId: string) => {
    if (!user) return false;

    try {
      console.log('📍 Deleting roadshow stop:', stopId);
      const { error } = await supabase
        .from('roadshow_stops')
        .delete()
        .eq('id', stopId)
        .eq('user_id', user.id);

      if (error) throw error;

      console.log('✅ Roadshow stop deleted');
      setStops(prev => prev.filter(stop => stop.id !== stopId));
      return true;
    } catch (error) {
      console.error('Error deleting roadshow stop:', error);
      return false;
    }
  };

  // Convert database format to TourStop format for compatibility
  const convertToTourStop = (stop: RoadshowStop): TourStop => ({
    id: stop.id,
    city: stop.city,
    venue: stop.venue,
    address: stop.address || '',
    date: stop.event_date || '',
    time: stop.event_time || '',
    checkInTime: stop.check_in_time || '',
    departureTime: stop.departure_time || '',
    capacity: stop.capacity,
    ticketsAvailable: stop.tickets_available,
    status: stop.status,
    crew: stop.crew,
    equipment: stop.equipment,
    notes: stop.notes || '',
    artists: stop.artists,
    createdBy: stop.user_id,
    accommodation: stop.accommodation || '',
    accommodationAddress: stop.accommodation_address || '',
    localContact: stop.local_contact || '',
    localContactPhone: stop.local_contact_phone || '',
    transport: stop.transport || '',
    artistLineup: stop.artist_lineup
  });

  // Convert TourStop format to database format
  const convertFromTourStop = (tourStop: Partial<TourStop>): Partial<RoadshowStop> => ({
    city: tourStop.city,
    venue: tourStop.venue,
    address: tourStop.address,
    event_date: tourStop.date || null,
    event_time: tourStop.time || null,
    check_in_time: tourStop.checkInTime || null,
    departure_time: tourStop.departureTime || null,
    capacity: tourStop.capacity,
    tickets_available: tourStop.ticketsAvailable,
    status: tourStop.status,
    crew: tourStop.crew,
    equipment: tourStop.equipment,
    notes: tourStop.notes,
    artists: tourStop.artists,
    accommodation: tourStop.accommodation,
    accommodation_address: tourStop.accommodationAddress,
    local_contact: tourStop.localContact,
    local_contact_phone: tourStop.localContactPhone,
    transport: tourStop.transport,
    artist_lineup: tourStop.artistLineup || []
  });

  useEffect(() => {
    if (user) {
      fetchStops();
    }
  }, [user]);

  return {
    stops,
    loading,
    fetchStops,
    createStop,
    updateStop,
    deleteStop,
    convertToTourStop,
    convertFromTourStop,
    // Helper to get stops as TourStop format
    tourStops: stops.map(convertToTourStop)
  };
};