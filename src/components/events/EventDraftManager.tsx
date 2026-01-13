import React, { useEffect } from 'react';
import { toast } from 'sonner';

interface EventFormData {
  title: string;
  description: string;
  event_type: string;
  venue: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  start_date: string;
  end_date: string;
  status: string;
  budget_min: string;
  budget_max: string;
  attendees_count: string;
  requirements: string;
  notes: string;
  contact_id: string;
  artist_id: string;
  booking_url: string;
  owner_id: string;
}

interface EventDraftManagerProps {
  formData: EventFormData;
  onFormDataChange: (data: EventFormData) => void;
  eventId?: string;
}

export const EventDraftManager: React.FC<EventDraftManagerProps> = ({
  formData,
  onFormDataChange,
  eventId
}) => {
  const draftKey = eventId ? `event_draft_${eventId}` : 'new_event_draft';

  // Charger le brouillon au montage
  useEffect(() => {
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        onFormDataChange(draft);
        toast.info('Brouillon restauré');
      } catch {
        localStorage.removeItem(draftKey);
      }
    }
  }, [draftKey, onFormDataChange]);

  // Sauvegarder automatiquement
  useEffect(() => {
    const saveDraft = () => {
      try {
        localStorage.setItem(draftKey, JSON.stringify(formData));
      } catch {
        // Silent - draft save failed
      }
    };

    const timeoutId = setTimeout(saveDraft, 2000); // Sauvegarde après 2s d'inactivité
    
    return () => clearTimeout(timeoutId);
  }, [formData, draftKey]);

  // Nettoyer le brouillon lors de la soumission réussie
  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  return null; // Composant invisible qui gère juste la logique
};

// Hook pour utiliser le draft manager
export const useEventDraft = (eventId?: string) => {
  const draftKey = eventId ? `event_draft_${eventId}` : 'new_event_draft';

  const clearDraft = () => {
    localStorage.removeItem(draftKey);
  };

  const getDraft = (): EventFormData | null => {
    try {
      const draft = localStorage.getItem(draftKey);
      return draft ? JSON.parse(draft) : null;
    } catch {
      return null;
    }
  };

  const saveDraft = (data: EventFormData) => {
    try {
      localStorage.setItem(draftKey, JSON.stringify(data));
    } catch {
      // Silent - draft save failed
    }
  };

  return { clearDraft, getDraft, saveDraft };
};