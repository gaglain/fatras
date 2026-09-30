import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, Phone, Clock, FileText, MapPin, Bed, Utensils } from 'lucide-react';

interface RoadshowDoc {
  id: string;
  file_name: string;
  category?: string | null;
  description?: string | null;
  url: string;
}

interface OnTheRoadPanelProps {
  stop: any;
  documents?: RoadshowDoc[];
}

const buildAddress = (stop: any) =>
  [stop?.address, stop?.venue, stop?.city].filter(Boolean).join(', ');

const timeRows = (stop: any) => {
  const rows: Array<{ label: string; value: string | null }> = [
    { label: 'Rendez-vous', value: stop?.meeting_point_time },
    { label: 'Départ vers le spectacle', value: stop?.departure_to_show_time },
    { label: 'Arrivée sur place', value: stop?.check_in_time },
    { label: 'Montage / balance', value: stop?.soundcheck_time },
    { label: 'Repas', value: stop?.meal_time },
    { label: 'Ouverture des portes', value: stop?.doors_time },
    { label: 'Début du spectacle', value: stop?.show_start_time || stop?.event_time },
    { label: 'Fin du spectacle', value: stop?.show_end_time },
    { label: 'Départ après le spectacle', value: stop?.departure_time },
    { label: 'Couvre-feu', value: stop?.curfew_time },
  ];
  return rows.filter(r => !!r.value);
};

export const OnTheRoadPanel: React.FC<OnTheRoadPanelProps> = ({ stop, documents = [] }) => {
  const address = buildAddress(stop);
  const hasCoords = stop?.latitude && stop?.longitude;
  const destination = hasCoords ? `${stop.latitude},${stop.longitude}` : address;

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
  const wazeUrl = hasCoords
    ? `https://waze.com/ul?ll=${stop.latitude},${stop.longitude}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;

  const calls = [
    { label: stop?.local_contact || 'Contact sur place', role: 'Accueil / régie du lieu', phone: stop?.local_contact_phone },
    { label: stop?.technical_contact_name || 'Régisseur technique', role: 'Technique', phone: stop?.technical_contact_phone },
  ].filter(c => !!c.phone);

  const times = timeRows(stop);

  return (
    <Card className="border-2 border-primary/30 bg-primary/5">
      <CardContent className="p-4 sm:p-6 space-y-5">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground">Sur la route</p>
          <h2 className="text-xl font-semibold">L'essentiel du jour</h2>
        </div>

        {/* GPS */}
        {(address || hasCoords) && (
          <div className="space-y-2">
            <p className="text-sm flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
              <span>{address || `${stop.latitude}, ${stop.longitude}`}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button asChild size="lg" className="w-full">
                <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />Google Maps
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="w-full">
                <a href={wazeUrl} target="_blank" rel="noopener noreferrer">
                  <Navigation className="h-4 w-4 mr-2" />Waze
                </a>
              </Button>
            </div>
          </div>
        )}

        {/* Appels directs */}
        {calls.length > 0 && (
          <div className="space-y-2">
            {calls.map((c) => (
              <Button key={c.phone} asChild variant="secondary" size="lg" className="w-full justify-start">
                <a href={`tel:${String(c.phone).replace(/\s/g, '')}`}>
                  <Phone className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate text-left">
                    Appeler {c.label}
                    <span className="block text-xs opacity-70">{c.role} · {c.phone}</span>
                  </span>
                </a>
              </Button>
            ))}
          </div>
        )}

        {/* Horaires clés */}
        {times.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-2"><Clock className="h-4 w-4 text-primary" />Horaires clés</p>
            <ul className="divide-y rounded-md border bg-background">
              {times.map((t) => (
                <li key={t.label} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{t.label}</span>
                  <span className="font-medium tabular-nums">{t.value}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hébergement & repas */}
        {(stop?.accommodation || stop?.meal_location) && (
          <div className="grid gap-2 sm:grid-cols-2">
            {stop?.accommodation && (
              <div className="rounded-md border bg-background p-3 text-sm">
                <p className="font-medium flex items-center gap-2 mb-1"><Bed className="h-4 w-4 text-primary" />Hébergement</p>
                <p>{stop.accommodation}</p>
                {stop.accommodation_address && (
                  <a className="text-xs underline" target="_blank" rel="noopener noreferrer"
                     href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(stop.accommodation_address)}`}>
                    {stop.accommodation_address}
                  </a>
                )}
              </div>
            )}
            {stop?.meal_location && (
              <div className="rounded-md border bg-background p-3 text-sm">
                <p className="font-medium flex items-center gap-2 mb-1"><Utensils className="h-4 w-4 text-primary" />Repas</p>
                <p>{stop.meal_location}</p>
                {stop.meal_time && <p className="text-xs text-muted-foreground">{stop.meal_time}</p>}
              </div>
            )}
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 && (
          <div>
            <p className="text-sm font-medium flex items-center gap-2 mb-2"><FileText className="h-4 w-4 text-primary" />Documents</p>
            <div className="space-y-2">
              {documents.map((doc) => (
                <Button key={doc.id} asChild variant="outline" size="sm" className="w-full justify-start">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer">
                    <FileText className="h-4 w-4 mr-2 shrink-0" />
                    <span className="truncate">{doc.description || doc.file_name}</span>
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
