import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Lazy load Leaflet to avoid SSR issues
let L: typeof import('leaflet') | null = null;
let MapContainer: any = null;
let TileLayer: any = null;
let Marker: any = null;
let Popup: any = null;
let useMap: any = null;

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

// Component to fit bounds when events change
const FitBounds = ({ events }: { events: Event[] }) => {
  const map = useMap();
  
  useEffect(() => {
    const geoEvents = events.filter(e => e.latitude && e.longitude);
    if (geoEvents.length > 0) {
      const bounds = L.latLngBounds(
        geoEvents.map(e => [e.latitude!, e.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      // Default to France center
      map.setView([46.603354, 1.888334], 6);
    }
  }, [events, map]);
  
  return null;
};

// Custom marker icon based on status
const getMarkerIcon = (status: string | null | undefined, leaflet: any) => {
  const color = status === 'confirmed' ? '#22c55e' : 
                status === 'pending' ? '#f59e0b' : 
                status === 'cancelled' ? '#ef4444' : '#6b7280';
  
  return leaflet.divIcon({
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
  const navigate = useNavigate();
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        // Import Leaflet CSS
        await import('leaflet/dist/leaflet.css');
        
        // Import Leaflet modules
        const leafletModule = await import('leaflet');
        const reactLeafletModule = await import('react-leaflet');
        
        L = leafletModule.default || leafletModule;
        MapContainer = reactLeafletModule.MapContainer;
        TileLayer = reactLeafletModule.TileLayer;
        Marker = reactLeafletModule.Marker;
        Popup = reactLeafletModule.Popup;
        useMap = reactLeafletModule.useMap;
        
        // Fix default marker icon issue
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        setLeafletLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setLoadError('Impossible de charger la carte');
      }
    };
    
    loadLeaflet();
  }, []);
  
  // Filter events with coordinates
  const geoEvents = useMemo(() => 
    events.filter(e => e.latitude && e.longitude),
    [events]
  );
  
  const eventsWithoutCoords = useMemo(() => 
    events.filter(e => !e.latitude || !e.longitude),
    [events]
  );

  if (loadError) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-muted-foreground">{loadError}</p>
        </CardContent>
      </Card>
    );
  }

  if (!leafletLoaded || !L || !MapContainer) {
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
        <div style={{ height }}>
          <MapContainer
            center={[46.603354, 1.888334]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBoundsComponent events={geoEvents} leaflet={L} useMapHook={useMap} />
            
            {geoEvents.map((event) => (
              <Marker
                key={event.id}
                position={[event.latitude!, event.longitude!]}
                icon={getMarkerIcon(event.status, L)}
                eventHandlers={{
                  click: () => onEventSelect?.(event.id),
                }}
              >
                <Popup>
                  <div className="min-w-[200px] p-1">
                    <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
                    
                    {event.venue && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </p>
                    )}
                    
                    {event.city && (
                      <p className="text-xs text-muted-foreground">{event.city}</p>
                    )}
                    
                    {event.start_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(event.start_date), 'dd MMM yyyy', { locale: fr })}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant={getStatusVariant(event.status)} className="text-xs">
                        {getStatusLabel(event.status)}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => navigate(`/events/${event.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Voir
                      </Button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

// Component to fit bounds when events change - must be inside MapContainer
const FitBoundsComponent = ({ events, leaflet, useMapHook }: { events: Event[]; leaflet: any; useMapHook: any }) => {
  const map = useMapHook();
  
  useEffect(() => {
    const geoEvents = events.filter(e => e.latitude && e.longitude);
    if (geoEvents.length > 0) {
      const bounds = leaflet.latLngBounds(
        geoEvents.map(e => [e.latitude!, e.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    } else {
      // Default to France center
      map.setView([46.603354, 1.888334], 6);
    }
  }, [events, map, leaflet]);
  
  return null;
};