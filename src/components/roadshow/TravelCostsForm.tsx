 import React, { useEffect, useState } from 'react';
 import { Input } from '@/components/ui/input';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Card, CardContent } from '@/components/ui/card';
 import { Badge } from '@/components/ui/badge';
 import { Car, Calculator, MapPin } from 'lucide-react';
 import { useVehicleRates } from '@/hooks/useVehicleRates';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { Button } from '@/components/ui/button';
 
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
   const { rates, loading: ratesLoading, getDefaultRate } = useVehicleRates();
   const [vehicleType, setVehicleType] = useState(initialVehicleType || '');
   const [distanceKm, setDistanceKm] = useState<number>(initialDistanceKm || 0);
   const [isSaving, setIsSaving] = useState(false);
 
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
           <Select
             value={vehicleType}
             onValueChange={handleVehicleChange}
             disabled={ratesLoading}
           >
             <SelectTrigger id="vehicle-select">
               <SelectValue placeholder="Sélectionner un véhicule" />
             </SelectTrigger>
             <SelectContent>
               {rates.map(rate => (
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
 
       <div className="flex justify-end">
         <Button onClick={handleSave} disabled={isSaving}>
           {isSaving ? 'Enregistrement...' : 'Enregistrer les frais'}
         </Button>
       </div>
 
       {rates.length === 0 && !ratesLoading && (
         <p className="text-sm text-amber-600 dark:text-amber-400">
           ⚠️ Aucun tarif véhicule configuré. Accédez aux paramètres du module pour en créer.
         </p>
       )}
     </div>
   );
 };