import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface OpportunityStats {
  totalOpportunities: number;
  totalBudget: number;
  weightedRevenue: number;
  averageProbability: number;
  byStatus: {
    open: { count: number; budget: number; weightedRevenue: number };
    applied: { count: number; budget: number; weightedRevenue: number };
    won: { count: number; budget: number; weightedRevenue: number };
    lost: { count: number; budget: number; weightedRevenue: number };
  };
}

export const useOpportunityStats = () => {
  const [stats, setStats] = useState<OpportunityStats>({
    totalOpportunities: 0,
    totalBudget: 0,
    weightedRevenue: 0,
    averageProbability: 0,
    byStatus: {
      open: { count: 0, budget: 0, weightedRevenue: 0 },
      applied: { count: 0, budget: 0, weightedRevenue: 0 },
      won: { count: 0, budget: 0, weightedRevenue: 0 },
      lost: { count: 0, budget: 0, weightedRevenue: 0 }
    }
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const { data: opportunities, error } = await supabase
          .from('opportunities')
          .select('budget, probability_percentage, status');

        if (error) throw error;

        if (opportunities) {
          const totalOpportunities = opportunities.length;
          const totalBudget = opportunities.reduce((sum, opp) => sum + (opp.budget || 0), 0);
          const weightedRevenue = opportunities.reduce((sum, opp) => {
            const probability = (opp.probability_percentage || 50) / 100;
            return sum + ((opp.budget || 0) * probability);
          }, 0);
          const averageProbability = opportunities.length > 0 
            ? opportunities.reduce((sum, opp) => sum + (opp.probability_percentage || 50), 0) / opportunities.length
            : 0;

          const byStatus = {
            open: { count: 0, budget: 0, weightedRevenue: 0 },
            applied: { count: 0, budget: 0, weightedRevenue: 0 },
            won: { count: 0, budget: 0, weightedRevenue: 0 },
            lost: { count: 0, budget: 0, weightedRevenue: 0 }
          };

          opportunities.forEach(opp => {
            const status = opp.status as keyof typeof byStatus;
            if (byStatus[status]) {
              byStatus[status].count += 1;
              byStatus[status].budget += opp.budget || 0;
              byStatus[status].weightedRevenue += ((opp.budget || 0) * ((opp.probability_percentage || 50) / 100));
            }
          });

          setStats({
            totalOpportunities,
            totalBudget,
            weightedRevenue,
            averageProbability,
            byStatus
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats d\'opportunités:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return { stats, loading };
};