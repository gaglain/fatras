// Geocoding utilities using OpenStreetMap Nominatim API (free, no API key needed)

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

// Rate limiting: 1 request per second for Nominatim
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100; // 1.1 seconds

const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  lastRequestTime = Date.now();
};

export const geocodeAddress = async (
  address?: string,
  city?: string,
  postalCode?: string,
  country: string = 'France'
): Promise<GeocodingResult | null> => {
  // Build query from most specific to least specific
  const parts = [address, postalCode, city, country].filter(Boolean);
  if (parts.length === 0) return null;

  const query = parts.join(', ');
  
  try {
    await waitForRateLimit();
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
      {
        headers: {
          'User-Agent': 'ArtistTourManager/1.0'
        }
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.length === 0) return null;

    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
      displayName: data[0].display_name
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

// Calculate distance using OSRM routing API (free, real road distance)
export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  geometry?: string; // Encoded polyline for displaying on map
}

export const calculateRoute = async (
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
  try {
    // OSRM demo server - free but limited
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=polyline`
    );

    if (!response.ok) return null;

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) return null;

    const route = data.routes[0];
    return {
      distanceKm: route.distance / 1000, // meters to km
      durationMinutes: route.duration / 60, // seconds to minutes
      geometry: route.geometry
    };
  } catch (error) {
    console.error('Route calculation error:', error);
    return null;
  }
};

// Calculate full tour route between multiple stops
export interface TourRouteStop {
  id: string;
  city: string;
  venue: string;
  date: string;
  latitude: number;
  longitude: number;
  vehicleType?: string;
}

export interface TourRouteSegment {
  fromStopId: string;
  toStopId: string;
  distanceKm: number;
  durationMinutes: number;
  geometry?: string;
}

export interface TourRouteResult {
  segments: TourRouteSegment[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
}

export const calculateTourRoute = async (
  stops: TourRouteStop[]
): Promise<TourRouteResult> => {
  // Sort stops by date
  const sortedStops = [...stops].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const segments: TourRouteSegment[] = [];
  let totalDistanceKm = 0;
  let totalDurationMinutes = 0;

  for (let i = 0; i < sortedStops.length - 1; i++) {
    const from = sortedStops[i];
    const to = sortedStops[i + 1];

    const route = await calculateRoute(
      { lat: from.latitude, lng: from.longitude },
      { lat: to.latitude, lng: to.longitude }
    );

    if (route) {
      segments.push({
        fromStopId: from.id,
        toStopId: to.id,
        distanceKm: route.distanceKm,
        durationMinutes: route.durationMinutes,
        geometry: route.geometry
      });
      totalDistanceKm += route.distanceKm;
      totalDurationMinutes += route.durationMinutes;
    }
  }

  return {
    segments,
    totalDistanceKm,
    totalDurationMinutes
  };
};

// Decode polyline from OSRM (for displaying on map)
export const decodePolyline = (encoded: string): [number, number][] => {
  const coordinates: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
    lng += dlng;

    coordinates.push([lat / 1e5, lng / 1e5]);
  }

  return coordinates;
};
