import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Stepper } from '@/components/ui/stepper';
import { Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEvents } from '@/hooks/useEvents';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useTasks } from '@/hooks/useTasks';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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

export const ContactCreationSuite: React.FC<ContactCreationSuiteProps> = ({
  isOpen,
  onClose,
  contactId,
  contactName
}) => {
  const { user } = useAuth();
  const { addEvent } = useEvents();
  const { addOpportunity } = useOpportunities();
  const { addTask } = useTasks();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [artists, setArtists] = useState<Array<{ id: string; name: string }>>([]);
  const [createdIds, setCreatedIds] = useState<{
    eventId?: string;
    opportunityId?: string;
    taskId?: string;
  }>({});
  const prevIsOpenRef = useRef(false);
  const draftKey = `contact-creation-suite-${contactId}`;

  // Données communes partagées
  const [commonData, setCommonData] = useState({
    address: '',
    postal_code: '',
    city: '',
    artist_id: ''
  });

  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    event_type: 'concert',
    venue: '',
    start_date: '',
    budget_min: 0,
    budget_max: 0
  });

  const [opportunityData, setOpportunityData] = useState({
    title: '',
    description: '',
    venue: '',
    budget: 0,
    probability_percentage: 50,
    deadline: '',
    requirements: ''
  });

  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    task_type: 'Autre' as 'Email' | 'Telephone' | 'RDV' | 'Autre',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    due_date: ''
  });

  // Charger les artistes
  useEffect(() => {
    const fetchArtists = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('name');
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
    } catch {
      sessionStorage.removeItem(draftKey);
    }
  }, [isOpen, draftKey]);

  const handleCreateEvent = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const event = await addEvent({
        user_id: user.id,
        contact_id: contactId,
        artist_id: commonData.artist_id || undefined,
        title: eventData.title,
        description: eventData.description,
        event_type: eventData.event_type,
        venue: eventData.venue,
        address: commonData.address,
        city: commonData.city,
        postal_code: commonData.postal_code,
        start_date: eventData.start_date,
        budget_min: eventData.budget_min,
        budget_max: eventData.budget_max,
        status: 'pending'
      });

      if (event) {
        setCreatedIds(prev => ({ ...prev, eventId: event.id }));
        toast.success('Événement créé avec succès');
        setCurrentStep(2); // Passe à Tâche
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'événement');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOpportunity = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const opportunity = await addOpportunity({
        user_id: user.id,
        contact_id: contactId,
        event_id: createdIds.eventId,
        artist_id: commonData.artist_id || undefined,
        title: opportunityData.title,
        description: opportunityData.description,
        venue: opportunityData.venue,
        location: `${commonData.city}${commonData.postal_code ? ' (' + commonData.postal_code + ')' : ''}`,
        budget: opportunityData.budget,
        probability_percentage: opportunityData.probability_percentage,
        deadline: opportunityData.deadline,
        requirements: opportunityData.requirements,
        status: 'open',
        contact: contactName,
        date: ''
      });

      if (opportunity) {
        setCreatedIds(prev => ({ ...prev, opportunityId: opportunity.id }));
        toast.success('Opportunité créée avec succès');
        toast.success('Suite de création terminée !');
        onClose();
      }
    } catch (error) {
      toast.error('Erreur lors de la création de l\'opportunité');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const task = await addTask({
        user_id: user.id,
        contact_id: contactId,
        event_id: createdIds.eventId,
        artist_id: commonData.artist_id || undefined,
        title: taskData.title,
        description: taskData.description,
        task_type: taskData.task_type,
        priority: taskData.priority,
        status: 'todo',
        due_date: taskData.due_date
      });

      if (task) {
        setCreatedIds(prev => ({ ...prev, taskId: task.id }));
        toast.success('Tâche créée avec succès');
        setCurrentStep(3); // Passe à Opportunité
      }
    } catch (error) {
      toast.error('Erreur lors de la création de la tâche');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <h3 className="font-semibold text-sm">Informations communes</h3>
              
              <div>
                <Label htmlFor="artist">Spectacle/Artiste</Label>
                <Select value={commonData.artist_id} onValueChange={(value) => setCommonData(prev => ({ ...prev, artist_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un spectacle" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map(artist => (
                      <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="common-address">Adresse</Label>
                <Input
                  id="common-address"
                  value={commonData.address}
                  onChange={(e) => setCommonData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Adresse complète"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="common-postal">Code postal</Label>
                  <Input
                    id="common-postal"
                    value={commonData.postal_code}
                    onChange={(e) => setCommonData(prev => ({ ...prev, postal_code: e.target.value }))}
                    placeholder="75001"
                  />
                </div>
                <div>
                  <Label htmlFor="common-city">Ville</Label>
                  <Input
                    id="common-city"
                    value={commonData.city}
                    onChange={(e) => setCommonData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="event-title">Titre de l'événement *</Label>
              <Input
                id="event-title"
                value={eventData.title}
                onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Concert, festival, spectacle..."
                required
              />
            </div>
            
            <div>
              <Label htmlFor="event-type">Type d'événement</Label>
              <Select value={eventData.event_type} onValueChange={(value) => setEventData(prev => ({ ...prev, event_type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concert">Concert</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="spectacle">Spectacle</SelectItem>
                  <SelectItem value="conference">Conférence</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="venue">Lieu</Label>
              <Input
                id="venue"
                value={eventData.venue}
                onChange={(e) => setEventData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Nom de la salle/lieu"
              />
            </div>

            <div>
              <Label htmlFor="start-date">Date de début</Label>
              <Input
                id="start-date"
                type="datetime-local"
                value={eventData.start_date}
                onChange={(e) => setEventData(prev => ({ ...prev, start_date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="budget-min">Budget min (€)</Label>
                <Input
                  id="budget-min"
                  type="number"
                  value={eventData.budget_min}
                  onChange={(e) => setEventData(prev => ({ ...prev, budget_min: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="budget-max">Budget max (€)</Label>
                <Input
                  id="budget-max"
                  type="number"
                  value={eventData.budget_max}
                  onChange={(e) => setEventData(prev => ({ ...prev, budget_max: Number(e.target.value) }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="event-description">Description</Label>
              <MentionableTextarea
                value={eventData.description}
                onChange={(val) => setEventData(prev => ({ ...prev, description: val }))}
                rows={3}
                placeholder="Tapez @ pour mentionner"
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(2)}>
                Passer cette étape →
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={onClose}>
                  Annuler
                </Button>
                <Button onClick={handleCreateEvent} disabled={loading || !eventData.title}>
                  {loading ? 'Création...' : 'Créer l\'événement'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded text-sm">
              <strong>Adresse:</strong> {commonData.address || 'Non renseignée'} - {commonData.postal_code} {commonData.city}
              {commonData.artist_id && <div><strong>Spectacle:</strong> {artists.find(a => a.id === commonData.artist_id)?.name}</div>}
            </div>

            <div>
              <Label htmlFor="task-title">Titre de la tâche *</Label>
              <Input
                id="task-title"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Appeler le contact, envoyer un devis..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-type">Type de tâche</Label>
                <Select value={taskData.task_type} onValueChange={(value: any) => setTaskData(prev => ({ ...prev, task_type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Telephone">Téléphone</SelectItem>
                    <SelectItem value="RDV">Rendez-vous</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select value={taskData.priority} onValueChange={(value: any) => setTaskData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible</SelectItem>
                    <SelectItem value="medium">Moyenne</SelectItem>
                    <SelectItem value="high">Haute</SelectItem>
                    <SelectItem value="urgent">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="due-date">Échéance</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={taskData.due_date}
                onChange={(e) => setTaskData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="task-description">Description</Label>
              <MentionableTextarea
                value={taskData.description}
                onChange={(val) => setTaskData(prev => ({ ...prev, description: val }))}
                rows={3}
                placeholder="Tapez @ pour mentionner"
              />
            </div>

            <div className="flex justify-between">
              <Button type="button" variant="ghost" onClick={() => setCurrentStep(3)}>
                Passer cette étape →
              </Button>
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  Retour
                </Button>
                <Button onClick={handleCreateTask} disabled={loading || !taskData.title}>
                  {loading ? 'Création...' : 'Créer la tâche'}
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded text-sm">
              <strong>Adresse:</strong> {commonData.address || 'Non renseignée'} - {commonData.postal_code} {commonData.city}
              {commonData.artist_id && <div><strong>Spectacle:</strong> {artists.find(a => a.id === commonData.artist_id)?.name}</div>}
            </div>

            <div>
              <Label htmlFor="opp-title">Titre de l'opportunité *</Label>
              <Input
                id="opp-title"
                value={opportunityData.title}
                onChange={(e) => setOpportunityData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Opportunité commerciale..."
                required
              />
            </div>

            <div>
              <Label htmlFor="opp-venue">Lieu</Label>
              <Input
                id="opp-venue"
                value={opportunityData.venue}
                onChange={(e) => setOpportunityData(prev => ({ ...prev, venue: e.target.value }))}
                placeholder="Nom du lieu"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="opp-budget">Budget (€)</Label>
                <Input
                  id="opp-budget"
                  type="number"
                  value={opportunityData.budget}
                  onChange={(e) => setOpportunityData(prev => ({ ...prev, budget: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="probability">Probabilité (%)</Label>
                <Select 
                  value={opportunityData.probability_percentage.toString()} 
                  onValueChange={(value) => setOpportunityData(prev => ({ ...prev, probability_percentage: Number(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(prob => (
                      <SelectItem key={prob} value={prob.toString()}>{prob}%</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="deadline">Échéance</Label>
              <Input
                id="deadline"
                type="date"
                value={opportunityData.deadline}
                onChange={(e) => setOpportunityData(prev => ({ ...prev, deadline: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="opp-description">Description</Label>
              <MentionableTextarea
                value={opportunityData.description}
                onChange={(val) => setOpportunityData(prev => ({ ...prev, description: val }))}
                rows={3}
                placeholder="Tapez @ pour mentionner"
              />
            </div>

            <div>
              <Label htmlFor="requirements">Exigences</Label>
              <MentionableTextarea
                value={opportunityData.requirements}
                onChange={(val) => setOpportunityData(prev => ({ ...prev, requirements: val }))}
                rows={2}
                placeholder="Tapez @ pour mentionner"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                Retour
              </Button>
              <Button onClick={handleCreateOpportunity} disabled={loading || !opportunityData.title}>
                {loading ? 'Création...' : 'Créer l\'opportunité'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Suite de création pour {contactName}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <Stepper 
            steps={steps} 
            currentStep={currentStep}
            onStepClick={(step) => {
              if (step < currentStep) {
                setCurrentStep(step);
              }
            }}
          />
        </div>

        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};