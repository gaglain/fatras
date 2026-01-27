import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

export const useGeocoding = () => {
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Geocode an address using Nominatim (free OpenStreetMap geocoding)
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    if (!address.trim()) return null;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'FatrasApp/1.0',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Geocoding request failed');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          displayName: data[0].display_name,
        };
      }

      return null;
    } catch (error) {
      logger.error('Geocoding error:', error);
      return null;
    }
  }, []);

  // Geocode and update an event
  const geocodeEvent = useCallback(async (eventId: string, address: string, city?: string | null): Promise<boolean> => {
    setIsGeocoding(true);
    
    try {
      const fullAddress = [address, city].filter(Boolean).join(', ');
      const result = await geocodeAddress(fullAddress);

      if (result) {
        const { error } = await supabase
          .from('events')
          .update({
            latitude: result.latitude,
            longitude: result.longitude,
          })
          .eq('id', eventId);

        if (error) throw error;
        
        logger.log(`Geocoded event ${eventId}: ${result.latitude}, ${result.longitude}`);
        return true;
      } else {
        logger.warn(`No geocoding result for: ${fullAddress}`);
        return false;
      }
    } catch (error) {
      logger.error('Failed to geocode event:', error);
      return false;
    } finally {
      setIsGeocoding(false);
    }
  }, [geocodeAddress]);

  // Batch geocode multiple events
  const batchGeocodeEvents = useCallback(async (events: Array<{ id: string; address?: string | null; city?: string | null; venue?: string | null }>) => {
    setIsGeocoding(true);
    let successCount = 0;
    let failCount = 0;

    try {
      for (const event of events) {
        // Build address from available fields
        const addressParts = [event.venue, event.address, event.city].filter(Boolean);
        if (addressParts.length === 0) {
          failCount++;
          continue;
        }

        const fullAddress = addressParts.join(', ');
        const result = await geocodeAddress(fullAddress);

        if (result) {
          const { error } = await supabase
            .from('events')
            .update({
              latitude: result.latitude,
              longitude: result.longitude,
            })
            .eq('id', event.id);

          if (!error) {
            successCount++;
          } else {
            failCount++;
          }
        } else {
          failCount++;
        }

        // Rate limiting: wait 1 second between requests (Nominatim requirement)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      if (successCount > 0) {
        toast.success(`${successCount} événement(s) géolocalisé(s)`);
      }
      if (failCount > 0) {
        toast.warning(`${failCount} événement(s) sans résultat`);
      }

      return { successCount, failCount };
    } finally {
      setIsGeocoding(false);
    }
  }, [geocodeAddress]);

  return {
    isGeocoding,
    geocodeAddress,
    geocodeEvent,
    batchGeocodeEvents,
  };
};
