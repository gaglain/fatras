import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TourRouteResult } from '@/lib/geocoding';
import { VehicleRate } from '@/hooks/useVehicleRates';

interface SegmentCost {
  fromStopId: string;
  toStopId: string;
  distanceKm: number;
  durationMinutes: number;
  vehicleName: string;
  ratePerKm: number;
  fixedCost: number;
  cost: number;
}

interface RouteMapSummaryProps {
  routeResult: TourRouteResult;
  costs: { totalCost: number; costPerSegment: SegmentCost[] } | null;
  rates: VehicleRate[];
  stopsWithCoords: Array<{ id: string; city: string; venue: string; date: string }>;
  showDetails: boolean;
  setShowDetails: (v: boolean) => void;
  onSegmentVehicleChange: (segmentKey: string, vehicleName: string) => void;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}min`;
};

export const RouteMapSummary: React.FC<RouteMapSummaryProps> = ({
  routeResult, costs, rates, stopsWithCoords, showDetails, setShowDetails, onSegmentVehicleChange
}) => {
  return (
    <div className="p-4 border-t bg-muted/30">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {routeResult.totalDistanceKm.toFixed(0)} km
          </div>
          <div className="text-xs text-muted-foreground">Distance totale</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {formatDuration(routeResult.totalDurationMinutes)}
          </div>
          <div className="text-xs text-muted-foreground">Temps de conduite</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">
            {routeResult.segments.length + 1}
          </div>
          <div className="text-xs text-muted-foreground">Étapes</div>
        </div>
        {costs && (
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {costs.totalCost.toFixed(2)} €
            </div>
            <div className="text-xs text-muted-foreground">Frais de route estimés</div>
          </div>
        )}
      </div>

      <Collapsible open={showDetails} onOpenChange={setShowDetails}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full">
            {showDetails ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
            {showDetails ? 'Masquer les détails' : 'Voir les détails par trajet'}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-3">
          <div className="space-y-2">
            {routeResult.segments.map((segment, index) => {
              const fromStop = stopsWithCoords.find(s => s.id === segment.fromStopId);
              const toStop = stopsWithCoords.find(s => s.id === segment.toStopId);
              const segmentCost = costs?.costPerSegment[index];

              return (
                <div
                  key={`${segment.fromStopId}-${segment.toStopId}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-background border text-sm"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className="flex-shrink-0">{index + 1}</Badge>
                    <span className="truncate">
                      {fromStop?.city} → {toStop?.city}
                    </span>
                    {toStop?.date && (
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        ({format(new Date(toStop.date), 'dd/MM', { locale: fr })})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    {rates.length > 0 && (
                      <Select
                        value={segmentCost?.vehicleName || ''}
                        onValueChange={(value) => onSegmentVehicleChange(`${segment.fromStopId}-${segment.toStopId}`, value)}
                      >
                        <SelectTrigger className="w-[100px] sm:w-[140px] h-7 text-xs">
                          <SelectValue placeholder="Véhicule" />
                        </SelectTrigger>
                        <SelectContent>
                          {rates.filter(rate => rate.vehicle_name).map(rate => (
                            <SelectItem key={rate.id} value={rate.vehicle_name}>
                              {rate.vehicle_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <span className="font-medium">{segment.distanceKm.toFixed(0)} km</span>
                    <span className="text-muted-foreground hidden sm:inline">{formatDuration(segment.durationMinutes)}</span>
                    {segmentCost && (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400 min-w-[70px] text-right">
                        {segmentCost.cost.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {costs && rates.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-muted/50 border">
              <h4 className="text-sm font-medium mb-2">Récapitulatif des frais</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {rates.map(rate => {
                  const vehicleSegments = costs.costPerSegment.filter(s => s.vehicleName === rate.vehicle_name);
                  const vehicleKm = vehicleSegments.reduce((sum, s) => sum + s.distanceKm, 0);
                  const vehicleCost = vehicleSegments.reduce((sum, s) => sum + s.cost, 0);
                  if (vehicleSegments.length === 0) return null;
                  return (
                    <div key={rate.id} className="p-2 rounded bg-background border">
                      <div className="font-medium">{rate.vehicle_name}</div>
                      <div className="text-muted-foreground">{vehicleKm.toFixed(0)} km</div>
                      <div className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {vehicleCost.toFixed(2)} €
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
