import React, { createContext, useContext, useState, useEffect } from 'react';

// Types centralisés
export interface Artist {
  id: string;
  name: string;
  genre: string;
  status: 'active' | 'inactive';
  upcomingShows: number;
  totalShows: number;
  currentTour?: string;
  bio?: string;
  image?: string;
  rating?: number;
  contact?: {
    email?: string;
    phone?: string;
  };
  social?: {
    website?: string;
    instagram?: string;
    facebook?: string;
  };
}

export interface Publication {
  id: string;
  title: string;
  content: string;
  scheduled_date: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'pending_approval';
  assigned_to?: string;
  assigned_username?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  external_link?: string;
  comments: PublicationComment[];
  created_by: string;
  created_at: string;
}

export interface PublicationComment {
  id: string;
  user_id: string;
  username: string;
  comment: string;
  created_at: string;
}

export interface Event {
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
  artistId?: string;
  image?: string;
}

interface CentralizedData {
  artists: Artist[];
  publications: Publication[];
  events: Event[];
  // Actions pour les artistes
  addArtist: (artist: Omit<Artist, 'id'>) => void;
  updateArtist: (id: string, artist: Partial<Artist>) => void;
  deleteArtist: (id: string) => void;
  getArtist: (id: string) => Artist | undefined;
  // Actions pour les publications
  addPublication: (publication: Omit<Publication, 'id'>) => void;
  updatePublication: (id: string, publication: Partial<Publication>) => void;
  deletePublication: (id: string) => void;
  getPublication: (id: string) => Publication | undefined;
  // Actions pour les événements
  addEvent: (event: Omit<Event, 'id'>) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  getEvent: (id: string) => Event | undefined;
  // Utilitaires
  refreshData: () => void;
}

const CentralizedDataContext = createContext<CentralizedData | undefined>(undefined);

// Données initiales d'exemple
const initialArtists: Artist[] = [
  {
    id: '1',
    name: 'The Midnight Express',
    genre: 'Rock',
    status: 'active',
    upcomingShows: 8,
    totalShows: 150,
    currentTour: 'Tournée Rock Été 2024',
    bio: 'Groupe de rock emblématique avec plus de 10 ans de carrière et une présence scénique électrisante.',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400',
    rating: 4.9,
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
    status: 'active',
    upcomingShows: 3,
    totalShows: 45,
    bio: 'Artiste folk avec une voix envoûtante et des compositions originales qui touche le cœur.',
    image: 'https://images.unsplash.com/photo-1494790108755-2616c056ca66?w=400',
    rating: 4.7,
    contact: {
      email: 'sarah@sarahmitchell.music'
    }
  },
  {
    id: '3',
    name: 'Thunder Road',
    genre: 'Rock Classique',
    status: 'active',
    upcomingShows: 12,
    totalShows: 89,
    currentTour: 'Tournée Legends Never Die',
    bio: 'Trio de rock classique qui fait revivre les plus grands hits avec une énergie moderne.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    rating: 4.8
  }
];

export const CentralizedDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🚀 CentralizedDataProvider - Initializing...');

  const [artists, setArtists] = useState<Artist[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  // Charger les données au démarrage
  useEffect(() => {
    console.log('🔄 Loading centralized data...');
    loadData();
  }, []);

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    if (artists.length > 0 || publications.length > 0 || events.length > 0) {
      saveData();
    }
  }, [artists, publications, events]);

  const loadData = () => {
    try {
      const saved = localStorage.getItem('centralized_app_data');
      if (saved) {
        const data = JSON.parse(saved);
        console.log('📖 Loaded data:', data);
        setArtists(data.artists || initialArtists);
        setPublications(data.publications || []);
        setEvents(data.events || []);
      } else {
        console.log('📖 No saved data, using initial data');
        setArtists(initialArtists);
        setPublications([]);
        setEvents([]);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      setArtists(initialArtists);
      setPublications([]);
      setEvents([]);
    }
  };

  const saveData = () => {
    try {
      const dataToSave = {
        artists,
        publications,
        events,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem('centralized_app_data', JSON.stringify(dataToSave));
      console.log('💾 Data saved successfully');
    } catch (error) {
      console.error('❌ Error saving data:', error);
    }
  };

  const addArtist = (artistData: Omit<Artist, 'id'>) => {
    const newArtist: Artist = {
      ...artistData,
      id: `artist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    console.log('➕ Adding artist:', newArtist);
    setArtists(prev => [...prev, newArtist]);
  };

  const updateArtist = (id: string, updates: Partial<Artist>) => {
    console.log('✏️ Updating artist:', id, updates);
    setArtists(prev => prev.map(artist => 
      artist.id === id ? { ...artist, ...updates } : artist
    ));
  };

  const deleteArtist = (id: string) => {
    console.log('🗑️ Deleting artist:', id);
    setArtists(prev => prev.filter(artist => artist.id !== id));
    setEvents(prev => prev.map(event => 
      event.artistId === id ? { ...event, artistId: undefined } : event
    ));
  };

  const getArtist = (id: string) => {
    return artists.find(artist => artist.id === id);
  };

  const addPublication = (pubData: Omit<Publication, 'id'>) => {
    const newPublication: Publication = {
      ...pubData,
      id: `pub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    console.log('➕ Adding publication:', newPublication);
    setPublications(prev => [...prev, newPublication]);
  };

  const updatePublication = (id: string, updates: Partial<Publication>) => {
    console.log('✏️ Updating publication:', id, updates);
    setPublications(prev => prev.map(pub => 
      pub.id === id ? { ...pub, ...updates } : pub
    ));
  };

  const deletePublication = (id: string) => {
    console.log('🗑️ Deleting publication:', id);
    setPublications(prev => prev.filter(pub => pub.id !== id));
  };

  const getPublication = (id: string) => {
    return publications.find(pub => pub.id === id);
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    console.log('➕ Adding event:', newEvent);
    setEvents(prev => [...prev, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    console.log('✏️ Updating event:', id, updates);
    setEvents(prev => prev.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  const deleteEvent = (id: string) => {
    console.log('🗑️ Deleting event:', id);
    setEvents(prev => prev.filter(event => event.id !== id));
  };

  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };

  const refreshData = () => {
    console.log('🔄 Refreshing data...');
    loadData();
  };

  console.log('📊 Current state - Artists:', artists.length, 'Publications:', publications.length, 'Events:', events.length);

  return (
    <CentralizedDataContext.Provider value={{
      artists,
      publications,
      events,
      addArtist,
      updateArtist,
      deleteArtist,
      getArtist,
      addPublication,
      updatePublication,
      deletePublication,
      getPublication,
      addEvent,
      updateEvent,
      deleteEvent,
      getEvent,
      refreshData
    }}>
      {children}
    </CentralizedDataContext.Provider>
  );
};

export const useCentralizedData = () => {
  const context = useContext(CentralizedDataContext);
  if (context === undefined) {
    throw new Error('useCentralizedData must be used within a CentralizedDataProvider');
  }
  return context;
};
