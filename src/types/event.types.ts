export interface Event {
  id?: string;
  user_id?: string;
  contact_id?: string;
  artist_id?: string;
  title: string;
  description?: string;
  event_type?: string;
  venue?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  start_date?: string;
  end_date?: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  attendees_count?: number;
  requirements?: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  created_at?: string;
  updated_at?: string;
}
