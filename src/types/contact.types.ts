
export interface Contact {
  id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  company?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  status: string;
  source?: string;
  notes?: string;
  tags?: string[];
  role: string;
  created_at?: string;
  updated_at?: string;
}
