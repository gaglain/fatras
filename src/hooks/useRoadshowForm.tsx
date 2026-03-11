
import { useState } from 'react';
import { toast } from 'sonner';
import { TourStop, FormData } from '@/types/roadshow.types';
import { useMessaging } from '@/hooks/useMessaging';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

const initialFormData: FormData = {
  city: '',
  venue: '',
  address: '',
  date: '',
  time: '',
  checkInTime: '',
  departureTime: '',
  meetingPointTime: '',
  meetingPointLocation: '',
  departureToShowTime: '',
  capacity: '',
  ticketsAvailable: '',
  status: 'pending',
  crew: [],
  equipment: [],
  notes: '',
  artists: [],
  accommodation: '',
  accommodationAddress: '',
  localContact: '',
  localContactPhone: '',
  transport: '',
  artistLineup: [],
  invitations: ''
};

export const useRoadshowForm = (
  currentUserId: string | undefined,
  roadshowActions: {
    createStop: any;
    updateStop: any;
    deleteStop: any;
    convertFromTourStop: any;
  }
) => {
  const { createChannel, deleteChannelsByRoadshow } = useMessaging();
  const { createStop, updateStop, deleteStop, convertFromTourStop } = roadshowActions;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('general');

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTab('general');
  };

  const handleCreateStop = async () => {
    if (!formData.city || !formData.venue) {
      toast.error("Veuillez remplir au moins la ville et le lieu");
      return;
    }

    try {
      // Convert form data to database format
      const stopData = convertFromTourStop({
        ...formData,
        capacity: parseInt(formData.capacity) || 0,
        ticketsAvailable: parseInt(formData.ticketsAvailable) || 0
      });

      const newStop = await createStop(stopData);
      
      if (newStop) {
        // Get user IDs from the artistLineup members
        const memberIds: string[] = formData.artistLineup
          .map(a => a.userId)
          .filter(Boolean);

        // Try to create a messaging channel for this roadshow stop
        if (createChannel) {
          try {
            // Make channel name unique by adding timestamp
            const timestamp = Date.now();
            const channelName = `${formData.city} - ${formData.venue} - ${timestamp}`;
            const description = `Canal pour l'étape de tournée à ${formData.city}`;
            
            await createChannel(
              channelName,
              description,
              'private', // Private channel for team members only
              memberIds,
              newStop.id // Link to roadshow
            );
          } catch (channelError: unknown) {
            logger.error('Error creating channel:', channelError);
            // Don't fail the whole operation if channel creation fails
          }
        }

        // Send notifications to all added members
        for (const member of formData.artistLineup) {
          try {
            await supabase
              .from('notifications')
              .insert({
                user_id: member.userId,
                type: 'roadshow_assignment',
                title: 'Assignation à une feuille de route',
                message: `Vous avez été ajouté à la feuille de route "${formData.city} - ${formData.venue}". Veuillez confirmer votre disponibilité.`,
                read: false,
                data: {
                  roadshow_stop_id: newStop.id,
                  action: 'confirm_availability'
                }
              });
          } catch (notifError: unknown) {
            logger.error('Error sending notification:', notifError);
          }
        }
        
        setShowCreateDialog(false);
        resetForm();
        toast.success("Étape de tournée créée avec succès");
      } else {
        toast.error("Erreur lors de la création de l'étape");
      }
    } catch (error: unknown) {
      logger.error('Error in handleCreateStop:', error);
      toast.error("Erreur lors de la création de l'étape");
    }
  };

  const handleEditStop = (stop: TourStop) => {
    setSelectedStop(stop);
    setFormData({
      city: stop.city,
      venue: stop.venue,
      address: stop.address || '',
      date: stop.date,
      time: stop.time,
      checkInTime: stop.checkInTime || '',
      departureTime: stop.departureTime || '',
      soundcheckTime: stop.soundcheckTime || '',
      doorsTime: stop.doorsTime || '',
      showStartTime: stop.showStartTime || '',
      showEndTime: stop.showEndTime || '',
      curfewTime: stop.curfewTime || '',
      capacity: stop.capacity.toString(),
      ticketsAvailable: stop.ticketsAvailable.toString(),
      status: stop.status,
      crew: stop.crew,
      equipment: stop.equipment,
      notes: stop.notes,
      artists: stop.artists,
      accommodation: stop.accommodation || '',
      accommodationAddress: stop.accommodationAddress || '',
      localContact: stop.localContact || '',
      localContactPhone: stop.localContactPhone || '',
      transport: stop.transport || '',
      artistLineup: stop.artistLineup || [],
      invitations: stop.invitations || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdateStop = async () => {
    if (!selectedStop) return;
    
    // Convert form data to database format
    const stopData = convertFromTourStop({
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      ticketsAvailable: parseInt(formData.ticketsAvailable) || 0
    });

    const success = await updateStop(selectedStop.id, stopData);
    
    if (success) {
      setShowEditDialog(false);
      setSelectedStop(null);
      resetForm();
      toast.success("Étape de tournée mise à jour avec succès");
    } else {
      toast.error("Erreur lors de la mise à jour de l'étape");
    }
  };

  const handleDeleteStop = async (stopId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      const success = await deleteStop(stopId);
      if (success) {
        // Also delete associated messaging channel if it exists
        if (deleteChannelsByRoadshow) {
          await deleteChannelsByRoadshow(stopId);
        }
        
        toast.success("Étape de tournée supprimée");
      } else {
        toast.error("Erreur lors de la suppression");
      }
    }
  };

  return {
    formData,
    setFormData,
    selectedStop,
    setSelectedStop,
    showCreateDialog,
    setShowCreateDialog,
    showEditDialog,
    setShowEditDialog,
    selectedTab,
    setSelectedTab,
    resetForm,
    handleCreateStop,
    handleEditStop,
    handleUpdateStop,
    handleDeleteStop
  };
};
