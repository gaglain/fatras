
export interface TourStop {
  id: string;
  city: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  checkInTime: string;
  departureTime: string;
  capacity: number;
  ticketsAvailable: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes: string;
  artists: string[];
  createdBy: string;
  accommodation: string;
  accommodationAddress: string;
  localContact: string;
  localContactPhone: string;
  transport: string;
  artistLineup: {userId: string, confirmed: boolean}[];
}

export interface Artist {
  id: string;
  name: string;
  genre: string;
}

export interface FormData {
  city: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  checkInTime: string;
  departureTime: string;
  capacity: string;
  ticketsAvailable: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes: string;
  artists: string[];
  accommodation: string;
  accommodationAddress: string;
  localContact: string;
  localContactPhone: string;
  transport: string;
  artistLineup: {userId: string, confirmed: boolean}[];
}
