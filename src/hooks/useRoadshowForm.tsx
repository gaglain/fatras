
import { useState } from 'react';
import { toast } from 'sonner';
import { TourStop, FormData } from '@/types/roadshow.types';

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
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [selectedStop, setSelectedStop] = useState<TourStop | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('general');

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTab('general');
  };

  const handleCreateStop = () => {
    const newStop: TourStop = {
      id: Date.now().toString(),
      ...formData,
      capacity: parseInt(formData.capacity),
      ticketsAvailable: parseInt(formData.ticketsAvailable),
      createdBy: currentUserId || 'unknown'
    };
    
    setTourStops([...tourStops, newStop]);
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
