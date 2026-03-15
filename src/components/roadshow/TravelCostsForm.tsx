import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Car, Calculator, MapPin, Pencil, Trash2 } from 'lucide-react';
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

interface TravelCostsFormProps {
  roadshowStopId?: string;
  initialVehicleType?: string;
  initialDistanceKm?: number;
  onVehicleChange?: (vehicleType: string) => void;
  onDistanceChange?: (distanceKm: number) => void;
}

export const TravelCostsForm: React.FC<TravelCostsFormProps> = ({
  roadshowStopId,
  initialVehicleType,
  initialDistanceKm,
  onVehicleChange,
  onDistanceChange
}) => {
  const { rates, loading: ratesLoading, getDefaultRate, createRate, updateRate, deleteRate } = useVehicleRates();
  const [vehicleType, setVehicleType] = useState(initialVehicleType || '');
  const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm || 0);
  const [isSaving, setIsSaving] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<typeof rates[0] | null>(null);

  // Load existing data from database
  useEffect(() => {
    const loadData = async () => {
      if (!roadshowStopId) return;
      
      const { data, error } = await supabase
        .from('roadshow_stops')
        .select('vehicle_type, distance_km')
        .eq('id', roadshowStopId)
        .single();
      
      if (!error && data) {
        if (data.vehicle_type) setVehicleType(data.vehicle_type);
        if (data.distance_km) setDistanceKm(Number(data.distance_km));
      }
    };
    
    loadData();
  }, [roadshowStopId]);

  // Set default vehicle if none selected
  useEffect(() => {
    if (!vehicleType && rates.length > 0) {
      const defaultRate = getDefaultRate();
      if (defaultRate) {
        setVehicleType(defaultRate.vehicle_name);
      }
    }
  }, [rates, vehicleType, getDefaultRate]);

  const selectedRate = rates.find(r => r.vehicle_name === vehicleType);
  const calculatedCost = selectedRate 
    ? (distanceKm * selectedRate.rate_per_km) + selectedRate.fixed_cost
    : 0;

  const handleVehicleChange = (value: string) => {
    setVehicleType(value);
    onVehicleChange?.(value);
  };

  const handleDistanceChange = (value: string) => {
    const km = parseFloat(value) || 0;
    setDistanceKm(km);
    onDistanceChange?.(km);
  };

  const handleSave = async () => {
    if (!roadshowStopId) {
      toast.error('Sauvegardez d\'abord la feuille de route');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('roadshow_stops')
        .update({
          vehicle_type: vehicleType,
          distance_km: distanceKm
        })
        .eq('id', roadshowStopId);

      if (error) throw error;
      toast.success('Frais de route enregistrés');
    } catch (error) {
      console.error('Error saving travel costs:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearCosts = async () => {
    if (!roadshowStopId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('roadshow_stops')
        .update({
          vehicle_type: null,
          distance_km: null
        })
        .eq('id', roadshowStopId);

      if (error) throw error;
      setVehicleType('');
      setDistanceKm(0);
      toast.success('Frais de route supprimés');
    } catch (error) {
      console.error('Error clearing travel costs:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVehicle = async (rateId: string, vehicleName: string) => {
    const success = await deleteRate(rateId);
    if (success && vehicleType === vehicleName) {
      setVehicleType('');
    }
  };

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
      <div className="flex items-center gap-2 text-lg font-medium">
        <Car className="h-5 w-5" />
        <span>Frais de déplacement</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicle-select">Véhicule utilisé</Label>
          <div className="flex items-center gap-2">
            <Select
              value={vehicleType}
              onValueChange={handleVehicleChange}
              disabled={ratesLoading}
            >
              <SelectTrigger id="vehicle-select" className="flex-1">
                <SelectValue placeholder="Sélectionner un véhicule" />
              </SelectTrigger>
              <SelectContent>
                {rates.filter(rate => rate.vehicle_name).map(rate => (
                  <SelectItem key={rate.id} value={rate.vehicle_name}>
                    <div className="flex items-center gap-2">
                      <span>{rate.vehicle_name}</span>
                      {rate.is_default && (
                        <Badge variant="secondary" className="text-xs">Défaut</Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddVehicleDialog onSave={createRate} />
          </div>
          {selectedRate && (
            <p className="text-xs text-muted-foreground">
              {selectedRate.rate_per_km.toFixed(2)} €/km + {selectedRate.fixed_cost.toFixed(2)} € fixe
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="distance-input">Distance (km)</Label>
          <Input
            id="distance-input"
            type="number"
            min="0"
            step="0.1"
            value={distanceKm || ''}
            onChange={(e) => handleDistanceChange(e.target.value)}
            placeholder="Distance en km"
          />
        </div>
      </div>

      {/* Cost calculation */}
      {selectedRate && distanceKm > 0 && (
        <Card className="bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Coût estimé:</span>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {calculatedCost.toFixed(2)} €
                </div>
                <div className="text-xs text-muted-foreground">
                  ({distanceKm} km × {selectedRate.rate_per_km.toFixed(2)} €) + {selectedRate.fixed_cost.toFixed(2)} € fixe
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isSaving || (!vehicleType && distanceKm === 0)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Supprimer les frais
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer les frais de route ?</AlertDialogTitle>
              <AlertDialogDescription>
                Le véhicule et la distance seront supprimés de cette étape. Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleClearCosts}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Enregistrement...' : 'Enregistrer les frais'}
        </Button>
      </div>

      {/* Vehicle list with edit/delete */}
      {rates.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">Véhicules configurés</Label>
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
                        <AlertDialogAction onClick={() => handleDeleteVehicle(rate.id, rate.vehicle_name)}>
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
