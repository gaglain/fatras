import { TourStop } from '@/types/roadshow.types';

interface ArtistLineupItem {
  userId: string;
  confirmed: boolean;
}

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
  meeting_point_time?: string;
  meeting_point_location?: string;
  departure_to_show_time?: string;
  soundcheck_time?: string;
  doors_time?: string;
  show_start_time?: string;
  show_end_time?: string;
  curfew_time?: string;
  meal_time?: string;
  meal_location?: string;
  capacity: number;
  tickets_available: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes?: string;
  artists: string[];
  accommodation?: string;
  accommodation_address?: string;
  has_dressing_room?: boolean;
  dressing_room_address?: string;
  local_contact?: string;
  local_contact_phone?: string;
  technical_contact_name?: string;
  technical_contact_email?: string;
  technical_contact_phone?: string;
  transport?: string;
  artist_lineup: { userId: string; confirmed: boolean }[];
  invitations?: string;
  latitude?: number;
  longitude?: number;
  vehicle_type?: string;
  distance_km?: number;
  estimated_expenses?: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export const transformStopFromDB = (stop: any): RoadshowStop => ({
  id: stop.id,
  user_id: stop.user_id,
  city: stop.city,
  venue: stop.venue,
  address: stop.address,
  event_date: stop.event_date,
  event_time: stop.event_time,
  check_in_time: stop.check_in_time,
  departure_time: stop.departure_time,
  meeting_point_time: (stop as any).meeting_point_time,
  meeting_point_location: (stop as any).meeting_point_location,
  departure_to_show_time: (stop as any).departure_to_show_time,
  soundcheck_time: (stop as any).soundcheck_time,
  doors_time: (stop as any).doors_time,
  show_start_time: (stop as any).show_start_time,
  show_end_time: (stop as any).show_end_time,
  curfew_time: (stop as any).curfew_time,
  meal_time: (stop as any).meal_time,
  meal_location: (stop as any).meal_location,
  capacity: stop.capacity,
  tickets_available: stop.tickets_available,
  status: stop.status as 'confirmed' | 'pending' | 'cancelled',
  crew: stop.crew,
  equipment: stop.equipment,
  notes: stop.notes,
  artists: stop.artists,
  accommodation: stop.accommodation,
  accommodation_address: stop.accommodation_address,
  has_dressing_room: stop.has_dressing_room ?? false,
  dressing_room_address: stop.dressing_room_address,
  local_contact: stop.local_contact,
  local_contact_phone: stop.local_contact_phone,
  technical_contact_name: stop.technical_contact_name,
  technical_contact_email: stop.technical_contact_email,
  technical_contact_phone: stop.technical_contact_phone,
  transport: stop.transport,
  artist_lineup: Array.isArray(stop.artist_lineup)
    ? (stop.artist_lineup as unknown as ArtistLineupItem[]).map((item) => ({
        userId: item.userId || '',
        confirmed: item.confirmed || false
      }))
    : [],
  invitations: stop.invitations,
  latitude: stop.latitude,
  longitude: stop.longitude,
  vehicle_type: stop.vehicle_type,
  distance_km: stop.distance_km ? Number(stop.distance_km) : undefined,
  is_archived: stop.is_archived || false,
  created_at: stop.created_at,
  updated_at: stop.updated_at,
});

export const convertToTourStop = (stop: RoadshowStop): TourStop => ({
  id: stop.id,
  city: stop.city,
  venue: stop.venue,
  address: stop.address || '',
  date: stop.event_date || '',
  time: stop.event_time || '',
  checkInTime: stop.check_in_time || '',
  departureTime: stop.departure_time || '',
  meetingPointTime: stop.meeting_point_time,
  meetingPointLocation: stop.meeting_point_location,
  departureToShowTime: stop.departure_to_show_time,
  soundcheckTime: stop.soundcheck_time,
  doorsTime: stop.doors_time,
  showStartTime: stop.show_start_time,
  showEndTime: stop.show_end_time,
  curfewTime: stop.curfew_time,
  mealTime: stop.meal_time,
  mealLocation: stop.meal_location,
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
  hasDressingRoom: stop.has_dressing_room ?? false,
  dressingRoomAddress: stop.dressing_room_address || '',
  localContact: stop.local_contact || '',
  localContactPhone: stop.local_contact_phone || '',
  technicalContactName: stop.technical_contact_name || '',
  technicalContactEmail: stop.technical_contact_email || '',
  technicalContactPhone: stop.technical_contact_phone || '',
  transport: stop.transport || '',
  artistLineup: stop.artist_lineup,
  invitations: stop.invitations || '',
  vehicleType: stop.vehicle_type,
  distanceKm: stop.distance_km,
});

export const convertFromTourStop = (tourStop: Partial<TourStop>): Partial<RoadshowStop> => ({
  city: tourStop.city,
  venue: tourStop.venue,
  address: tourStop.address,
  event_date: tourStop.date || null,
  event_time: tourStop.time || null,
  check_in_time: tourStop.checkInTime || null,
  departure_time: tourStop.departureTime || null,
  meeting_point_time: tourStop.meetingPointTime || null,
  meeting_point_location: tourStop.meetingPointLocation || null,
  departure_to_show_time: tourStop.departureToShowTime || null,
  soundcheck_time: tourStop.soundcheckTime || null,
  doors_time: tourStop.doorsTime || null,
  show_start_time: tourStop.showStartTime || null,
  show_end_time: tourStop.showEndTime || null,
  curfew_time: tourStop.curfewTime || null,
  meal_time: tourStop.mealTime || null,
  meal_location: tourStop.mealLocation || null,
  capacity: tourStop.capacity,
  tickets_available: tourStop.ticketsAvailable,
  status: tourStop.status,
  crew: tourStop.crew,
  equipment: tourStop.equipment,
  notes: tourStop.notes,
  artists: tourStop.artists,
  accommodation: tourStop.accommodation,
  accommodation_address: tourStop.accommodationAddress,
  has_dressing_room: tourStop.hasDressingRoom ?? false,
  dressing_room_address: tourStop.dressingRoomAddress || null,
  local_contact: tourStop.localContact,
  local_contact_phone: tourStop.localContactPhone,
  technical_contact_name: tourStop.technicalContactName,
  technical_contact_email: tourStop.technicalContactEmail,
  technical_contact_phone: tourStop.technicalContactPhone,
  transport: tourStop.transport,
  artist_lineup: tourStop.artistLineup || [],
  invitations: tourStop.invitations,
  vehicle_type: tourStop.vehicleType,
  distance_km: tourStop.distanceKm,
} as any);
