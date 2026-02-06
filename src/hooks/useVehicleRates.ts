import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface VehicleRate {
  id: string;
  user_id: string;
  vehicle_name: string;
  rate_per_km: number;
  fixed_cost: number;
  co2_per_km: number;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useVehicleRates = () => {
  const { user } = useAuth();
  const [rates, setRates] = useState<VehicleRate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('vehicle_rates')
        .select('*')
        .order('vehicle_name', { ascending: true });

      if (error) throw error;

      setRates((data || []).map(r => ({
        ...r,
        rate_per_km: Number(r.rate_per_km),
        fixed_cost: Number(r.fixed_cost || 0),
        co2_per_km: Number((r as any).co2_per_km || 0.21)
      })));
    } catch (error) {
      console.error('Error fetching vehicle rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRate = async (rateData: Partial<VehicleRate>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('vehicle_rates')
        .insert({
          user_id: user.id,
          vehicle_name: rateData.vehicle_name!,
          rate_per_km: rateData.rate_per_km || 0.50,
          fixed_cost: rateData.fixed_cost || 0,
          co2_per_km: rateData.co2_per_km || 0.21,
          description: rateData.description,
          is_default: rateData.is_default || false
        } as any)
        .select()
        .single();

      if (error) throw error;

      const newRate = {
        ...data,
        rate_per_km: Number(data.rate_per_km),
        fixed_cost: Number(data.fixed_cost || 0),
        co2_per_km: Number((data as any).co2_per_km || 0.21)
      };
      
      setRates(prev => [...prev, newRate]);
      toast.success('Tarif véhicule créé');
      return newRate;
    } catch (error) {
      console.error('Error creating vehicle rate:', error);
      toast.error('Erreur lors de la création du tarif');
      return null;
    }
  };

  const updateRate = async (rateId: string, rateData: Partial<VehicleRate>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('vehicle_rates')
        .update({
          vehicle_name: rateData.vehicle_name,
          rate_per_km: rateData.rate_per_km,
          fixed_cost: rateData.fixed_cost,
          co2_per_km: rateData.co2_per_km,
          description: rateData.description,
          is_default: rateData.is_default
        } as any)
        .eq('id', rateId)
        .select()
        .single();

      if (error) throw error;

      const updatedRate = {
        ...data,
        rate_per_km: Number(data.rate_per_km),
        fixed_cost: Number(data.fixed_cost || 0),
        co2_per_km: Number((data as any).co2_per_km || 0.21)
      };

      setRates(prev => prev.map(r => r.id === rateId ? updatedRate : r));
      toast.success('Tarif véhicule mis à jour');
      return updatedRate;
    } catch (error) {
      console.error('Error updating vehicle rate:', error);
      toast.error('Erreur lors de la mise à jour du tarif');
      return null;
    }
  };

  const deleteRate = async (rateId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('vehicle_rates')
        .delete()
        .eq('id', rateId);

      if (error) throw error;

      setRates(prev => prev.filter(r => r.id !== rateId));
      toast.success('Tarif véhicule supprimé');
      return true;
    } catch (error) {
      console.error('Error deleting vehicle rate:', error);
      toast.error('Erreur lors de la suppression du tarif');
      return false;
    }
  };

  const getDefaultRate = () => {
    return rates.find(r => r.is_default) || rates[0];
  };

  const getRateByName = (vehicleName: string) => {
    return rates.find(r => r.vehicle_name === vehicleName);
  };

  useEffect(() => {
    if (user) {
      fetchRates();
    }
  }, [user]);

  return {
    rates,
    loading,
    fetchRates,
    createRate,
    updateRate,
    deleteRate,
    getDefaultRate,
    getRateByName
  };
};
