import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Stepper } from '@/components/ui/stepper';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { EventStep, TaskStep, OpportunityStep } from './CreationSuiteSteps';

interface ContactCreationSuiteProps {
  isOpen: boolean;
  onClose: () => void;
  contactId: string;
  contactName: string;
}

const steps = [
  { id: 1, name: 'Événement', description: 'Créer un événement lié' },
  { id: 2, name: 'Tâche', description: 'Créer une tâche de suivi' },
  { id: 3, name: 'Opportunité', description: 'Créer une opportunité' }
];

export const ContactCreationSuite: React.FC<ContactCreationSuiteProps> = ({ isOpen, onClose, contactId, contactName }) => {
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const { addOpportunity } = useOpportunities();
  const { addTask } = useTasks();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [createdIds, setCreatedIds] = useState<{ eventId?: string; opportunityId?: string; taskId?: string }>({});
  const prevIsOpenRef = useRef(false);
  const draftKey = `contact-creation-suite-${contactId}`;

  const [commonData, setCommonData] = useState({ address: '', postal_code: '', city: '', artist_id: '' });
  const [eventData, setEventData] = useState({ title: '', description: '', event_type: 'concert', venue: '', start_date: '', budget_min: 0, budget_max: 0 });
  const [opportunityData, setOpportunityData] = useState({ title: '', description: '', venue: '', budget: 0, probability_percentage: 50, deadline: '', requirements: '' });
  const [taskData, setTaskData] = useState({ title: '', description: '', task_type: 'Autre' as const, priority: 'medium' as const, due_date: '' });

  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      const { data } = await supabase.from('centralized_artists').select('id, name').eq('user_id', user.id).eq('status', 'active').order('name');
      if (data) setArtists(data);
    };
    fetchArtists();
  }, [user]);

  useEffect(() => {
    const justOpened = isOpen && !prevIsOpenRef.current;
    prevIsOpenRef.current = isOpen;
    if (!justOpened) return;
    try {
      const rawDraft = sessionStorage.getItem(draftKey);
      if (!rawDraft) return;
      const draft = JSON.parse(rawDraft);
      setCurrentStep(draft.currentStep ?? 1);
      setCreatedIds(draft.createdIds ?? {});
      setCommonData(draft.commonData ?? { address: '', postal_code: '', city: '', artist_id: '' });
      setEventData(draft.eventData ?? { title: '', description: '', event_type: 'concert', venue: '', start_date: '', budget_min: 0, budget_max: 0 });
      setOpportunityData(draft.opportunityData ?? { title: '', description: '', venue: '', budget: 0, probability_percentage: 50, deadline: '', requirements: '' });
      setTaskData(draft.taskData ?? { title: '', description: '', task_type: 'Autre', priority: 'medium', due_date: '' });
    } catch { sessionStorage.removeItem(draftKey); }
  }, [isOpen, draftKey]);

  useEffect(() => {
    if (!isOpen) return;
    try { sessionStorage.setItem(draftKey, JSON.stringify({ currentStep, createdIds, commonData, eventData, opportunityData, taskData })); } catch {}
  }, [isOpen, draftKey, currentStep, createdIds, commonData, eventData, opportunityData, taskData]);

  const clearDraft = () => { try { sessionStorage.removeItem(draftKey); } catch {} };
  const handleCloseSuite = () => { clearDraft(); onClose(); };

  const handleCreateEvent = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const event = await addEvent({ user_id: user.id, contact_id: contactId, artist_id: commonData.artist_id || undefined, title: eventData.title, description: eventData.description, event_type: eventData.event_type, venue: eventData.venue, address: commonData.address, city: commonData.city, postal_code: commonData.postal_code, start_date: eventData.start_date, budget_min: eventData.budget_min, budget_max: eventData.budget_max, status: 'pending' });
      if (event) { setCreatedIds(prev => ({ ...prev, eventId: event.id })); toast.success('Événement créé avec succès'); setCurrentStep(2); }
    } catch { toast.error('Erreur lors de la création de l\'événement'); }
    finally { setLoading(false); }
  };

  const handleCreateTask = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const task = await addTask({ user_id: user.id, contact_id: contactId, event_id: createdIds.eventId, artist_id: commonData.artist_id || undefined, title: taskData.title, description: taskData.description, task_type: taskData.task_type, priority: taskData.priority, status: 'todo', due_date: taskData.due_date });
      if (task) { setCreatedIds(prev => ({ ...prev, taskId: task.id })); toast.success('Tâche créée avec succès'); setCurrentStep(3); }
    } catch { toast.error('Erreur lors de la création de la tâche'); }
    finally { setLoading(false); }
  };

  const handleCreateOpportunity = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const opportunity = await addOpportunity({ user_id: user.id, contact_id: contactId, event_id: createdIds.eventId, artist_id: commonData.artist_id || undefined, title: opportunityData.title, description: opportunityData.description, venue: opportunityData.venue, location: `${commonData.city}${commonData.postal_code ? ' (' + commonData.postal_code + ')' : ''}`, budget: opportunityData.budget, probability_percentage: opportunityData.probability_percentage, deadline: opportunityData.deadline, requirements: opportunityData.requirements, status: 'open', contact: contactName, date: '' });
      if (opportunity) { setCreatedIds(prev => ({ ...prev, opportunityId: opportunity.id })); clearDraft(); toast.success('Opportunité créée avec succès'); toast.success('Suite de création terminée !'); handleCloseSuite(); }
    } catch { toast.error('Erreur lors de la création de l\'opportunité'); }
    finally { setLoading(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleCloseSuite(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" />Suite de création pour {contactName}</DialogTitle>
        </DialogHeader>
        <div className="mb-6">
          <Stepper steps={steps} currentStep={currentStep} onStepClick={(step) => { if (step < currentStep) setCurrentStep(step); }} />
        </div>
        {currentStep === 1 && <EventStep commonData={commonData} setCommonData={setCommonData} eventData={eventData} setEventData={setEventData} artists={artists} loading={loading} onCreateEvent={handleCreateEvent} onSkip={() => setCurrentStep(2)} onCancel={onClose} />}
        {currentStep === 2 && <TaskStep commonData={commonData} artists={artists} taskData={taskData} setTaskData={setTaskData} loading={loading} onCreateTask={handleCreateTask} onSkip={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />}
        {currentStep === 3 && <OpportunityStep commonData={commonData} artists={artists} opportunityData={opportunityData} setOpportunityData={setOpportunityData} loading={loading} onCreateOpportunity={handleCreateOpportunity} onBack={() => setCurrentStep(2)} />}
      </DialogContent>
    </Dialog>
  );
};
