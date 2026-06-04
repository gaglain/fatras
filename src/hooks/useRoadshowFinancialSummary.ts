import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { logger } from '@/lib/logger';

export interface StopFinancialSummary {
  stopId: string;
  city: string;
  venue: string;
  date: string;
  totalExpenses: number;
  totalExpensesHT: number;
  totalQuotes: number;
  travelCost: number;
  margin: number;
  marginPercent: number | null;
  expenseCount: number;
  quoteCount: number;
}

export interface GlobalFinancialSummary {
  totalExpenses: number;
  totalExpensesHT: number;
  totalQuotes: number;
  totalTravelCosts: number;
  totalCosts: number; // expenses + travel
  globalMargin: number;
  globalMarginPercent: number | null;
  stopCount: number;
}

export const useRoadshowFinancialSummary = (
  stopIds: string[],
  stopsData: { id: string; city: string; venue: string; date: string; travelCost?: number }[]
) => {
  const { rates } = useVehicleRates();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [stopSummaries, setStopSummaries] = useState<StopFinancialSummary[]>([]);
  const [globalSummary, setGlobalSummary] = useState<GlobalFinancialSummary>({
    totalExpenses: 0,
    totalExpensesHT: 0,
    totalQuotes: 0,
    totalTravelCosts: 0,
    totalCosts: 0,
    globalMargin: 0,
    globalMarginPercent: null,
    stopCount: 0,
  });

  const fetchSummary = useCallback(async () => {
    if (!user || stopIds.length === 0) return;

    setLoading(true);
    try {
      // Fetch all expenses for all stops
      const { data: expenses, error: expError } = await supabase
        .from('roadshow_expenses')
        .select('roadshow_stop_id, amount, tax_rate')
        .in('roadshow_stop_id', stopIds);

      if (expError) throw expError;

      // Fetch all vehicles from new table for travel costs
      const { data: vehiclesData } = await supabase
        .from('roadshow_stop_vehicles' as any)
        .select('roadshow_stop_id, vehicle_name, distance_km')
        .in('roadshow_stop_id', stopIds);

      // Fetch all linked quotes via roadshow_stop_quotes
      const { data: quoteLinks, error: qlError } = await supabase
        .from('roadshow_stop_quotes')
        .select('roadshow_stop_id, quote_id')
        .in('roadshow_stop_id', stopIds);

      if (qlError) throw qlError;

      // Fetch quote amounts
      let quotesMap: Record<string, number> = {};
      if (quoteLinks && quoteLinks.length > 0) {
        const quoteIds = [...new Set(quoteLinks.map(ql => ql.quote_id))];
        const { data: quotes, error: qError } = await supabase
          .from('quotes')
          .select('id, total_amount, tax_amount')
          .in('id', quoteIds);

        if (qError) throw qError;
        quotes?.forEach(q => {
          quotesMap[q.id] = q.total_amount || 0;
        });
      }

      // Group expenses by stop
      const expensesByStop: Record<string, { total: number; count: number }> = {};
      expenses?.forEach(exp => {
        if (!expensesByStop[exp.roadshow_stop_id]) {
          expensesByStop[exp.roadshow_stop_id] = { total: 0, count: 0 };
        }
        expensesByStop[exp.roadshow_stop_id].total += exp.amount || 0;
        expensesByStop[exp.roadshow_stop_id].count += 1;
      });

      // Group quotes by stop
      const quotesByStop: Record<string, { total: number; count: number }> = {};
      quoteLinks?.forEach(ql => {
        if (!quotesByStop[ql.roadshow_stop_id]) {
          quotesByStop[ql.roadshow_stop_id] = { total: 0, count: 0 };
        }
        quotesByStop[ql.roadshow_stop_id].total += quotesMap[ql.quote_id] || 0;
        quotesByStop[ql.roadshow_stop_id].count += 1;
      });

      // Compute travel costs from vehicles table
      const travelByStop: Record<string, number> = {};
      (vehiclesData as any[] || []).forEach((v: any) => {
        const rate = rates.find(r => r.vehicle_name === v.vehicle_name);
        if (rate && v.distance_km > 0) {
          const cost = (Number(v.distance_km) * rate.rate_per_km) + rate.fixed_cost;
          travelByStop[v.roadshow_stop_id] = (travelByStop[v.roadshow_stop_id] || 0) + cost;
        }
      });

      // Build per-stop summaries
      const summaries: StopFinancialSummary[] = stopsData.map(stop => {
        const expData = expensesByStop[stop.id] || { total: 0, count: 0 };
        const quoteData = quotesByStop[stop.id] || { total: 0, count: 0 };
        const travel = travelByStop[stop.id] || stop.travelCost || 0;
        const totalCosts = expData.total + travel;
        const margin = quoteData.total - totalCosts;

        return {
          stopId: stop.id,
          city: stop.city,
          venue: stop.venue,
          date: stop.date,
          totalExpenses: expData.total,
          totalQuotes: quoteData.total,
          travelCost: travel,
          margin,
          marginPercent: quoteData.total > 0 ? (margin / quoteData.total) * 100 : null,
          expenseCount: expData.count,
          quoteCount: quoteData.count,
        };
      });

      // Filter to only stops with data
      const activeSummaries = summaries.filter(
        s => s.totalExpenses > 0 || s.totalQuotes > 0 || s.travelCost > 0
      );

      setStopSummaries(activeSummaries);

      // Global
      const totExp = activeSummaries.reduce((a, s) => a + s.totalExpenses, 0);
      const totQuotes = activeSummaries.reduce((a, s) => a + s.totalQuotes, 0);
      const totTravel = activeSummaries.reduce((a, s) => a + s.travelCost, 0);
      const totCosts = totExp + totTravel;
      const gMargin = totQuotes - totCosts;

      setGlobalSummary({
        totalExpenses: totExp,
        totalQuotes: totQuotes,
        totalTravelCosts: totTravel,
        totalCosts: totCosts,
        globalMargin: gMargin,
        globalMarginPercent: totQuotes > 0 ? (gMargin / totQuotes) * 100 : null,
        stopCount: activeSummaries.length,
      });
    } catch (error) {
      logger.error('Error fetching financial summary:', error);
    } finally {
      setLoading(false);
    }
  }, [user, stopIds.join(','), stopsData.length, rates]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { stopSummaries, globalSummary, loading, refetch: fetchSummary };
};
