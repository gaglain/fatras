import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  venue?: string | null;
  city?: string | null;
  address?: string | null;
  start_date?: string | null;
  status?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface EventsMapProps {
  events: Event[];
  selectedEventId?: string | null;
  onEventSelect?: (eventId: string) => void;
  height?: string;
}

const getMarkerColor = (status?: string | null) => {
  if (status === 'confirmed') return '#22c55e';
  if (status === 'pending') return '#f59e0b';
  if (status === 'cancelled') return '#ef4444';
  return '#6b7280';
};

const getStatusLabel = (status?: string | null) => {
  switch (status) {
    case 'confirmed': return 'Confirmé';
    case 'pending': return 'En attente';
    case 'cancelled': return 'Annulé';
    case 'completed': return 'Terminé';
    default: return 'Non défini';
  }
};

const getStatusVariant = (status?: string | null): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case 'confirmed': return 'default';
    case 'pending': return 'secondary';
    case 'cancelled': return 'destructive';
    default: return 'outline';
  }
};

export const EventsMap = ({ events, selectedEventId, onEventSelect, height = '500px' }: EventsMapProps) => {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);

  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  const eventsWithoutCoords = useMemo(() => 
    events.filter(e => !e.latitude || !e.longitude),
    [events]
  );

  const geoEvents = useMemo(() => events.filter(e => e.latitude && e.longitude), [events]);

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
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      })
      .addTo(map);

    markersRef.current = leaflet.layerGroup().addTo(map);

    // If the map is rendered inside a tab/accordion, it can be 0x0 at init.
    // Invalidate size a couple of times after mount to force tile render.
    requestAnimationFrame(() => map.invalidateSize());
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

  // Load Leaflet + init map once
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await import('leaflet/dist/leaflet.css');
        const leafletModule = await import('leaflet');
        const leaflet = (leafletModule as any).default ?? leafletModule;

        if (cancelled) return;
        leafletRef.current = leaflet;

        // Important: the map container (<div ref={mapElRef} />) is only rendered
        // AFTER leafletLoaded=true, so we initialize the map in a separate effect.
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

  // Initialize map once the container exists (it renders only when leafletLoaded=true)
  useEffect(() => {
    if (!leafletLoaded) return;
    ensureMapInitialized();
  }, [leafletLoaded, ensureMapInitialized]);

  // Update markers when events change
  useEffect(() => {
    if (!leafletLoaded) return;
    ensureMapInitialized();
    const leaflet = leafletRef.current;
    const map = mapRef.current;
    const markers = markersRef.current;
    if (!leaflet || !map || !markers) return;

    markers.clearLayers();

    const coords = geoEvents
      .filter((e) => e.latitude && e.longitude)
      .map((e) => [e.latitude!, e.longitude!] as [number, number]);

    geoEvents.forEach((event) => {
      const color = getMarkerColor(event.status);
      const icon = leaflet.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 24],
        popupAnchor: [0, -24],
      });

      const marker = leaflet
        .marker([event.latitude!, event.longitude!], { icon })
        .addTo(markers);

      const statusLabel = getStatusLabel(event.status);
      const dateLabel = event.start_date
        ? format(new Date(event.start_date), 'dd MMM yyyy', { locale: fr })
        : '';

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 4px;">
          <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${event.title}</div>
          ${event.venue ? `<div style="font-size: 12px; opacity: .8;">${event.venue}</div>` : ''}
          ${event.city ? `<div style="font-size: 12px; opacity: .8;">${event.city}</div>` : ''}
          ${dateLabel ? `<div style="font-size: 12px; opacity: .8; margin-top: 4px;">${dateLabel}</div>` : ''}
          <div style="font-size: 12px; opacity: .8; margin-top: 6px;">${statusLabel}</div>
          <div style="margin-top: 8px;">
            <a href="/events/${event.id}" style="font-size: 12px; text-decoration: underline;">Voir</a>
          </div>
        </div>
      `);

      marker.on('click', () => {
        onEventSelect?.(event.id);
      });
    });

    if (coords.length > 0) {
      const bounds = leaflet.latLngBounds(coords);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      map.setView([46.603354, 1.888334], 6);
    }
  }, [leafletLoaded, geoEvents, onEventSelect, ensureMapInitialized]);

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
            <MapPin className="h-5 w-5" />
            Carte des événements
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Carte des événements
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              {geoEvents.filter(e => e.status === 'confirmed').length} confirmés
            </span>
            <span className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              {geoEvents.filter(e => e.status === 'pending').length} en attente
            </span>
          </div>
        </div>
        {eventsWithoutCoords.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {eventsWithoutCoords.length} événement(s) sans coordonnées GPS
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height, minHeight: '400px' }}>
          <div ref={mapElRef} style={{ height: '100%', width: '100%', minHeight: '400px' }} />
        </div>
      </CardContent>
    </Card>
  );
};