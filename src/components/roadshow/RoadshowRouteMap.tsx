import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Calculator, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { TourStop } from '@/types/roadshow.types';
import { calculateTourRoute, TourRouteResult, TourRouteSegment, decodePolyline, geocodeAddress } from '@/lib/geocoding';
import { VehicleRate, useVehicleRates } from '@/hooks/useVehicleRates';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface RoadshowRouteMapProps {
  stops: TourStop[];
  height?: string;
  onStopSelect?: (stopId: string) => void;
}

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins} min`;
  return `${hours}h ${mins}min`;
};

export const RoadshowRouteMap = ({ stops, height = '500px', onStopSelect }: RoadshowRouteMapProps) => {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<TourRouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isGeocodingAll, setIsGeocodingAll] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const { rates, loading: ratesLoading } = useVehicleRates();

  // Filter confirmed stops with coordinates
  const confirmedStops = useMemo(() => 
    stops.filter(s => s.status === 'confirmed'),
    [stops]
  );

  const stopsWithCoords = useMemo(() => 
    confirmedStops.filter(s => 
      (s as any).latitude && (s as any).longitude
    ),
    [confirmedStops]
  );

  const stopsWithoutCoords = useMemo(() =>
    confirmedStops.filter(s => 
      !(s as any).latitude || !(s as any).longitude
    ),
    [confirmedStops]
  );

  // Calculate route costs based on vehicle rates
  const calculateCosts = useCallback((segments: TourRouteSegment[], vehicleRates: VehicleRate[]) => {
    const defaultRate = vehicleRates.find(r => r.is_default) || vehicleRates[0];
    if (!defaultRate) return { totalCost: 0, costPerSegment: [] };

    let totalCost = 0;
    const costPerSegment = segments.map(segment => {
      const cost = (segment.distanceKm * defaultRate.rate_per_km) + defaultRate.fixed_cost;
      totalCost += cost;
      return { ...segment, cost };
    });

    return { totalCost, costPerSegment };
  }, []);

  const costs = useMemo(() => {
    if (!routeResult || rates.length === 0) return null;
    return calculateCosts(routeResult.segments, rates);
  }, [routeResult, rates, calculateCosts]);

  // Geocode all stops without coordinates
  const geocodeAllStops = async () => {
    if (stopsWithoutCoords.length === 0) {
      toast.info('Toutes les étapes ont déjà des coordonnées');
      return;
    }

    setIsGeocodingAll(true);
    let successCount = 0;

    for (const stop of stopsWithoutCoords) {
      try {
        const result = await geocodeAddress(stop.address, stop.city, undefined, 'France');
        if (result) {
          // Update in database
          await supabase
            .from('roadshow_stops')
            .update({
              latitude: result.latitude,
              longitude: result.longitude
            })
            .eq('id', stop.id);
          successCount++;
        }
      } catch (error) {
        console.error('Error geocoding stop:', stop.city, error);
      }
    }

    toast.success(`${successCount}/${stopsWithoutCoords.length} étapes géolocalisées`);
    setIsGeocodingAll(false);
    // Trigger refresh in parent
    window.location.reload();
  };

  // Calculate route between all confirmed stops
  const calculateFullRoute = async () => {
    if (stopsWithCoords.length < 2) {
      toast.error('Il faut au moins 2 étapes géolocalisées pour calculer un itinéraire');
      return;
    }

    setIsCalculating(true);
    try {
      const tourStops = stopsWithCoords.map(s => ({
        id: s.id,
        city: s.city,
        venue: s.venue,
        date: s.date,
        latitude: (s as any).latitude,
        longitude: (s as any).longitude,
        vehicleType: (s as any).vehicleType
      }));

      const result = await calculateTourRoute(tourStops);
      setRouteResult(result);
      toast.success(`Itinéraire calculé: ${result.totalDistanceKm.toFixed(0)} km`);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Erreur lors du calcul de l\'itinéraire');
    } finally {
      setIsCalculating(false);
    }
  };

  const ensureMapInitialized = useCallback(() => {
    const leaflet = leafletRef.current;
    if (!leaflet) return;
    if (mapRef.current) return;
    if (!mapElRef.current) return;

    const map = leaflet.map(mapElRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    leaflet
      .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(map);

    markersRef.current = leaflet.layerGroup().addTo(map);
    routeLayerRef.current = leaflet.layerGroup().addTo(map);

    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

  // Load Leaflet
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leafletModule = await import('leaflet');
        const leaflet = (leafletModule as any).default ?? leafletModule;

        if (cancelled) return;
        leafletRef.current = leaflet;
        setLeafletLoaded(true);
      } catch (e) {
        console.error('Failed to load Leaflet:', e);
        setLoadError('Impossible de charger la carte');
      }
    };

    load();
    return () => {
      cancelled = true;
      try {
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }
      } catch {
        // ignore
      }
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!leafletLoaded) return;
    ensureMapInitialized();
  }, [leafletLoaded, ensureMapInitialized]);

  // Update markers and route
  useEffect(() => {
    if (!leafletLoaded) return;
    ensureMapInitialized();
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const markers = markersRef.current;
    const routeLayer = routeLayerRef.current;
    if (!leaflet || !map || !markers || !routeLayer) return;

    markers.clearLayers();
    routeLayer.clearLayers();

    // Sort stops by date for numbering
    const sortedStops = [...stopsWithCoords].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const coords = sortedStops.map((s) => [(s as any).latitude, (s as any).longitude] as [number, number]);

    // Add markers with numbers
    sortedStops.forEach((stop, index) => {
      const icon = leaflet.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: hsl(var(--primary));
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
          ">
            ${index + 1}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -28],
      });

      const marker = leaflet
        .marker([(stop as any).latitude, (stop as any).longitude], { icon })
        .addTo(markers);

      const dateLabel = stop.date
        ? format(new Date(stop.date), 'dd MMM yyyy', { locale: fr })
        : '';

      marker.bindPopup(`
        <div style="min-width: 180px; padding: 4px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${index + 1}. ${stop.city}</div>
          <div style="font-size: 12px; opacity: .8;">${stop.venue}</div>
          ${dateLabel ? `<div style="font-size: 12px; opacity: .8; margin-top: 4px;">📅 ${dateLabel}</div>` : ''}
        </div>
      `);

      marker.on('click', () => {
        onStopSelect?.(stop.id);
      });
    });

    // Draw route if available
    if (routeResult && routeResult.segments.length > 0) {
      routeResult.segments.forEach(segment => {
        if (segment.geometry) {
          const decoded = decodePolyline(segment.geometry);
          const polyline = leaflet.polyline(decoded, {
            color: 'hsl(var(--primary))',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
          });
          polyline.addTo(routeLayer);
        }
      });
    }

    if (coords.length > 0) {
      const bounds = leaflet.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    } else {
      map.setView([46.603354, 1.888334], 6);
    }
  }, [leafletLoaded, stopsWithCoords, routeResult, onStopSelect, ensureMapInitialized]);

  if (loadError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-muted-foreground">{loadError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!leafletLoaded) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Itinéraire de tournée
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-muted-foreground">Chargement de la carte...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Itinéraire de tournée
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            {stopsWithoutCoords.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={geocodeAllStops}
                disabled={isGeocodingAll}
              >
                <MapPin className="h-4 w-4 mr-1" />
                {isGeocodingAll ? 'Géolocalisation...' : `Géolocaliser (${stopsWithoutCoords.length})`}
              </Button>
            )}
            <Button 
              variant="default" 
              size="sm" 
              onClick={calculateFullRoute}
              disabled={isCalculating || stopsWithCoords.length < 2}
            >
              <Calculator className="h-4 w-4 mr-1" />
              {isCalculating ? 'Calcul...' : 'Calculer l\'itinéraire'}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-primary" />
            {stopsWithCoords.length} étapes géolocalisées
          </span>
          {stopsWithoutCoords.length > 0 && (
            <span className="text-amber-600">
              ⚠️ {stopsWithoutCoords.length} sans coordonnées
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div style={{ height, minHeight: '400px' }}>
          <div ref={mapElRef} style={{ height: '100%', width: '100%', minHeight: '400px' }} />
        </div>

        {/* Route summary */}
        {routeResult && (
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
                  <div className="text-xs text-muted-foreground">
                    Frais de route estimés
                  </div>
                </div>
              )}
            </div>

            {/* Detailed segments */}
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
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="font-medium">{segment.distanceKm.toFixed(0)} km</span>
                          <span className="text-muted-foreground">{formatDuration(segment.durationMinutes)}</span>
                          {segmentCost && (
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">{segmentCost.cost.toFixed(2)} €</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
