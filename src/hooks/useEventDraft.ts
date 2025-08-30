import { useState, useEffect } from 'react';

interface EventDraft {
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
  budget_min: number | undefined;
  budget_max: number | undefined;
  attendees_count: number | undefined;
  requirements: string;
  notes: string;
  contact_id: string;
}

const DRAFT_KEY = 'event-draft';

export const useEventDraft = () => {
  const [draft, setDraft] = useState<EventDraft | null>(null);

  // Charger le brouillon au montage
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        setDraft(JSON.parse(savedDraft));
      } catch (error) {
        console.error('Erreur lors du chargement du brouillon:', error);
        localStorage.removeItem(DRAFT_KEY);
      }
    }
  }, []);

  // Sauvegarder le brouillon
  const saveDraft = (formData: EventDraft) => {
    // Ne sauvegarder que si au moins un champ est rempli
    const hasContent = Object.values(formData).some(value => 
      value !== '' && value !== undefined && value !== null
    );

    if (hasContent) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      setDraft(formData);
    }
  };

  // Effacer le brouillon
  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(null);
  };

  // Vérifier si un brouillon existe
  const hasDraft = () => {
    return draft !== null && Object.values(draft).some(value => 
      value !== '' && value !== undefined && value !== null
    );
  };

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft
  };
};