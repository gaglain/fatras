import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, ArrowRight, Calculator, Edit2, Check, Leaf, Plus, Trash2 } from 'lucide-react';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { useRoadshowSettings } from '@/hooks/useRoadshowSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StopVehicle {
  id?: string;
  vehicle_name: string;
  distance_km: number;
  departure_address: string;
  notes: string;
  isNew?: boolean;
}

interface TourStopTravelInfoProps {
  stopId: string;
  stopAddress?: string;
  stopCity: string;
}

export const TourStopTravelInfo: React.FC<TourStopTravelInfoProps> = ({
  stopId,
  stopAddress,
  stopCity
}) => {
  const { rates, loading: ratesLoading, getDefaultRate } = useVehicleRates();
  const { settings } = useRoadshowSettings();

  const [vehicles, setVehicles] = useState<StopVehicle[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadVehicles = useCallback(async () => {
    if (!stopId) return;

    const { data, error } = await supabase
      .from('roadshow_stop_vehicles' as any)
      .select('*')
      .eq('roadshow_stop_id', stopId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setVehicles((data as any[]).map((v: any) => ({
        id: v.id,
        vehicle_name: v.vehicle_name || '',
        distance_km: Number(v.distance_km) || 0,
        departure_address: v.departure_address || settings.default_departure_address || '',
        notes: v.notes || '',
      })));
    }
    setLoaded(true);
  }, [stopId, settings.default_departure_address]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = () => {
    const defaultRate = getDefaultRate();
    setVehicles(prev => [...prev, {
      vehicle_name: defaultRate?.vehicle_name || '',
      distance_km: 0,
      departure_address: settings.default_departure_address || '',
      notes: '',
      isNew: true,
    }]);
  };

  const updateVehicle = (index: number, field: keyof StopVehicle, value: any) => {
    setVehicles(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const removeVehicle = async (index: number) => {
    const vehicle = vehicles[index];
    if (vehicle.id) {
      const { error } = await supabase
        .from('roadshow_stop_vehicles' as any)
        .delete()
        .eq('id', vehicle.id);
      if (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
    }
    setVehicles(prev => prev.filter((_, i) => i !== index));
    toast.success('Véhicule supprimé');
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      for (const vehicle of vehicles) {
        const payload = {
          roadshow_stop_id: stopId,
          vehicle_name: vehicle.vehicle_name,
          distance_km: vehicle.distance_km,
          departure_address: vehicle.departure_address,
          notes: vehicle.notes,
        };

        if (vehicle.id && !vehicle.isNew) {
          const { error } = await supabase
            .from('roadshow_stop_vehicles' as any)
            .update(payload)
            .eq('id', vehicle.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('roadshow_stop_vehicles' as any)
            .insert(payload);
          if (error) throw error;
        }
      }

      // Also sync first vehicle to legacy fields for backward compatibility
      const firstVehicle = vehicles[0];
      const legacyUpdate: any = {
        vehicle_type: firstVehicle?.vehicle_name || null,
        distance_km: firstVehicle?.distance_km || null,
        departure_address: firstVehicle?.departure_address || null,
      };
      await supabase.from('roadshow_stops').update(legacyUpdate).eq('id', stopId);

      toast.success('Véhicules enregistrés');
      await loadVehicles();
    } catch (error) {
      console.error('Error saving vehicles:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  // Compute totals
  const totalCost = vehicles.reduce((sum, v) => {
    const rate = rates.find(r => r.vehicle_name === v.vehicle_name);
    if (rate && v.distance_km > 0) {
      return sum + (v.distance_km * rate.rate_per_km) + rate.fixed_cost;
    }
    return sum;
  }, 0);

  const totalCo2 = vehicles.reduce((sum, v) => {
    const rate = rates.find(r => r.vehicle_name === v.vehicle_name);
    if (rate && v.distance_km > 0) {
      return sum + v.distance_km * (rate.co2_per_km || 0.21);
    }
    return sum;
  }, 0);

  const totalDistance = vehicles.reduce((sum, v) => sum + (v.distance_km || 0), 0);

  if (rates.length === 0 && !ratesLoading) {
    return (
      <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
        <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400">
          ⚠️ Aucun tarif véhicule configuré. Allez dans Paramètres pour en ajouter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 sm:p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center text-sm sm:text-base">
          <Car className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          Véhicules & Frais de déplacement
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={addVehicle}
          className="h-7 text-xs gap-1"
        >
          <Plus className="h-3 w-3" />
          Véhicule
        </Button>
      </div>

      {vehicles.length === 0 && loaded && (
        <div className="text-center py-4 text-muted-foreground text-xs">
          Aucun véhicule ajouté. Cliquez sur "+ Véhicule" pour commencer.
        </div>
      )}

      {/* Vehicle cards */}
      <div className="space-y-3">
        {vehicles.map((vehicle, index) => {
          const selectedRate = rates.find(r => r.vehicle_name === vehicle.vehicle_name);
          const cost = selectedRate && vehicle.distance_km > 0
            ? (vehicle.distance_km * selectedRate.rate_per_km) + selectedRate.fixed_cost
            : 0;
          const co2 = selectedRate && vehicle.distance_km > 0
            ? vehicle.distance_km * (selectedRate.co2_per_km || 0.21)
            : 0;

          return (
            <div key={vehicle.id || `new-${index}`} className="bg-white dark:bg-card p-3 rounded-lg border border-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  Véhicule {index + 1}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive hover:text-destructive"
                  onClick={() => removeVehicle(index)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {/* Departure → Destination */}
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <Label className="text-[10px] text-muted-foreground uppercase">Départ</Label>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                    <Input
                      value={vehicle.departure_address}
                      onChange={(e) => updateVehicle(index, 'departure_address', e.target.value)}
                      placeholder="Adresse de départ"
                      className="h-7 text-xs bg-background"
                    />
                  </div>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground mt-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <Label className="text-[10px] text-muted-foreground uppercase">Destination</Label>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
                    <p className="text-xs text-foreground truncate">
                      {stopAddress || stopCity}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle type & Distance */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Type</Label>
                  <Select
                    value={vehicle.vehicle_name}
                    onValueChange={(val) => updateVehicle(index, 'vehicle_name', val)}
                    disabled={ratesLoading}
                  >
                    <SelectTrigger className="h-7 text-xs bg-background mt-0.5">
                      <SelectValue placeholder="Véhicule" />
                    </SelectTrigger>
                    <SelectContent>
                      {rates.filter(r => r.vehicle_name).map(rate => (
                        <SelectItem key={rate.id} value={rate.vehicle_name}>
                          <div className="flex items-center gap-2">
                            <span>{rate.vehicle_name}</span>
                            {rate.is_default && (
                              <Badge variant="secondary" className="text-[10px]">Défaut</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRate && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {selectedRate.rate_per_km.toFixed(2)} €/km + {selectedRate.fixed_cost.toFixed(2)} € fixe
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground uppercase">Distance</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    value={vehicle.distance_km || ''}
                    onChange={(e) => updateVehicle(index, 'distance_km', parseFloat(e.target.value) || 0)}
                    placeholder="km"
                    className="h-7 text-xs bg-background mt-0.5"
                  />
                </div>
              </div>

              {/* Notes */}
              <Input
                value={vehicle.notes}
                onChange={(e) => updateVehicle(index, 'notes', e.target.value)}
                placeholder="Notes (ex: covoiturage, péage...)"
                className="h-7 text-xs bg-background"
              />

              {/* Cost display */}
              {selectedRate && vehicle.distance_km > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-between bg-background p-2 rounded border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-1">
                      <Calculator className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Coût</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      {cost.toFixed(2)} €
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-background p-2 rounded border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-1">
                      <Leaf className="h-3 w-3 text-green-500" />
                      <span className="text-[10px] text-muted-foreground">CO₂</span>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-400">
                      {co2 < 1 ? `${(co2 * 1000).toFixed(0)} g` : `${co2.toFixed(1)} kg`}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals */}
      {vehicles.length > 1 && totalDistance > 0 && (
        <div className="bg-white dark:bg-card p-3 rounded-lg border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Calculator className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold text-foreground">Totaux ({vehicles.length} véhicules)</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-[10px] text-muted-foreground">Distance</p>
              <p className="text-sm font-bold text-foreground">{totalDistance.toFixed(1)} km</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">Coût total</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{totalCost.toFixed(2)} €</p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground">CO₂ total</p>
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {totalCo2 < 1 ? `${(totalCo2 * 1000).toFixed(0)} g` : `${totalCo2.toFixed(1)} kg`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Save button */}
      {vehicles.length > 0 && (
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="h-7 sm:h-8 text-xs sm:text-sm"
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      )}
    </div>
  );
};
