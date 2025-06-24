
import { useState, useEffect } from 'react';

// Types pour les données du back-office
export interface BackofficeArtist {
  id: string;
  name: string;
  genre: string;
  bio: string;
  image?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
  social?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
  rating?: number;
  totalShows?: number;
  upcomingShows?: number;
}

export interface BackofficeEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  eventType?: string;
  status: string;
  budgetMin?: number;
  budgetMax?: number;
  attendeesCount?: number;
  artist?: string;
  image?: string;
}

export interface BackofficeProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  category?: string;
  status: string;
  images?: string[];
  stockQuantity?: number;
  variations?: {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
    attributes?: any;
  }[];
}

// Hook pour récupérer les artistes
export const useBackofficeArtists = () => {
  const [artists, setArtists] = useState<BackofficeArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArtists = () => {
      // Pour l'instant, on charge des données d'exemple
      // Plus tard, cela sera connecté à Supabase
      const sampleArtists: BackofficeArtist[] = [
        {
          id: '1',
          name: 'The Midnight Express',
          genre: 'Rock',
          bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière et une présence scénique électrisante.',
          image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
          rating: 4.9,
          totalShows: 150,
          upcomingShows: 8,
          contact: {
            email: 'contact@midnightexpress.com',
            phone: '+33 1 23 45 67 89'
          },
          social: {
            website: 'https://midnightexpress.com',
            instagram: '@midnightexpress',
            facebook: 'midnightexpressband'
          }
        },
        {
          id: '2',
          name: 'Sarah Mitchell',
          genre: 'Folk/Acoustique',
          bio: 'Artiste folk avec une voix envoûtante et des compositions originales qui touchent le cœur.',
          image: 'https://images.unsplash.com/photo-1494790108755-2616c056ca66?w=400',
          rating: 4.7,
          totalShows: 45,
          upcomingShows: 3,
          contact: {
            email: 'sarah@sarahmitchell.music'
          }
        },
        {
          id: '3',
          name: 'Thunder Road',
          genre: 'Rock Classique',
          bio: 'Trio de rock classique qui fait revivre les plus grands hits avec une énergie moderne.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
          rating: 4.8,
          totalShows: 89,
          upcomingShows: 12
        }
      ];

      setArtists(sampleArtists);
      setLoading(false);
    };

    loadArtists();
  }, []);

  return { artists, loading };
};

// Hook pour récupérer les événements
export const useBackofficeEvents = () => {
  const [events, setEvents] = useState<BackofficeEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEvents = () => {
      const sampleEvents: BackofficeEvent[] = [
        {
          id: '1',
          title: 'Summer Festival 2024',
          description: 'Le plus grand festival de musique de l\'été avec nos meilleurs artistes',
          startDate: '2024-07-15T20:00:00Z',
          venue: 'Central Park',
          address: '123 Avenue des Champs',
          city: 'Paris',
          country: 'France',
          eventType: 'Festival',
          status: 'confirmed',
          budgetMin: 50000,
          budgetMax: 80000,
          attendeesCount: 5000,
          artist: 'The Midnight Express',
          image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400'
        },
        {
          id: '2',
          title: 'Acoustic Night',
          description: 'Soirée acoustique intimiste dans un cadre exceptionnel',
          startDate: '2024-06-20T19:30:00Z',
          venue: 'Blue Note Jazz Club',
          city: 'Lyon',
          country: 'France',
          eventType: 'Concert',
          status: 'confirmed',
          budgetMin: 5000,
          budgetMax: 8000,
          attendeesCount: 200,
          artist: 'Sarah Mitchell'
        },
        {
          id: '3',
          title: 'Rock Legends Tour',
          description: 'Tournée des légendes du rock à travers la France',
          startDate: '2024-08-10T21:00:00Z',
          venue: 'Zenith',
          city: 'Marseille',
          country: 'France',
          eventType: 'Concert',
          status: 'confirmed',
          budgetMin: 25000,
          budgetMax: 35000,
          attendeesCount: 3000,
          artist: 'Thunder Road'
        }
      ];

      setEvents(sampleEvents);
      setLoading(false);
    };

    loadEvents();
  }, []);

  return { events, loading };
};

// Hook pour récupérer les produits
export const useBackofficeProducts = () => {
  const [products, setProducts] = useState<BackofficeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = () => {
      const sampleProducts: BackofficeProduct[] = [
        {
          id: '1',
          name: 'T-shirt Logo Band',
          description: 'T-shirt officiel avec logo du groupe The Midnight Express',
          price: 25.99,
          category: 'Vêtements',
          status: 'active',
          images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
          stockQuantity: 50,
          variations: [
            { id: '1a', name: 'S - Noir', price: 25.99, stockQuantity: 10, attributes: { size: 'S', color: 'Noir' } },
            { id: '1b', name: 'M - Noir', price: 25.99, stockQuantity: 15, attributes: { size: 'M', color: 'Noir' } },
            { id: '1c', name: 'L - Blanc', price: 27.99, stockQuantity: 8, attributes: { size: 'L', color: 'Blanc' } }
          ]
        },
        {
          id: '2',
          name: 'Album Vinyle Collector',
          description: 'Edition limitée vinyle collector de Thunder Road',
          price: 35.00,
          category: 'Musique',
          status: 'active',
          images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'],
          stockQuantity: 20
        },
        {
          id: '3',
          name: 'Casquette Thunder Road',
          description: 'Casquette officielle de la tournée Thunder Road',
          price: 20.00,
          category: 'Accessoires',
          status: 'active',
          images: ['https://images.unsplash.com/photo-1588099768523-f4e6ee8d3c45?w=400'],
          stockQuantity: 43,
          variations: [
            { id: '3a', name: 'Noir', price: 20.00, stockQuantity: 25, attributes: { color: 'Noir' } },
            { id: '3b', name: 'Bleu', price: 20.00, stockQuantity: 18, attributes: { color: 'Bleu' } }
          ]
        },
        {
          id: '4',
          name: 'Poster Concert Vintage',
          description: 'Poster de collection des concerts vintage de Sarah Mitchell',
          price: 15.00,
          category: 'Décoration',
          status: 'active',
          images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'],
          stockQuantity: 30
        }
      ];

      setProducts(sampleProducts);
      setLoading(false);
    };

    loadProducts();
  }, []);

  return { products, loading };
};
