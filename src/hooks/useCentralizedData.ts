import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CentralizedArtist {
  id: string;
  user_id: string;
  name: string;
  genre: string;
  status: 'active' | 'inactive';
  upcoming_shows: number;
  total_shows: number;
  current_tour?: string;
  bio?: string;
  image?: string;
  rating?: number;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  created_at: string;
  updated_at: string;
}

export interface Publication {
  id: string;
  user_id: string;
  title: string;
  content: string;
  scheduled_date?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'published' | 'pending_approval';
  assigned_to?: string;
  assigned_username?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  external_link?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  comments: PublicationComment[];
}

export interface PublicationComment {
  id: string;
  publication_id: string;
  user_id: string;
  username: string;
  comment: string;
  created_at: string;
}

export interface CentralizedEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  venue?: string;
  address?: string;
  city?: string;
  country?: string;
  event_type?: string;
  status: string;
  budget_min?: number;
  budget_max?: number;
  attendees_count?: number;
  artist_id?: string;
  image?: string;
  created_at: string;
  updated_at: string;
}

export const useCentralizedData = () => {
  const { user } = useAuth();
  const [artists, setArtists] = useState<CentralizedArtist[]>([]);
  const [publications, setPublications] = useState<Publication[]>([]);
  const [events, setEvents] = useState<CentralizedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch artists - ALL artists, not just user's
      const { data: artistsData, error: artistsError } = await supabase
        .from('centralized_artists')
        .select('*')
        .order('created_at', { ascending: false });

      if (artistsError) throw artistsError;

      // Fetch publications with comments - ALL publications, not just user's
      const { data: publicationsData, error: publicationsError } = await supabase
        .from('publications')
        .select(`
          *,
          publication_comments (*)
        `)
        .order('created_at', { ascending: false });

      if (publicationsError) throw publicationsError;

      // Fetch events - ALL events, not just user's
      const { data: eventsData, error: eventsError } = await supabase
        .from('centralized_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setArtists((artistsData || []) as CentralizedArtist[]);
      setPublications((publicationsData || []).map(pub => ({
        ...pub,
        status: pub.status as 'draft' | 'scheduled' | 'published' | 'pending_approval',
        media_type: pub.media_type as 'image' | 'video' | undefined,
        comments: (pub.publication_comments || []) as PublicationComment[]
      })) as Publication[]);
      setEvents((eventsData || []) as CentralizedEvent[]);
    } catch (error) {
      console.error('Error fetching centralized data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Artist functions
  const addArtist = async (artistData: Omit<CentralizedArtist, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('centralized_artists')
        .insert([{
          ...artistData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setArtists(prev => [...prev, data as CentralizedArtist]);
      return data;
    } catch (error) {
      console.error('Error adding artist:', error);
      toast.error('Erreur lors de l\'ajout de l\'artiste');
      return null;
    }
  };

  const updateArtist = async (id: string, updates: Partial<CentralizedArtist>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('centralized_artists')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArtists(prev => prev.map(artist => 
        artist.id === id ? { ...artist, ...updates } : artist
      ));
    } catch (error) {
      console.error('Error updating artist:', error);
      toast.error('Erreur lors de la mise à jour de l\'artiste');
    }
  };

  const deleteArtist = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('centralized_artists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setArtists(prev => prev.filter(artist => artist.id !== id));
      setEvents(prev => prev.map(event => 
        event.artist_id === id ? { ...event, artist_id: undefined } : event
      ));
    } catch (error) {
      console.error('Error deleting artist:', error);
      toast.error('Erreur lors de la suppression de l\'artiste');
    }
  };

  // Publication functions
  const addPublication = async (pubData: Omit<Publication, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'comments'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('publications')
        .insert([{
          ...pubData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const newPub = { ...data, comments: [] };
      setPublications(prev => [...prev, newPub as Publication]);
      return newPub;
    } catch (error) {
      console.error('Error adding publication:', error);
      toast.error('Erreur lors de l\'ajout de la publication');
      return null;
    }
  };

  const updatePublication = async (id: string, updates: Partial<Publication>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('publications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPublications(prev => prev.map(pub => 
        pub.id === id ? { ...pub, ...updates } : pub
      ));
    } catch (error) {
      console.error('Error updating publication:', error);
      toast.error('Erreur lors de la mise à jour de la publication');
    }
  };

  const deletePublication = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('publications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPublications(prev => prev.filter(pub => pub.id !== id));
    } catch (error) {
      console.error('Error deleting publication:', error);
      toast.error('Erreur lors de la suppression de la publication');
    }
  };

  // Event functions
  const addEvent = async (eventData: Omit<CentralizedEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('centralized_events')
        .insert([{
          ...eventData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setEvents(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error('Erreur lors de l\'ajout de l\'événement');
      return null;
    }
  };

  const updateEvent = async (id: string, updates: Partial<CentralizedEvent>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('centralized_events')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.map(event => 
        event.id === id ? { ...event, ...updates } : event
      ));
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Erreur lors de la mise à jour de l\'événement');
    }
  };

  const deleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('centralized_events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Erreur lors de la suppression de l\'événement');
    }
  };

  // Utility functions
  const getArtist = (id: string) => artists.find(artist => artist.id === id);
  const getPublication = (id: string) => publications.find(pub => pub.id === id);
  const getEvent = (id: string) => events.find(event => event.id === id);

  return {
    artists,
    publications,
    events,
    loading,
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
    refreshData: fetchData
  };
};