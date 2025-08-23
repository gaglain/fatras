
import { useState } from 'react';
import { toast } from 'sonner';
import { TourStop, FormData } from '@/types/roadshow.types';
import { useMessaging } from '@/hooks/useMessaging';
import { useRoadshowStops } from '@/hooks/useRoadshowStops';

const initialFormData: FormData = {
  city: '',
  venue: '',
  address: '',
  date: '',
  time: '',
  checkInTime: '',
  departureTime: '',
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
  artistLineup: []
};

export const useRoadshowForm = (
  currentUserId: string | undefined
) => {
  const { createChannel } = useMessaging();
  const { createStop, updateStop, deleteStop, convertFromTourStop } = useRoadshowStops();
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

    // Convert form data to database format
    const stopData = convertFromTourStop({
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      ticketsAvailable: parseInt(formData.ticketsAvailable) || 0
    });

    const newStop = await createStop(stopData);
    
    if (newStop) {
      // Create a messaging channel for this roadshow stop
      if (createChannel) {
        const channelName = `${formData.city} - ${formData.venue}`;
        const description = `Canal pour l'étape de tournée à ${formData.city}`;
        
        // Get user IDs from the team members
        const memberIds: string[] = [];
        
        await createChannel(
          channelName,
          description,
          'private', // Private channel for team members only
          memberIds,
          newStop.id // Link to roadshow
        );
      }
      
      setShowCreateDialog(false);
      resetForm();
      toast.success("Étape de tournée créée avec succès");
    } else {
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
      artistLineup: stop.artistLineup || []
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
