import { useState } from 'react';
import { toast } from 'sonner';
import { TourStop, FormData } from '@/types/roadshow.types';

export const useRoadshowStopEdit = (
  updateStop: any,
  archiveStop: any,
  convertFromTourStop: any
) => {
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const handleEditStop = (
    stop: TourStop,
    setFormData: (data: FormData) => void
  ) => {
    setSelectedStop(stop);
    setFormData({
      city: stop.city,
      venue: stop.venue,
      address: stop.address || '',
      date: stop.date,
      time: stop.time,
      checkInTime: stop.checkInTime || '',
      departureTime: stop.departureTime || '',
      meetingPointTime: stop.meetingPointTime || '',
      meetingPointLocation: stop.meetingPointLocation || '',
      departureToShowTime: stop.departureToShowTime || '',
      soundcheckTime: stop.soundcheckTime || '',
      doorsTime: stop.doorsTime || '',
      showStartTime: stop.showStartTime || '',
      showEndTime: stop.showEndTime || '',
      curfewTime: stop.curfewTime || '',
      mealTime: stop.mealTime || '',
      mealLocation: stop.mealLocation || '',
      capacity: stop.capacity.toString(),
      ticketsAvailable: stop.ticketsAvailable.toString(),
      status: stop.status,
      crew: stop.crew,
      equipment: stop.equipment,
      notes: stop.notes,
      artists: stop.artists,
      accommodation: stop.accommodation || '',
      accommodationAddress: stop.accommodationAddress || '',
      hasDressingRoom: stop.hasDressingRoom ?? false,
      dressingRoomAddress: stop.dressingRoomAddress || '',
      localContact: stop.localContact || '',
      localContactPhone: stop.localContactPhone || '',
      technicalContactName: stop.technicalContactName || '',
      technicalContactEmail: stop.technicalContactEmail || '',
      technicalContactPhone: stop.technicalContactPhone || '',
      transport: stop.transport || '',
      artistLineup: stop.artistLineup || [],
      invitations: stop.invitations || '',
    });
    setShowEditDialog(true);
  };

  const handleUpdateStop = async (formData: FormData, onSuccess: () => void) => {
    if (!selectedStop) return;

    const stopData = convertFromTourStop({
      ...formData,
      capacity: parseInt(formData.capacity) || 0,
      ticketsAvailable: parseInt(formData.ticketsAvailable) || 0,
    });

    const success = await updateStop(selectedStop.id, stopData);

    if (success) {
      setShowEditDialog(false);
      setSelectedStop(null);
      onSuccess();
      toast.success("Étape de tournée mise à jour avec succès");
    } else {
      toast.error("Erreur lors de la mise à jour de l'étape");
    }
  };

  const handleArchiveStop = async (stopId: string) => {
    if (confirm('Êtes-vous sûr de vouloir archiver cette étape et sa conversation liée ?')) {
      const success = await archiveStop(stopId);
      if (success) {
        toast.success("Étape de tournée archivée");
      } else {
        toast.error("Erreur lors de l'archivage");
      }
    }
  };

  return {
    selectedStop,
    setSelectedStop,
    showEditDialog,
    setShowEditDialog,
    handleEditStop,
    handleUpdateStop,
    handleArchiveStop,
  };
};
