import React, { useState, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { TourStop } from '@/types/roadshow.types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ArtistConfirmationPopupProps {
  userId: string;
  stops: TourStop[];
  getUserById: (userId: string) => { name: string } | undefined;
  onConfirmed: () => void;
}

export const ArtistConfirmationPopup: React.FC<ArtistConfirmationPopupProps> = ({
  userId,
  stops,
  getUserById,
  onConfirmed
}) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Find stops where this user is in the lineup but hasn't confirmed
  const pendingStops = useMemo(() => {
    return stops.filter(stop =>
      stop.artistLineup?.some(a => a.userId === userId && !a.confirmed) &&
      !dismissedIds.has(stop.id)
    );
  }, [stops, userId, dismissedIds]);

  const currentStop = pendingStops[0];

  if (!currentStop) return null;

  const handleConfirm = async (confirmed: boolean) => {
    setLoading(currentStop.id);
    try {
      const { error } = await supabase.rpc('confirm_roadshow_attendance', {
        stop_id: currentStop.id,
        is_confirmed: confirmed
      });

      if (error) throw error;

      toast.success(confirmed
        ? 'Présence confirmée !'
        : 'Indisponibilité signalée'
      );

      setDismissedIds(prev => new Set([...prev, currentStop.id]));
      onConfirmed();
    } catch (error) {
      console.error('Error confirming attendance:', error);
      toast.error('Erreur lors de la confirmation');
    } finally {
      setLoading(null);
    }
  };

  return (
    <AlertDialog open={true}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <CheckCircle className="h-5 w-5 text-primary" />
            Confirmez votre présence
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 pt-2">
              <p className="text-sm text-muted-foreground">
                Vous avez été assigné à une étape de tournée. Veuillez confirmer votre disponibilité.
              </p>

              <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="font-semibold text-foreground">
                    {currentStop.city} — {currentStop.venue}
                  </span>
                </div>
                {currentStop.date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    {new Date(currentStop.date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                )}
                {currentStop.time && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0" />
                    {currentStop.time}
                  </div>
                )}
                <Badge variant="outline" className="text-xs">
                  {currentStop.status === 'confirmed' ? 'Confirmé' :
                   currentStop.status === 'pending' ? 'En attente' : 'Annulé'}
                </Badge>
              </div>

              {pendingStops.length > 1 && (
                <p className="text-xs text-muted-foreground text-center">
                  + {pendingStops.length - 1} autre{pendingStops.length > 2 ? 's' : ''} étape{pendingStops.length > 2 ? 's' : ''} à confirmer
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={!!loading}
            onClick={() => handleConfirm(false)}
          >
            <XCircle className="h-4 w-4 mr-2" />
            Indisponible
          </Button>
          <Button
            className="flex-1"
            disabled={!!loading}
            onClick={() => handleConfirm(true)}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Je confirme
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
