import React from 'react';
import { TourStop } from '@/types/roadshow.types';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Calendar } from 'lucide-react';

interface TourStopWithCosts extends TourStop {
  travelCost?: number;
  co2Emission?: number;
}

interface RoadshowTimelineProps {
  stops: TourStopWithCosts[];
  getUserById: (userId: string) => { name: string } | undefined;
  onStopClick?: (stop: TourStop) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20';
    case 'pending': return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20';
    case 'cancelled': return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20 opacity-60';
    default: return 'border-l-muted';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed': return 'Confirmé';
    case 'pending': return 'En attente';
    case 'cancelled': return 'Annulé';
    default: return status;
  }
};

const getDaysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

export const RoadshowTimeline: React.FC<RoadshowTimelineProps> = ({ stops, getUserById, onStopClick }) => {
  const sortedStops = [...stops].sort((a, b) => 
    new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
  );

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

      <div className="space-y-0">
        {sortedStops.map((stop, index) => {
          const prevStop = index > 0 ? sortedStops[index - 1] : null;
          const daysBetween = prevStop && prevStop.date && stop.date 
            ? getDaysBetween(prevStop.date, stop.date) 
            : null;
          const isOff = daysBetween !== null && daysBetween > 1;

          return (
            <React.Fragment key={stop.id}>
              {/* Day off indicator */}
              {isOff && (
                <div className="relative pl-10 py-2">
                  <div className="absolute left-[11px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-muted border-2 border-background" />
                  <div className="text-xs text-muted-foreground italic flex items-center gap-1">
                    <span>☀️ {daysBetween! - 1} jour{daysBetween! - 1 > 1 ? 's' : ''} off</span>
                    {stop.distanceKm && (
                      <span className="ml-2">• 🚗 {stop.distanceKm} km</span>
                    )}
                    {(stop as TourStopWithCosts).travelCost && (
                      <span className="ml-1 text-emerald-600">({(stop as TourStopWithCosts).travelCost!.toFixed(0)}€)</span>
                    )}
                  </div>
                </div>
              )}

              {/* Stop entry */}
              <div 
                className={`relative pl-10 py-3 cursor-pointer hover:bg-accent/50 transition-colors rounded-r-lg border-l-4 ${getStatusColor(stop.status)}`}
                onClick={() => onStopClick?.(stop)}
              >
                {/* Timeline dot */}
                <div className={`absolute left-[9px] top-5 w-4 h-4 rounded-full border-2 border-background ${
                  stop.status === 'confirmed' ? 'bg-green-500' : 
                  stop.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />

                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {/* Date */}
                  <div className="flex items-center gap-2 min-w-[140px]">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {stop.date ? new Date(stop.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short', day: 'numeric', month: 'short' 
                      }) : '—'}
                    </span>
                  </div>

                  {/* City & Venue */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <MapPin className="h-3 w-3 text-primary flex-shrink-0" />
                    <span className="font-semibold text-sm truncate">{stop.city}</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">— {stop.venue}</span>
                  </div>

                  {/* Time */}
                  {stop.time && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{stop.time}</span>
                    </div>
                  )}

                  {/* Status */}
                  <Badge variant="outline" className="text-xs w-fit">
                    {getStatusLabel(stop.status)}
                  </Badge>
                </div>

                {/* Detailed schedule row */}
                {(stop.soundcheckTime || stop.doorsTime || stop.showStartTime) && (
                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground pl-5">
                    {stop.soundcheckTime && <span>🎵 {stop.soundcheckTime}</span>}
                    {stop.doorsTime && <span>🚪 {stop.doorsTime}</span>}
                    {stop.showStartTime && <span>🎭 {stop.showStartTime}</span>}
                    {stop.showEndTime && <span>🏁 {stop.showEndTime}</span>}
                  </div>
                )}

                {/* Casting preview */}
                {stop.artistLineup.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1 pl-5">
                    {stop.artistLineup.slice(0, 3).map(a => {
                      const u = getUserById(a.userId);
                      return (
                        <Badge key={a.userId} variant="secondary" className="text-[10px] px-1.5 py-0">
                          {u?.name || '?'} {a.confirmed ? '✓' : '?'}
                        </Badge>
                      );
                    })}
                    {stop.artistLineup.length > 3 && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        +{stop.artistLineup.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {sortedStops.length === 0 && (
        <p className="text-center text-muted-foreground py-8">Aucune étape à afficher.</p>
      )}
    </div>
  );
};
