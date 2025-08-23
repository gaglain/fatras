
import { useState } from 'react';
import { toast } from 'sonner';
import { TourStop, FormData } from '@/types/roadshow.types';
import { useMessaging } from '@/hooks/useMessaging';

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
  tourStops: TourStop[],
  setTourStops: React.Dispatch<React.SetStateAction<TourStop[]>>,
  currentUserId: string | undefined
) => {
  const { createChannel } = useMessaging();
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
    const newStop: TourStop = {
      id: Date.now().toString(),
      ...formData,
      capacity: parseInt(formData.capacity),
      ticketsAvailable: parseInt(formData.ticketsAvailable),
      createdBy: currentUserId || 'unknown'
    };
    
    setTourStops([...tourStops, newStop]);

    // Create a messaging channel for this roadshow stop
    if (createChannel) {
      const channelName = `${formData.city} - ${formData.venue}`;
      const description = `Canal pour l'étape de tournée à ${formData.city}`;
      
      // Get user IDs from the team members
      // Note: crew is a string array, so we'll just use the current user for now
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

  const handleUpdateStop = () => {
    if (!selectedStop) return;
    
    const updatedStops = tourStops.map(stop => 
      stop.id === selectedStop.id 
        ? { 
            ...stop, 
            ...formData,
            capacity: parseInt(formData.capacity),
            ticketsAvailable: parseInt(formData.ticketsAvailable)
          }
        : stop
    );
    
    setTourStops(updatedStops);
    setShowEditDialog(false);
    setSelectedStop(null);
    resetForm();
    toast.success("Étape de tournée mise à jour avec succès");
  };

  const handleDeleteStop = (stopId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette étape ?')) {
      setTourStops(tourStops.filter(stop => stop.id !== stopId));
      toast.success("Étape de tournée supprimée");
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
