import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SEOHead } from '@/components/SEOHead';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

export const FrontTour: React.FC = () => {
  const [tourStops, setTourStops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTourStops();
  }, []);

  const loadTourStops = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('roadshow_stops')
        .select('*')
        .eq('status', 'confirmed')
        .order('date', { ascending: true });

      if (error) throw error;
      
      // Charger les artistes associés
      const stopsWithArtists = await Promise.all((data || []).map(async (stop) => {
        if (stop.artist_lineup && Array.isArray(stop.artist_lineup)) {
          const artistIds = stop.artist_lineup.map((a: any) => typeof a === 'string' ? a : a.id).filter(Boolean);
          
          if (artistIds.length > 0) {
            const { data: artists } = await supabase
              .from('centralized_artists')
              .select('id, name, image')
              .in('id', artistIds);
            
            return { ...stop, artists: artists || [] };
          }
        }
        return { ...stop, artists: [] };
      }));
      
      setTourStops(stopsWithArtists);
    } catch (error) {
      console.error('Error loading tour stops:', error);
      setTourStops([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead 
        title="Tournée - MusiConnect"
        description="Découvrez toutes les dates de notre tournée"
      />
      
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Notre Tournée</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Retrouvez-nous sur scène à travers toute la France
            </p>
          </div>

          {tourStops.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Aucune date de tournée programmée pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {tourStops.map((stop) => (
                <Card key={stop.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1 space-y-4">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">{stop.city}</h3>
                              <p className="text-lg text-gray-600">{stop.venue}</p>
                            </div>
                            <Badge className={getStatusColor(stop.status)}>
                              {stop.status === 'confirmed' ? 'Confirmé' : 
                               stop.status === 'pending' ? 'En attente' : 
                               stop.status === 'cancelled' ? 'Annulé' : stop.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(stop.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {stop.time}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-2" />
                            {stop.address}
                          </div>
                        </div>

                        {stop.artists && stop.artists.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Spectacles :</p>
                            <div className="flex flex-wrap gap-2">
                              {stop.artists.map((artist: any) => (
                                <Badge key={artist.id} variant="outline" className="bg-purple-50">
                                  {artist.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {stop.capacity && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="h-4 w-4 mr-2" />
                            Capacité: {stop.capacity} personnes
                            {stop.tickets_available && (
                              <span className="ml-2">
                                ({stop.tickets_available} places disponibles)
                              </span>
                            )}
                          </div>
                        )}

                        {stop.notes && (
                          <p className="text-sm text-gray-600 mt-2">{stop.notes}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};