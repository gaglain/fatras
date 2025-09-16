import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  description: string;
  venue: string;
  location: string;
  date: string;
  budget: number;
  probability_percentage: number;
  status: 'open' | 'applied' | 'won' | 'lost';
  deadline: string;
  requirements: string;
  contact: string;
  artist_id?: string;
  contact_id?: string;
  event_id?: string;
  task_id?: string;
  created_at: string;
  updated_at: string;
}

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchOpportunities = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data && !error) {
        const opportunitiesData: Opportunity[] = data.map(opp => ({
          id: opp.id,
          user_id: opp.user_id,
          title: opp.title,
          description: opp.description || '',
          venue: opp.venue || '',
          location: opp.location || '',
          date: opp.date || '',
          budget: opp.budget || 0,
          probability_percentage: opp.probability_percentage || 50,
          status: opp.status as 'open' | 'applied' | 'won' | 'lost',
          deadline: opp.deadline || '',
          requirements: opp.requirements || '',
          contact: opp.contact || '',
          artist_id: opp.artist_id || '',
          contact_id: opp.contact_id || '',
          event_id: opp.event_id || '',
          task_id: opp.task_id || '',
          created_at: opp.created_at,
          updated_at: opp.updated_at
        }));
        setOpportunities(opportunitiesData);
      }
      setLoading(false);
    };

    fetchOpportunities();
  }, [user]);

  const addOpportunity = async (opportunityData: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          user_id: opportunityData.user_id,
          title: opportunityData.title,
          description: opportunityData.description,
          venue: opportunityData.venue,
          location: opportunityData.location,
          date: opportunityData.date || null,
          budget: opportunityData.budget,
          probability_percentage: opportunityData.probability_percentage,
          status: opportunityData.status,
          deadline: opportunityData.deadline || null,
          requirements: opportunityData.requirements,
          contact: opportunityData.contact,
          artist_id: opportunityData.artist_id || null,
          contact_id: opportunityData.contact_id || null,
          event_id: opportunityData.event_id || null,
          task_id: opportunityData.task_id || null
        })
        .select()
        .single();

      if (error) throw error;

      const newOpportunity: Opportunity = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description || '',
        venue: data.venue || '',
        location: data.location || '',
        date: data.date || '',
        budget: data.budget || 0,
        probability_percentage: data.probability_percentage || 50,
        status: data.status as 'open' | 'applied' | 'won' | 'lost',
        deadline: data.deadline || '',
        requirements: data.requirements || '',
        contact: data.contact || '',
        artist_id: data.artist_id || '',
        contact_id: data.contact_id || '',
        event_id: data.event_id || '',
        task_id: data.task_id || '',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setOpportunities(prev => [newOpportunity, ...prev]);
      return newOpportunity;
    } catch (error) {
      console.error('Erreur lors de la création de l\'opportunité:', error);
      throw error;
    }
  };

  const updateOpportunity = async (id: string, updates: Partial<Opportunity>) => {
    const { data, error } = await supabase
      .from('opportunities')
      .update({
        title: updates.title,
        description: updates.description,
        venue: updates.venue,
        location: updates.location,
        date: updates.date || null,
        budget: updates.budget,
        probability_percentage: updates.probability_percentage,
        status: updates.status,
        deadline: updates.deadline || null,
        requirements: updates.requirements,
        contact: updates.contact,
        artist_id: updates.artist_id || null,
        contact_id: updates.contact_id || null,
        event_id: updates.event_id || null,
        task_id: updates.task_id || null
      })
      .eq('id', id)
      .select()
      .single();

    if (data && !error) {
      setOpportunities(prev => prev.map(opp => 
        opp.id === id ? { ...opp, ...updates } : opp
      ));
    }
  };

  const deleteOpportunity = async (id: string) => {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('id', id);

    if (!error) {
      setOpportunities(prev => prev.filter(opp => opp.id !== id));
    }
  };

  return {
    opportunities,
    loading,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity
  };
};