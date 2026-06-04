
export interface TourStop {
  id: string;
  city: string;
  venue: string;
  address: string;
  date: string;
  time: string;
  checkInTime: string;
  departureTime: string;
  meetingPointTime?: string;
  meetingPointLocation?: string;
  departureToShowTime?: string;
  soundcheckTime?: string;
  doorsTime?: string;
  showStartTime?: string;
  showEndTime?: string;
  curfewTime?: string;
  mealTime?: string;
  mealLocation?: string;
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
  hasDressingRoom?: boolean;
  dressingRoomAddress?: string;
  localContact: string;
  localContactPhone: string;
  technicalContactName?: string;
  technicalContactEmail?: string;
  technicalContactPhone?: string;
  transport: string;
  artistLineup: {userId: string, confirmed: boolean, declined?: boolean}[];
  invitations: string;
  vehicleType?: string;
  distanceKm?: number;
  estimatedExpenses?: number;
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
  meetingPointTime?: string;
  meetingPointLocation?: string;
  departureToShowTime?: string;
  soundcheckTime?: string;
  doorsTime?: string;
  showStartTime?: string;
  showEndTime?: string;
  curfewTime?: string;
  mealTime?: string;
  mealLocation?: string;
  capacity: string;
  ticketsAvailable: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  crew: string[];
  equipment: string[];
  notes: string;
  artists: string[];
  accommodation: string;
  accommodationAddress: string;
  hasDressingRoom?: boolean;
  dressingRoomAddress?: string;
  localContact: string;
  localContactPhone: string;
  technicalContactName?: string;
  technicalContactEmail?: string;
  technicalContactPhone?: string;
  transport: string;
  artistLineup: {userId: string, confirmed: boolean, declined?: boolean}[];
  invitations: string;
  vehicleType?: string;
  distanceKm?: number;
}
