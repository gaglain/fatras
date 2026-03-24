import React, { useEffect, useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Calculator, MapPin, Pencil, Trash2, Plus, ArrowRight, Leaf } from 'lucide-react';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { AddVehicleDialog } from './AddVehicleDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface StopVehicleEntry {
  id?: string;
  vehicle_name: string;
  distance_km: number;
  departure_address: string;
  notes: string;
  isNew?: boolean;
}

interface TravelCostsFormProps {
  roadshowStopId?: string;
  initialVehicleType?: string;
  initialDistanceKm?: number;
  onVehicleChange?: (vehicleType: string) => void;
  onDistanceChange?: (distanceKm: number) => void;
}

export const TravelCostsForm: React.FC<TravelCostsFormProps> = ({
  roadshowStopId,
}) => {
  const { rates, loading: ratesLoading, getDefaultRate, createRate, updateRate, deleteRate } = useVehicleRates();
  const [vehicles, setVehicles] = useState<StopVehicleEntry[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const loadVehicles = useCallback(async () => {
    if (!roadshowStopId) return;

    const { data, error } = await supabase
      .from('roadshow_stop_vehicles' as any)
      .select('*')
      .eq('roadshow_stop_id', roadshowStopId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setVehicles((data as any[]).map((v: any) => ({
        id: v.id,
        vehicle_name: v.vehicle_name || '',
        distance_km: Number(v.distance_km) || 0,
        departure_address: v.departure_address || '',
        notes: v.notes || '',
      })));
    }
    setLoaded(true);
  }, [roadshowStopId]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const addVehicle = () => {
    const defaultRate = getDefaultRate();
    setVehicles(prev => [...prev, {
      vehicle_name: defaultRate?.vehicle_name || '',
      distance_km: 0,
      departure_address: '',
      notes: '',
      isNew: true,
    }]);
  };

  const updateVehicleField = (index: number, field: keyof StopVehicleEntry, value: any) => {
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
    if (!roadshowStopId) {
      toast.error("Sauvegardez d'abord la feuille de route");
      return;
    }

    setIsSaving(true);
    try {
      for (const vehicle of vehicles) {
        const payload = {
          roadshow_stop_id: roadshowStopId,
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

      // Sync first vehicle to legacy fields for backward compatibility
      const firstVehicle = vehicles[0];
      const legacyUpdate: any = {
        vehicle_type: firstVehicle?.vehicle_name || null,
        distance_km: firstVehicle?.distance_km || null,
        departure_address: firstVehicle?.departure_address || null,
      };
      await supabase.from('roadshow_stops').update(legacyUpdate).eq('id', roadshowStopId);

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

  if (!roadshowStopId) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Créez d'abord la feuille de route pour ajouter les frais de déplacement.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Car className="h-5 w-5" />
          <span>Frais de déplacement</span>
        </div>
        <Button variant="outline" size="sm" onClick={addVehicle} className="gap-1">
          <Plus className="h-3.5 w-3.5" />
          Ajouter un véhicule
        </Button>
      </div>

      {vehicles.length === 0 && loaded && (
        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
          <Car className="h-8 w-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm">Aucun véhicule ajouté.</p>
          <p className="text-xs mt-1">Cliquez sur "Ajouter un véhicule" pour commencer.</p>
        </div>
      )}

      {/* Vehicle entries */}
      <div className="space-y-4">
        {vehicles.map((vehicle, index) => {
          const selectedRate = rates.find(r => r.vehicle_name === vehicle.vehicle_name);
          const cost = selectedRate && vehicle.distance_km > 0
            ? (vehicle.distance_km * selectedRate.rate_per_km) + selectedRate.fixed_cost
            : 0;
          const co2 = selectedRate && vehicle.distance_km > 0
            ? vehicle.distance_km * (selectedRate.co2_per_km || 0.21)
            : 0;

          return (
            <Card key={vehicle.id || `new-${index}`} className="border">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Véhicule {index + 1}</span>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer ce véhicule ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ce véhicule et ses données de trajet seront supprimés de cette étape.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => removeVehicle(index)}>Supprimer</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Véhicule utilisé</Label>
                    <div className="flex items-center gap-2">
                      <Select
                        value={vehicle.vehicle_name}
                        onValueChange={(val) => updateVehicleField(index, 'vehicle_name', val)}
                        disabled={ratesLoading}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un véhicule" />
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
                      {index === 0 && <AddVehicleDialog onSave={createRate} />}
                    </div>
                    {selectedRate && (
                      <p className="text-[10px] text-muted-foreground">
                        {selectedRate.rate_per_km.toFixed(2)} €/km + {selectedRate.fixed_cost.toFixed(2)} € fixe
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Distance (km)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.1"
                      value={vehicle.distance_km || ''}
                      onChange={(e) => updateVehicleField(index, 'distance_km', parseFloat(e.target.value) || 0)}
                      placeholder="Distance en km"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Adresse de départ</Label>
                  <Input
                    value={vehicle.departure_address}
                    onChange={(e) => updateVehicleField(index, 'departure_address', e.target.value)}
                    placeholder="Adresse de départ"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Notes</Label>
                  <Input
                    value={vehicle.notes}
                    onChange={(e) => updateVehicleField(index, 'notes', e.target.value)}
                    placeholder="Ex: covoiturage, péage, parking..."
                  />
                </div>

                {/* Cost display */}
                {selectedRate && vehicle.distance_km > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-md border">
                      <div className="flex items-center gap-1.5">
                        <Calculator className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Coût</span>
                      </div>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                        {cost.toFixed(2)} €
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-muted/30 p-2.5 rounded-md border">
                      <div className="flex items-center gap-1.5">
                        <Leaf className="h-3.5 w-3.5 text-green-500" />
                        <span className="text-xs text-muted-foreground">CO₂</span>
                      </div>
                      <span className="text-base font-bold text-green-600 dark:text-green-400">
                        {co2 < 1 ? `${(co2 * 1000).toFixed(0)} g` : `${co2.toFixed(1)} kg`}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Totals (when multiple vehicles) */}
      {vehicles.length > 1 && totalDistance > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Totaux ({vehicles.length} véhicules)</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="text-lg font-bold">{totalDistance.toFixed(1)} km</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Coût total</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{totalCost.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">CO₂ total</p>
                <p className="text-lg font-bold text-green-600 dark:text-green-400">
                  {totalCo2 < 1 ? `${(totalCo2 * 1000).toFixed(0)} g` : `${totalCo2.toFixed(1)} kg`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      {vehicles.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSaveAll} disabled={isSaving}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer les véhicules'}
          </Button>
        </div>
      )}

      {/* Vehicle rate management */}
      {rates.length > 0 && (
        <div className="space-y-2 pt-4 border-t">
          <Label className="text-sm font-medium">Tarifs véhicules configurés</Label>
          <div className="space-y-1">
            {rates.map(rate => (
              <div
                key={rate.id}
                className="flex items-center justify-between p-2 rounded-md border bg-card text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Car className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <span className="font-medium truncate">{rate.vehicle_name}</span>
                  {rate.is_default && (
                    <Badge variant="secondary" className="text-[10px] shrink-0">Défaut</Badge>
                  )}
                  <span className="text-muted-foreground text-xs shrink-0">
                    {rate.rate_per_km.toFixed(2)} €/km
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <AddVehicleDialog
                    onSave={(data) => updateRate(rate.id, data)}
                    editingVehicle={rate}
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    }
                  />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Supprimer « {rate.vehicle_name} » ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Ce véhicule et ses tarifs seront définitivement supprimés.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteRate(rate.id)}>
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {rates.length === 0 && !ratesLoading && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          ⚠️ Aucun tarif véhicule configuré. Utilisez le bouton "+" pour en créer un.
        </p>
      )}
    </div>
  );
};
