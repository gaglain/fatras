import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, MapPin, ArrowRight, Calculator, Edit2, Check, Leaf } from 'lucide-react';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { useRoadshowSettings } from '@/hooks/useRoadshowSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

  const [vehicleType, setVehicleType] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [departureAddress, setDepartureAddress] = useState('');
  const [isEditingDeparture, setIsEditingDeparture] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load existing data
  useEffect(() => {
    const loadData = async () => {
      if (!stopId) return;

      const { data, error } = await supabase
        .from('roadshow_stops')
        .select('vehicle_type, distance_km')
        .eq('id', stopId)
        .maybeSingle();

      // Also fetch departure_address via raw query since types may not be updated yet
      const { data: extraData } = await supabase
        .from('roadshow_stops')
        .select('departure_address' as any)
        .eq('id', stopId)
        .maybeSingle() as any;

      if (!error && data) {
        if (data.vehicle_type) setVehicleType(data.vehicle_type);
        if (data.distance_km) setDistanceKm(Number(data.distance_km));
        const depAddr = extraData?.departure_address;
        setDepartureAddress(depAddr || settings.default_departure_address || '');
      } else {
        setDepartureAddress(settings.default_departure_address || '');
      }
      setLoaded(true);
    };

    loadData();
  }, [stopId, settings.default_departure_address]);

  // Set default vehicle
  useEffect(() => {
    if (!vehicleType && rates.length > 0 && loaded) {
      const defaultRate = getDefaultRate();
      if (defaultRate) {
        setVehicleType(defaultRate.vehicle_name);
      }
    }
  }, [rates, vehicleType, getDefaultRate, loaded]);

  const selectedRate = rates.find(r => r.vehicle_name === vehicleType);
  const calculatedCost = selectedRate && distanceKm > 0
    ? (distanceKm * selectedRate.rate_per_km) + selectedRate.fixed_cost
    : 0;
  const co2Emission = selectedRate && distanceKm > 0
    ? distanceKm * (selectedRate.co2_per_km || 0.21)
    : 0;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData: any = {
        vehicle_type: vehicleType,
        distance_km: distanceKm,
        departure_address: departureAddress
      };
      const { error } = await supabase
        .from('roadshow_stops')
        .update(updateData)
        .eq('id', stopId);

      if (error) throw error;
      toast.success('Infos trajet enregistrées');
    } catch (error) {
      console.error('Error saving travel info:', error);
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  if (rates.length === 0 && !ratesLoading) {
    return (
      <div className="bg-amber-50 p-3 rounded-lg">
        <p className="text-xs sm:text-sm text-amber-700">
          ⚠️ Aucun tarif véhicule configuré. Allez dans Paramètres pour en ajouter.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 p-3 sm:p-4 rounded-lg space-y-3">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center text-sm sm:text-base">
        <Car className="h-3 w-3 sm:h-4 sm:w-4 mr-2 text-blue-600 flex-shrink-0" />
        Trajet & Frais de déplacement
      </h3>

      {/* Itinéraire: Départ → Arrivée */}
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <Label className="text-[10px] sm:text-xs text-gray-500 uppercase">Point de départ</Label>
          {isEditingDeparture ? (
            <div className="flex items-center gap-1 mt-1">
              <Input
                value={departureAddress}
                onChange={(e) => setDepartureAddress(e.target.value)}
                placeholder="Adresse de départ"
                className="h-7 sm:h-8 text-xs sm:text-sm bg-white"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 flex-shrink-0"
                onClick={() => setIsEditingDeparture(false)}
              >
                <Check className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
              <p className="text-xs sm:text-sm text-gray-700 truncate">
                {departureAddress || 'Non défini'}
              </p>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 flex-shrink-0 opacity-60 hover:opacity-100"
                onClick={() => setIsEditingDeparture(true)}
              >
                <Edit2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          )}
        </div>

        <ArrowRight className="h-4 w-4 text-gray-400 mt-5 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <Label className="text-[10px] sm:text-xs text-gray-500 uppercase">Destination</Label>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-red-500 flex-shrink-0" />
            <p className="text-xs sm:text-sm text-gray-700 truncate">
              {stopAddress || stopCity}
            </p>
          </div>
        </div>
      </div>

      {/* Véhicule et Distance */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <div>
          <Label className="text-[10px] sm:text-xs text-gray-500 uppercase">Véhicule</Label>
          <Select
            value={vehicleType}
            onValueChange={setVehicleType}
            disabled={ratesLoading}
          >
            <SelectTrigger className="h-8 sm:h-9 text-xs sm:text-sm bg-white mt-1">
              <SelectValue placeholder="Véhicule" />
            </SelectTrigger>
            <SelectContent>
              {rates.map(rate => (
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
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">
              {selectedRate.rate_per_km.toFixed(2)} €/km + {selectedRate.fixed_cost.toFixed(2)} € fixe
            </p>
          )}
        </div>

        <div>
          <Label className="text-[10px] sm:text-xs text-gray-500 uppercase">Distance</Label>
          <Input
            type="number"
            min="0"
            step="0.1"
            value={distanceKm || ''}
            onChange={(e) => setDistanceKm(parseFloat(e.target.value) || 0)}
            placeholder="km"
            className="h-8 sm:h-9 text-xs sm:text-sm bg-white mt-1"
          />
        </div>
      </div>

      {/* Coût calculé */}
      {selectedRate && distanceKm > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-1.5">
              <Calculator className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
              <span className="text-xs sm:text-sm text-gray-600">Coût estimé</span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-bold text-emerald-600">
                {calculatedCost.toFixed(2)} €
              </span>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {distanceKm} km × {selectedRate.rate_per_km.toFixed(2)} € + {selectedRate.fixed_cost.toFixed(2)} €
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-white p-2 sm:p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-1.5">
              <Leaf className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-gray-600">Empreinte CO₂</span>
            </div>
            <div className="text-right">
              <span className="text-base sm:text-lg font-bold text-green-600">
                {co2Emission < 1 ? `${(co2Emission * 1000).toFixed(0)} g` : `${co2Emission.toFixed(1)} kg`}
              </span>
              <p className="text-[10px] sm:text-xs text-gray-400">
                {distanceKm} km × {(selectedRate.co2_per_km || 0.21).toFixed(3)} kg/km
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bouton sauvegarder */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={isSaving}
          className="h-7 sm:h-8 text-xs sm:text-sm"
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </div>
  );
};
