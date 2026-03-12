import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SEOHead } from '@/components/SEOHead';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Users, Building2, Phone, Car, Music, FileText, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RoadsheetData {
  stop: any;
  artists: any[];
  lineupMembers: any[];
}

export const RoadsheetPublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<RoadsheetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    const fetchData = async () => {
      try {
        const { data: result, error: fnError } = await supabase.functions.invoke('get-roadsheet', {
          body: null,
          headers: { 'Content-Type': 'application/json' },
          method: 'GET',
        });

        // supabase.functions.invoke doesn't support query params easily, use fetch directly
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/get-roadsheet?id=${id}`,
          { headers: { 'Content-Type': 'application/json' } }
        );

        if (!res.ok) throw new Error('Not found');
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (error || !data?.stop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Feuille de route introuvable</h1>
          <p className="text-gray-500">Ce lien n'est plus valide ou la feuille de route a été supprimée.</p>
        </div>
      </div>
    );
  }

  const stop = data.stop;
  const artists = data.artists;
  const lineupMembers = data.lineupMembers;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch { return dateStr; }
  };

  const formatTime = (time: string | null) => time || '—';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmé';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <SEOHead 
        title={`Feuille de route — ${stop.city} | Fatras`}
        description={`Feuille de route pour ${stop.city} — ${stop.venue}`}
      />
      
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">Feuille de route</p>
            <h1 className="text-3xl font-bold text-gray-900">{stop.city}</h1>
            <p className="text-lg text-gray-600 mt-1">{stop.venue}</p>
            <Badge className={`mt-3 ${getStatusColor(stop.status)}`}>
              {getStatusLabel(stop.status)}
            </Badge>
          </div>

          {/* Date & Lieu */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Date & Lieu
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Date</span>
                  <p className="font-medium">{formatDate(stop.event_date)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Heure</span>
                  <p className="font-medium">{formatTime(stop.event_time)}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Adresse</span>
                  <p className="font-medium flex items-start gap-1">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-gray-400" />
                    {stop.address || '—'}
                  </p>
                </div>
                {stop.capacity && (
                  <div>
                    <span className="text-gray-500">Capacité</span>
                    <p className="font-medium">{stop.capacity} personnes</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Horaires détaillés */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" /> Horaires
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                {stop.meeting_point_time && (
                  <div>
                    <span className="text-gray-500">RDV équipe</span>
                    <p className="font-medium">{stop.meeting_point_time}</p>
                  </div>
                )}
                {stop.departure_to_show_time && (
                  <div>
                    <span className="text-gray-500">Départ spectacle</span>
                    <p className="font-medium">{stop.departure_to_show_time}</p>
                  </div>
                )}
                {stop.check_in_time && (
                  <div>
                    <span className="text-gray-500">Arrivée</span>
                    <p className="font-medium">{formatTime(stop.check_in_time)}</p>
                  </div>
                )}
                {stop.soundcheck_time && (
                  <div>
                    <span className="text-gray-500">Balance</span>
                    <p className="font-medium">{stop.soundcheck_time}</p>
                  </div>
                )}
                {stop.doors_time && (
                  <div>
                    <span className="text-gray-500">Ouverture portes</span>
                    <p className="font-medium">{stop.doors_time}</p>
                  </div>
                )}
                {stop.show_start_time && (
                  <div>
                    <span className="text-gray-500">Début spectacle</span>
                    <p className="font-medium">{stop.show_start_time}</p>
                  </div>
                )}
                {stop.show_end_time && (
                  <div>
                    <span className="text-gray-500">Fin spectacle</span>
                    <p className="font-medium">{stop.show_end_time}</p>
                  </div>
                )}
                {stop.curfew_time && (
                  <div>
                    <span className="text-gray-500">Couvre-feu</span>
                    <p className="font-medium">{stop.curfew_time}</p>
                  </div>
                )}
                {stop.departure_time && (
                  <div>
                    <span className="text-gray-500">Départ</span>
                    <p className="font-medium">{formatTime(stop.departure_time)}</p>
                  </div>
                )}
              </div>
              {stop.meeting_point_location && (
                <div className="text-sm border-t pt-3 mt-3">
                  <span className="text-gray-500">Lieu de RDV</span>
                  <p className="font-medium">{stop.meeting_point_location}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Équipe / Lineup */}
          {lineupMembers.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" /> Équipe
                </h2>
                <div className="space-y-2">
                  {lineupMembers.map((member: any) => {
                    const lineupEntry = stop.artist_lineup?.find((a: any) => a.userId === member.user_id);
                    return (
                      <div key={member.user_id} className="flex items-center gap-3 text-sm">
                        {member.avatar_url ? (
                          <img src={member.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {(member.first_name?.[0] || '') + (member.last_name?.[0] || '')}
                          </div>
                        )}
                        <div>
                          <p className="font-medium">
                            {member.first_name} {member.last_name}
                            {member.function_title && <span className="text-gray-400 ml-1">— {member.function_title}</span>}
                          </p>
                        </div>
                        {lineupEntry?.confirmed && (
                          <Badge variant="outline" className="ml-auto text-green-600 border-green-300 text-xs">Confirmé</Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Artistes / Spectacles */}
          {artists.length > 0 && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" /> Spectacles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {artists.map((artist: any) => (
                    <Badge key={artist.id} variant="outline" className="bg-purple-50">
                      {artist.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transport */}
          {(stop.vehicle_type || stop.distance_km || stop.departure_address || stop.transport) && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Car className="h-5 w-5 text-primary" /> Transport
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {stop.vehicle_type && (
                    <div>
                      <span className="text-gray-500">Véhicule</span>
                      <p className="font-medium">{stop.vehicle_type}</p>
                    </div>
                  )}
                  {stop.distance_km && (
                    <div>
                      <span className="text-gray-500">Distance</span>
                      <p className="font-medium">{stop.distance_km} km</p>
                    </div>
                  )}
                  {stop.departure_address && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Adresse de départ</span>
                      <p className="font-medium">{stop.departure_address}</p>
                    </div>
                  )}
                  {stop.transport && (
                    <div className="sm:col-span-2">
                      <span className="text-gray-500">Notes transport</span>
                      <p className="font-medium">{stop.transport}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hébergement */}
          {(stop.accommodation || stop.accommodation_address) && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" /> Hébergement
                </h2>
                <div className="text-sm space-y-2">
                  {stop.accommodation && (
                    <div>
                      <span className="text-gray-500">Lieu</span>
                      <p className="font-medium">{stop.accommodation}</p>
                    </div>
                  )}
                  {stop.accommodation_address && (
                    <div>
                      <span className="text-gray-500">Adresse</span>
                      <p className="font-medium">{stop.accommodation_address}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contact local */}
          {(stop.local_contact || stop.local_contact_phone) && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <Phone className="h-5 w-5 text-primary" /> Contact local
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  {stop.local_contact && (
                    <div>
                      <span className="text-gray-500">Nom</span>
                      <p className="font-medium">{stop.local_contact}</p>
                    </div>
                  )}
                  {stop.local_contact_phone && (
                    <div>
                      <span className="text-gray-500">Téléphone</span>
                      <p className="font-medium">
                        <a href={`tel:${stop.local_contact_phone}`} className="text-primary hover:underline">
                          {stop.local_contact_phone}
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes & Invitations */}
          {(stop.notes || stop.invitations) && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Notes
                </h2>
                {stop.notes && (
                  <div className="text-sm">
                    <span className="text-gray-500">Notes</span>
                    <p className="font-medium whitespace-pre-wrap">{stop.notes}</p>
                  </div>
                )}
                {stop.invitations && (
                  <div className="text-sm">
                    <span className="text-gray-500">Invitations</span>
                    <p className="font-medium whitespace-pre-wrap">{stop.invitations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <p className="text-center text-xs text-gray-400 pt-4">
            Feuille de route générée par Fatras
          </p>
        </div>
      </div>
    </>
  );
};
