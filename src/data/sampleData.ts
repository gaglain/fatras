
import { Artist, TourStop } from '../types/roadshow.types';

export const sampleArtists: Artist[] = [
  { id: '1', name: 'The Midnight Express', genre: 'Rock' },
  { id: '2', name: 'Sarah Mitchell', genre: 'Folk' },
  { id: '3', name: 'Jazz Collective', genre: 'Jazz' },
  { id: '4', name: 'Electronic Dreams', genre: 'Electronic' }
];

export const sampleTourStops: TourStop[] = [
  {
    id: '1',
    city: 'Paris',
    venue: 'L\'Olympia',
    address: '28 Boulevard des Capucines, 75009 Paris',
    date: '2024-07-15',
    time: '20:00',
    checkInTime: '14:00',
    departureTime: '23:30',
    capacity: 2000,
    ticketsAvailable: 500,
    status: 'confirmed',
    crew: ['John Doe', 'Jane Smith'],
    equipment: ['Sound System', 'Lighting'],
    notes: 'VIP backstage access required',
    artists: ['1', '2'],
    createdBy: 'user-1',
    accommodation: 'Hôtel Mercure',
    accommodationAddress: '20 Rue de la Paix, 75002 Paris',
    localContact: 'Jean Dupont',
    localContactPhone: '+33 6 12 34 56 78',
    transport: 'Tour bus',
    artistLineup: [{userId: 'user-2', confirmed: true}, {userId: 'user-3', confirmed: false}]
  },
  {
    id: '2',
    city: 'Lyon',
    venue: 'Le Transbordeur',
    address: '3 Boulevard Stalingrad, 69100 Villeurbanne',
    date: '2024-07-18',
    time: '21:00',
    checkInTime: '15:00',
    departureTime: '00:00',
    capacity: 1500,
    ticketsAvailable: 200,
    status: 'pending',
    crew: ['Mike Wilson'],
    equipment: ['Sound System'],
    notes: 'Waiting for final confirmation',
    artists: ['1'],
    createdBy: 'user-1',
    accommodation: 'Pas de logement',
    accommodationAddress: '',
    localContact: 'Marie Martin',
    localContactPhone: '+33 6 98 76 54 32',
    transport: 'Train',
    artistLineup: [{userId: 'user-2', confirmed: true}]
  }
];
