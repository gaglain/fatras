import { useState } from 'react';
import { TourStop, FormData } from '@/types/roadshow.types';
import { useRoadshowStopCreate } from './roadshow/useRoadshowStopCreate';
import { useRoadshowStopEdit } from './roadshow/useRoadshowStopEdit';

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
  hasDressingRoom: false,
  dressingRoomAddress: '',
  localContact: '',
  localContactPhone: '',
  transport: '',
  artistLineup: [],
  invitations: '',
};

export const useRoadshowForm = (
  currentUserId: string | undefined,
  roadshowActions: {
    createStop: any;
    updateStop: any;
    archiveStop: any;
    convertFromTourStop: any;
  }
) => {
  const { createStop, updateStop, archiveStop, convertFromTourStop } = roadshowActions;
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTab, setSelectedTab] = useState<string>('general');

  const { handleCreateStop: createStopHandler } = useRoadshowStopCreate(createStop, convertFromTourStop);
  const {
    selectedStop,
    setSelectedStop,
    showEditDialog,
    setShowEditDialog,
    handleEditStop: editStopHandler,
    handleUpdateStop: updateStopHandler,
    handleArchiveStop,
  } = useRoadshowStopEdit(updateStop, archiveStop, convertFromTourStop);

  const resetForm = () => {
    setFormData(initialFormData);
    setSelectedTab('general');
  };

  const handleCreateStop = () =>
    createStopHandler(formData, () => {
      setShowCreateDialog(false);
      resetForm();
    });

  const handleEditStop = (stop: TourStop) =>
    editStopHandler(stop, setFormData);

  const handleUpdateStop = () =>
    updateStopHandler(formData, resetForm);

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
    handleArchiveStop,
  };
};
