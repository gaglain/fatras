import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Route, Calculator } from 'lucide-react';
import { TourStop } from '@/types/roadshow.types';
import { calculateTourRoute, TourRouteResult, TourRouteSegment, decodePolyline, geocodeAddress } from '@/lib/geocoding';
import { VehicleRate, useVehicleRates } from '@/hooks/useVehicleRates';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RouteMapSummary } from './RouteMapSummary';

interface StopWithVehicle extends TourStop {
  latitude?: number;
  longitude?: number;
  vehicleType?: string;
  distance_km?: number;
}

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

interface RoadshowRouteMapProps {
  stops: StopWithVehicle[];
  height?: string;
  onStopSelect?: (stopId: string) => void;
  defaultDepartureAddress?: string;
  onVehicleChange?: (stopId: string, vehicleType: string) => void;
}

export const RoadshowRouteMap = ({ stops, height = '500px', onStopSelect, defaultDepartureAddress, onVehicleChange }: RoadshowRouteMapProps) => {
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
  const [departureCoords, setDepartureCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [segmentVehicles, setSegmentVehicles] = useState<Record<string, string>>({});

  const { rates, loading: ratesLoading } = useVehicleRates();

  const confirmedStops = useMemo(() => stops.filter(s => s.status === 'confirmed'), [stops]);
  const stopsWithCoords = useMemo(() => confirmedStops.filter(s => (s as any).latitude && (s as any).longitude), [confirmedStops]);
  const stopsWithoutCoords = useMemo(() => confirmedStops.filter(s => !(s as any).latitude || !(s as any).longitude), [confirmedStops]);

  const calculateCosts = useCallback((segments: TourRouteSegment[], vehicleRates: VehicleRate[], stopsData: StopWithVehicle[], vehicleOverrides: Record<string, string>) => {
    const defaultRate = vehicleRates.find(r => r.is_default) || vehicleRates[0];
    if (!defaultRate) return { totalCost: 0, costPerSegment: [] as SegmentCost[] };

    let totalCost = 0;
    const costPerSegment: SegmentCost[] = segments.map(segment => {
      const segmentKey = `${segment.fromStopId}-${segment.toStopId}`;
      const toStop = stopsData.find(s => s.id === segment.toStopId);
      const vehicleName = vehicleOverrides[segmentKey] || toStop?.vehicleType || defaultRate.vehicle_name;
      const vehicleRate = vehicleRates.find(r => r.vehicle_name === vehicleName) || defaultRate;
      const cost = (segment.distanceKm * vehicleRate.rate_per_km) + vehicleRate.fixed_cost;
      totalCost += cost;
      return { ...segment, vehicleName: vehicleRate.vehicle_name, ratePerKm: vehicleRate.rate_per_km, fixedCost: vehicleRate.fixed_cost, cost };
    });
    return { totalCost, costPerSegment };
  }, []);

  const costs = useMemo(() => {
    if (!routeResult || rates.length === 0) return null;
    return calculateCosts(routeResult.segments, rates, stopsWithCoords, segmentVehicles);
  }, [routeResult, rates, calculateCosts, stopsWithCoords, segmentVehicles]);

  const handleSegmentVehicleChange = (segmentKey: string, vehicleName: string) => {
    setSegmentVehicles(prev => ({ ...prev, [segmentKey]: vehicleName }));
  };

  const geocodeAllStops = async () => {
    if (stopsWithoutCoords.length === 0) { toast.info('Toutes les étapes ont déjà des coordonnées'); return; }
    setIsGeocodingAll(true);
    let successCount = 0;
    for (const stop of stopsWithoutCoords) {
      try {
        const result = await geocodeAddress(stop.address, stop.city, undefined, 'France');
        if (result) {
          await supabase.from('roadshow_stops').update({ latitude: result.latitude, longitude: result.longitude }).eq('id', stop.id);
          successCount++;
        }
      } catch (error) { console.error('Error geocoding stop:', stop.city, error); }
    }
    toast.success(`${successCount}/${stopsWithoutCoords.length} étapes géolocalisées`);
    setIsGeocodingAll(false);
    window.location.reload();
  };

  useEffect(() => {
    const geocodeDeparture = async () => {
      if (!defaultDepartureAddress || defaultDepartureAddress.trim() === '') { setDepartureCoords(null); return; }
      try {
        const result = await geocodeAddress(defaultDepartureAddress, '', undefined, 'France');
        if (result) setDepartureCoords({ lat: result.latitude, lng: result.longitude });
      } catch (error) { console.error('Error geocoding departure address:', error); }
    };
    geocodeDeparture();
  }, [defaultDepartureAddress]);

  const calculateFullRoute = async () => {
    if (stopsWithCoords.length < 2 && !departureCoords) { toast.error('Il faut au moins 2 étapes géolocalisées pour calculer un itinéraire'); return; }
    setIsCalculating(true);
    try {
      const tourStops = stopsWithCoords.map(s => ({
        id: s.id, city: s.city, venue: s.venue, date: s.date,
        latitude: (s as any).latitude, longitude: (s as any).longitude, vehicleType: (s as any).vehicleType
      }));
      if (departureCoords) {
        tourStops.unshift({ id: 'departure-point', city: 'Point de départ', venue: defaultDepartureAddress || '', date: tourStops[0]?.date || '', latitude: departureCoords.lat, longitude: departureCoords.lng, vehicleType: undefined });
        tourStops.push({ id: 'return-point', city: 'Retour', venue: defaultDepartureAddress || '', date: tourStops[tourStops.length - 1]?.date || '', latitude: departureCoords.lat, longitude: departureCoords.lng, vehicleType: undefined });
      }
      const result = await calculateTourRoute(tourStops);
      setRouteResult(result);
      toast.success(`Itinéraire calculé: ${result.totalDistanceKm.toFixed(0)} km`);
    } catch (error) { console.error('Error calculating route:', error); toast.error('Erreur lors du calcul de l\'itinéraire'); }
    finally { setIsCalculating(false); }
  };

  const ensureMapInitialized = useCallback(() => {
    const leaflet = leafletRef.current;
    if (!leaflet || mapRef.current || !mapElRef.current) return;
    const map = leaflet.map(mapElRef.current, { center: [46.603354, 1.888334], zoom: 6, scrollWheelZoom: true });
    mapRef.current = map;
    leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' }).addTo(map);
    markersRef.current = leaflet.layerGroup().addTo(map);
    routeLayerRef.current = leaflet.layerGroup().addTo(map);
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

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
      } catch (e) { console.error('Failed to load Leaflet:', e); setLoadError('Impossible de charger la carte'); }
    };
    load();
    return () => { cancelled = true; try { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } } catch {} };
  }, []);

  useEffect(() => { if (leafletLoaded) ensureMapInitialized(); }, [leafletLoaded, ensureMapInitialized]);

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

    const sortedStops = [...stopsWithCoords].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const coords = sortedStops.map((s) => [(s as any).latitude, (s as any).longitude] as [number, number]);

    if (departureCoords) {
      const homeIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: hsl(142 76% 36%); width: 32px; height: 32px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🏠</div>`,
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32],
      });
      const departureMarker = leaflet.marker([departureCoords.lat, departureCoords.lng], { icon: homeIcon }).addTo(markers);
      departureMarker.bindPopup(`<div style="min-width: 180px; padding: 4px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">🏠 Point de départ / retour</div><div style="font-size: 12px; opacity: .8;">${defaultDepartureAddress || ''}</div></div>`);
      coords.push([departureCoords.lat, departureCoords.lng]);
    }

    sortedStops.forEach((stop, index) => {
      const icon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: hsl(var(--primary)); width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">${index + 1}</div>`,
        iconSize: [28, 28], iconAnchor: [14, 28], popupAnchor: [0, -28],
      });
      const marker = leaflet.marker([(stop as any).latitude, (stop as any).longitude], { icon }).addTo(markers);
      const dateLabel = stop.date ? new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(stop.date)) : '';
      marker.bindPopup(`<div style="min-width: 180px; padding: 4px;"><div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${index + 1}. ${stop.city}</div><div style="font-size: 12px; opacity: .8;">${stop.venue}</div>${dateLabel ? `<div style="font-size: 12px; opacity: .8; margin-top: 4px;">📅 ${dateLabel}</div>` : ''}</div>`);
      marker.on('click', () => { onStopSelect?.(stop.id); });
    });

    if (routeResult && routeResult.segments.length > 0) {
      routeResult.segments.forEach(segment => {
        if (segment.geometry) {
          const decoded = decodePolyline(segment.geometry);
          leaflet.polyline(decoded, { color: 'hsl(var(--primary))', weight: 4, opacity: 0.7, dashArray: '10, 10' }).addTo(routeLayer);
        }
      });
    }

    if (coords.length > 0) { map.fitBounds(leaflet.latLngBounds(coords), { padding: [50, 50], maxZoom: 10 }); }
    else { map.setView([46.603354, 1.888334], 6); }
  }, [leafletLoaded, stopsWithCoords, routeResult, onStopSelect, ensureMapInitialized, departureCoords, defaultDepartureAddress]);

  if (loadError) {
    return (<Card className="overflow-hidden"><CardContent className="flex items-center justify-center" style={{ height }}><p className="text-muted-foreground">{loadError}</p></CardContent></Card>);
  }

  if (!leafletLoaded) {
    return (<Card className="overflow-hidden"><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Itinéraire de tournée</CardTitle></CardHeader><CardContent className="flex items-center justify-center" style={{ height }}><p className="text-muted-foreground">Chargement de la carte...</p></CardContent></Card>);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="flex items-center gap-2"><Route className="h-5 w-5" />Itinéraire de tournée</CardTitle>
          <div className="flex flex-wrap gap-2">
            {stopsWithoutCoords.length > 0 && (
              <Button variant="outline" size="sm" onClick={geocodeAllStops} disabled={isGeocodingAll}>
                <MapPin className="h-4 w-4 mr-1" />{isGeocodingAll ? 'Géolocalisation...' : `Géolocaliser (${stopsWithoutCoords.length})`}
              </Button>
            )}
            <Button variant="default" size="sm" onClick={calculateFullRoute} disabled={isCalculating || stopsWithCoords.length < 2}>
              <Calculator className="h-4 w-4 mr-1" />{isCalculating ? 'Calcul...' : 'Calculer l\'itinéraire'}
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-2">
          <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-primary" />{stopsWithCoords.length} étapes géolocalisées</span>
          {stopsWithoutCoords.length > 0 && <span className="text-amber-600">⚠️ {stopsWithoutCoords.length} sans coordonnées</span>}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height, minHeight: '400px' }}><div ref={mapElRef} style={{ height: '100%', width: '100%', minHeight: '400px' }} /></div>
        {routeResult && (
          <RouteMapSummary
            routeResult={routeResult}
            costs={costs}
            rates={rates}
            stopsWithCoords={stopsWithCoords}
            showDetails={showDetails}
            setShowDetails={setShowDetails}
            onSegmentVehicleChange={handleSegmentVehicleChange}
          />
        )}
      </CardContent>
    </Card>
  );
};
