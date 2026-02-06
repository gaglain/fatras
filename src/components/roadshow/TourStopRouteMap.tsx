import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Route, Calculator, RefreshCw, Car, Leaf } from 'lucide-react';
import { calculateRoute, geocodeAddress, decodePolyline, RouteResult } from '@/lib/geocoding';
import { useVehicleRates } from '@/hooks/useVehicleRates';
import { useRoadshowSettings } from '@/hooks/useRoadshowSettings';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TourStopRouteMapProps {
  stopId: string;
  stopAddress?: string;
  stopCity: string;
  height?: string;
}

export const TourStopRouteMap: React.FC<TourStopRouteMapProps> = ({
  stopId,
  stopAddress,
  stopCity,
  height = '350px'
}) => {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [departureAddress, setDepartureAddress] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [distanceKm, setDistanceKm] = useState(0);

  const { rates } = useVehicleRates();
  const { settings } = useRoadshowSettings();

  // Load stop data
  useEffect(() => {
    const loadData = async () => {
      if (!stopId) return;
      const { data } = await supabase
        .from('roadshow_stops')
        .select('vehicle_type, distance_km, departure_address')
        .eq('id', stopId)
        .maybeSingle();

      if (data) {
        setVehicleType(data.vehicle_type || '');
        setDistanceKm(Number(data.distance_km) || 0);
        setDepartureAddress((data as any).departure_address || settings.default_departure_address || '');
      } else {
        setDepartureAddress(settings.default_departure_address || '');
      }
    };
    loadData();
  }, [stopId, settings.default_departure_address]);

  const selectedRate = rates.find(r => r.vehicle_name === vehicleType);
  const travelCost = selectedRate && distanceKm > 0
    ? (distanceKm * selectedRate.rate_per_km) + selectedRate.fixed_cost
    : 0;
  const co2Emission = selectedRate && distanceKm > 0
    ? distanceKm * (selectedRate.co2_per_km || 0.21)
    : 0;

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
        if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      } catch { /* ignore */ }
    };
  }, []);

  const ensureMapInitialized = useCallback(() => {
    const leaflet = leafletRef.current;
    if (!leaflet || mapRef.current || !mapElRef.current) return;

    const map = leaflet.map(mapElRef.current, {
      center: [46.603354, 1.888334],
      zoom: 6,
      scrollWheelZoom: true,
    });
    mapRef.current = map;

    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    markersRef.current = leaflet.layerGroup().addTo(map);
    routeLayerRef.current = leaflet.layerGroup().addTo(map);

    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 150);
    setTimeout(() => map.invalidateSize(), 500);
  }, []);

  useEffect(() => {
    if (leafletLoaded) ensureMapInitialized();
  }, [leafletLoaded, ensureMapInitialized]);

  const calculateStopRoute = async () => {
    if (!departureAddress || (!stopAddress && !stopCity)) {
      toast.error('Adresses de départ et destination requises');
      return;
    }

    setIsCalculating(true);
    try {
      // Geocode both addresses
      const [departureResult, destinationResult] = await Promise.all([
        geocodeAddress(departureAddress, '', undefined, 'France'),
        geocodeAddress(stopAddress || '', stopCity, undefined, 'France')
      ]);

      if (!departureResult || !destinationResult) {
        toast.error('Impossible de géolocaliser les adresses');
        return;
      }

      const route = await calculateRoute(
        { lat: departureResult.latitude, lng: departureResult.longitude },
        { lat: destinationResult.latitude, lng: destinationResult.longitude }
      );

      if (!route) {
        toast.error('Impossible de calculer l\'itinéraire');
        return;
      }

      setRouteResult(route);
      setDistanceKm(Math.round(route.distanceKm * 10) / 10);

      // Save distance to DB
      await supabase
        .from('roadshow_stops')
        .update({ distance_km: Math.round(route.distanceKm * 10) / 10 } as any)
        .eq('id', stopId);

      // Draw on map
      const leaflet = leafletRef.current;
      const map = mapRef.current;
      const markers = markersRef.current;
      const routeLayer = routeLayerRef.current;

      if (leaflet && map && markers && routeLayer) {
        markers.clearLayers();
        routeLayer.clearLayers();

        // Departure marker
        const homeIcon = leaflet.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color:hsl(142 76% 36%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">🏠</div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
        });
        leaflet.marker([departureResult.latitude, departureResult.longitude], { icon: homeIcon })
          .addTo(markers)
          .bindPopup(`<b>Départ</b><br/>${departureAddress}`);

        // Destination marker
        const destIcon = leaflet.divIcon({
          className: 'custom-marker',
          html: `<div style="background-color:hsl(0 84% 60%);width:28px;height:28px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:14px;">📍</div>`,
          iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
        });
        leaflet.marker([destinationResult.latitude, destinationResult.longitude], { icon: destIcon })
          .addTo(markers)
          .bindPopup(`<b>${stopCity}</b><br/>${stopAddress || ''}`);

        // Route polyline
        if (route.geometry) {
          const decoded = decodePolyline(route.geometry);
          leaflet.polyline(decoded, {
            color: 'hsl(var(--primary))',
            weight: 4,
            opacity: 0.8,
          }).addTo(routeLayer);
        }

        // Fit bounds
        const bounds = leaflet.latLngBounds([
          [departureResult.latitude, departureResult.longitude],
          [destinationResult.latitude, destinationResult.longitude]
        ]);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
      }

      toast.success(`Itinéraire: ${route.distanceKm.toFixed(1)} km, ${Math.round(route.durationMinutes)} min`);
    } catch (error) {
      console.error('Error calculating route:', error);
      toast.error('Erreur lors du calcul');
    } finally {
      setIsCalculating(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}min`;
  };

  if (loadError) {
    return <div className="text-center py-8 text-muted-foreground">{loadError}</div>;
  }

  return (
    <div className="space-y-3">
      {/* Route info header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{departureAddress || 'Adresse de départ non définie'}</span>
          <span>→</span>
          <span className="truncate">{stopAddress || stopCity}</span>
        </div>
        <Button
          size="sm"
          onClick={calculateStopRoute}
          disabled={isCalculating || !departureAddress}
        >
          {isCalculating ? (
            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Route className="h-4 w-4 mr-1" />
          )}
          {isCalculating ? 'Calcul...' : 'Calculer l\'itinéraire'}
        </Button>
      </div>

      {/* Map */}
      <div className="rounded-lg overflow-hidden border">
        {!leafletLoaded ? (
          <div className="flex items-center justify-center bg-muted/30" style={{ height }}>
            <p className="text-muted-foreground text-sm">Chargement de la carte...</p>
          </div>
        ) : (
          <div ref={mapElRef} style={{ height, width: '100%' }} />
        )}
      </div>

      {/* Route summary */}
      {routeResult && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="bg-muted/30 rounded-lg p-3 text-center border">
            <Route className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{routeResult.distanceKm.toFixed(1)} km</div>
            <div className="text-[10px] text-muted-foreground uppercase">Distance</div>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 text-center border">
            <Car className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold">{formatDuration(routeResult.durationMinutes)}</div>
            <div className="text-[10px] text-muted-foreground uppercase">Durée</div>
          </div>
          {travelCost > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 text-center border">
              <Calculator className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
              <div className="text-lg font-bold text-emerald-600">{travelCost.toFixed(2)} €</div>
              <div className="text-[10px] text-muted-foreground uppercase">
                {vehicleType || 'Coût'}
              </div>
            </div>
          )}
          {co2Emission > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 text-center border">
              <Leaf className="h-4 w-4 mx-auto mb-1 text-green-500" />
              <div className="text-lg font-bold text-green-600">
                {co2Emission < 1 ? `${(co2Emission * 1000).toFixed(0)} g` : `${co2Emission.toFixed(1)} kg`}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase">CO₂</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
