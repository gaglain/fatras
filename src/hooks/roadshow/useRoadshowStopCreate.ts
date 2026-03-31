import { toast } from 'sonner';
import { FormData } from '@/types/roadshow.types';
import { useMessaging } from '@/hooks/useMessaging';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export const useRoadshowStopCreate = (
  createStop: any,
  convertFromTourStop: any
) => {
  const { createChannel } = useMessaging();

  const handleCreateStop = async (
    formData: FormData,
    onSuccess: () => void
  ) => {
    if (!formData.city || !formData.venue) {
      toast.error("Veuillez remplir au moins la ville et le lieu");
      return;
    }

    try {
      const stopData = convertFromTourStop({
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
        ticketsAvailable: parseInt(formData.ticketsAvailable) || 0,
      });

      const newStop = await createStop(stopData);

      if (newStop) {
        const memberIds: string[] = formData.artistLineup
          .map((a) => a.userId)
          .filter(Boolean);

        if (createChannel) {
          try {
            const timestamp = Date.now();
            const channelName = `${formData.city} - ${formData.venue} - ${timestamp}`;
            const description = `Canal pour l'étape de tournée à ${formData.city}`;
            await createChannel(channelName, description, 'private', memberIds, newStop.id);
          } catch (channelError: unknown) {
            logger.error('Error creating channel:', channelError);
          }
        }

        for (const member of formData.artistLineup) {
          try {
            await supabase.from('notifications').insert({
              user_id: member.userId,
              type: 'roadshow_assignment',
              title: 'Assignation à une feuille de route',
              message: `Vous avez été ajouté à la feuille de route "${formData.city} - ${formData.venue}". Veuillez confirmer votre disponibilité.`,
              read: false,
              data: {
                roadshow_stop_id: newStop.id,
                action: 'confirm_availability',
              },
            });
          } catch (notifError: unknown) {
            logger.error('Error sending notification:', notifError);
          }
        }

        onSuccess();
        toast.success("Étape de tournée créée avec succès");
      } else {
        toast.error("Erreur lors de la création de l'étape");
      }
    } catch (error: unknown) {
      logger.error('Error in handleCreateStop:', error);
      toast.error("Erreur lors de la création de l'étape");
    }
  };

  return { handleCreateStop };
};
