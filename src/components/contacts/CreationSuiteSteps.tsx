import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MentionableTextarea } from '@/components/mentions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Artist {
  id: string;
  name: string;
}

interface CommonData {
  address: string;
  postal_code: string;
  city: string;
  artist_id: string;
}

interface CommonInfoBanner {
  commonData: CommonData;
  artists: Artist[];
}

const CommonInfoSummary: React.FC<CommonInfoBanner> = ({ commonData, artists }) => (
  <div className="p-3 bg-muted/50 rounded text-sm">
    <strong>Adresse:</strong> {commonData.address || 'Non renseignée'} - {commonData.postal_code} {commonData.city}
    {commonData.artist_id && <div><strong>Spectacle:</strong> {artists.find(a => a.id === commonData.artist_id)?.name}</div>}
  </div>
);

// ─── Event Step ────────────────────────────────────────────────
interface EventStepProps {
  commonData: CommonData;
  setCommonData: React.Dispatch<React.SetStateAction<CommonData>>;
  eventData: { title: string; description: string; event_type: string; venue: string; start_date: string; budget_min: number; budget_max: number };
  setEventData: React.Dispatch<React.SetStateAction<EventStepProps['eventData']>>;
  artists: Artist[];
  loading: boolean;
  onCreateEvent: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export const EventStep: React.FC<EventStepProps> = ({
  commonData, setCommonData, eventData, setEventData, artists, loading, onCreateEvent, onSkip, onCancel
}) => (
  <div className="space-y-4">
    <div className="p-4 bg-muted rounded-lg space-y-3">
      <h3 className="font-semibold text-sm">Informations communes</h3>
      <div>
        <Label>Spectacle/Artiste</Label>
        <Select value={commonData.artist_id} onValueChange={(v) => setCommonData(prev => ({ ...prev, artist_id: v }))}>
          <SelectTrigger><SelectValue placeholder="Sélectionner un spectacle" /></SelectTrigger>
          <SelectContent>
            {artists.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Adresse</Label>
        <Input value={commonData.address} onChange={(e) => setCommonData(prev => ({ ...prev, address: e.target.value }))} placeholder="Adresse complète" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Code postal</Label>
          <Input value={commonData.postal_code} onChange={(e) => setCommonData(prev => ({ ...prev, postal_code: e.target.value }))} placeholder="75001" />
        </div>
        <div>
          <Label>Ville</Label>
          <Input value={commonData.city} onChange={(e) => setCommonData(prev => ({ ...prev, city: e.target.value }))} placeholder="Paris" />
        </div>
      </div>
    </div>
    <div>
      <Label>Titre de l'événement *</Label>
      <Input value={eventData.title} onChange={(e) => setEventData(prev => ({ ...prev, title: e.target.value }))} placeholder="Concert, festival, spectacle..." />
    </div>
    <div>
      <Label>Type d'événement</Label>
      <Select value={eventData.event_type} onValueChange={(v) => setEventData(prev => ({ ...prev, event_type: v }))}>
        <SelectTrigger><SelectValue /></SelectTrigger>
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
      <Label>Lieu</Label>
      <Input value={eventData.venue} onChange={(e) => setEventData(prev => ({ ...prev, venue: e.target.value }))} placeholder="Nom de la salle/lieu" />
    </div>
    <div>
      <Label>Date de début</Label>
      <Input type="datetime-local" value={eventData.start_date} onChange={(e) => setEventData(prev => ({ ...prev, start_date: e.target.value }))} />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Budget min (€)</Label>
        <Input type="number" value={eventData.budget_min} onChange={(e) => setEventData(prev => ({ ...prev, budget_min: Number(e.target.value) }))} />
      </div>
      <div>
        <Label>Budget max (€)</Label>
        <Input type="number" value={eventData.budget_max} onChange={(e) => setEventData(prev => ({ ...prev, budget_max: Number(e.target.value) }))} />
      </div>
    </div>
    <div>
      <Label>Description</Label>
      <MentionableTextarea value={eventData.description} onChange={(val) => setEventData(prev => ({ ...prev, description: val }))} rows={3} placeholder="Tapez @ pour mentionner" />
    </div>
    <div className="flex justify-between">
      <Button type="button" variant="ghost" onClick={onSkip}>Passer cette étape →</Button>
      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button onClick={onCreateEvent} disabled={loading || !eventData.title}>
          {loading ? 'Création...' : 'Créer l\'événement'}
        </Button>
      </div>
    </div>
  </div>
);

// ─── Task Step ─────────────────────────────────────────────────
interface TaskStepProps {
  commonData: CommonData;
  artists: Artist[];
  taskData: { title: string; description: string; task_type: string; priority: string; due_date: string };
  setTaskData: React.Dispatch<React.SetStateAction<any>>;
  loading: boolean;
  onCreateTask: () => void;
  onSkip: () => void;
  onBack: () => void;
}

export const TaskStep: React.FC<TaskStepProps> = ({
  commonData, artists, taskData, setTaskData, loading, onCreateTask, onSkip, onBack
}) => (
  <div className="space-y-4">
    <CommonInfoSummary commonData={commonData} artists={artists} />
    <div>
      <Label>Titre de la tâche *</Label>
      <Input value={taskData.title} onChange={(e) => setTaskData((prev: any) => ({ ...prev, title: e.target.value }))} placeholder="Appeler le contact, envoyer un devis..." />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Type de tâche</Label>
        <Select value={taskData.task_type} onValueChange={(v) => setTaskData((prev: any) => ({ ...prev, task_type: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Telephone">Téléphone</SelectItem>
            <SelectItem value="RDV">Rendez-vous</SelectItem>
            <SelectItem value="Autre">Autre</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Priorité</Label>
        <Select value={taskData.priority} onValueChange={(v) => setTaskData((prev: any) => ({ ...prev, priority: v }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
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
      <Label>Échéance</Label>
      <Input type="datetime-local" value={taskData.due_date} onChange={(e) => setTaskData((prev: any) => ({ ...prev, due_date: e.target.value }))} />
    </div>
    <div>
      <Label>Description</Label>
      <MentionableTextarea value={taskData.description} onChange={(val) => setTaskData((prev: any) => ({ ...prev, description: val }))} rows={3} placeholder="Tapez @ pour mentionner" />
    </div>
    <div className="flex justify-between">
      <Button type="button" variant="ghost" onClick={onSkip}>Passer cette étape →</Button>
      <div className="flex space-x-2">
        <Button type="button" variant="outline" onClick={onBack}>Retour</Button>
        <Button onClick={onCreateTask} disabled={loading || !taskData.title}>
          {loading ? 'Création...' : 'Créer la tâche'}
        </Button>
      </div>
    </div>
  </div>
);

// ─── Opportunity Step ──────────────────────────────────────────
interface OpportunityStepProps {
  commonData: CommonData;
  artists: Artist[];
  opportunityData: { title: string; description: string; venue: string; budget: number; probability_percentage: number; deadline: string; requirements: string };
  setOpportunityData: React.Dispatch<React.SetStateAction<OpportunityStepProps['opportunityData']>>;
  loading: boolean;
  onCreateOpportunity: () => void;
  onBack: () => void;
}

export const OpportunityStep: React.FC<OpportunityStepProps> = ({
  commonData, artists, opportunityData, setOpportunityData, loading, onCreateOpportunity, onBack
}) => (
  <div className="space-y-4">
    <CommonInfoSummary commonData={commonData} artists={artists} />
    <div>
      <Label>Titre de l'opportunité *</Label>
      <Input value={opportunityData.title} onChange={(e) => setOpportunityData(prev => ({ ...prev, title: e.target.value }))} placeholder="Opportunité commerciale..." />
    </div>
    <div>
      <Label>Lieu</Label>
      <Input value={opportunityData.venue} onChange={(e) => setOpportunityData(prev => ({ ...prev, venue: e.target.value }))} placeholder="Nom du lieu" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <Label>Budget (€)</Label>
        <Input type="number" value={opportunityData.budget} onChange={(e) => setOpportunityData(prev => ({ ...prev, budget: Number(e.target.value) }))} />
      </div>
      <div>
        <Label>Probabilité (%)</Label>
        <Select value={opportunityData.probability_percentage.toString()} onValueChange={(v) => setOpportunityData(prev => ({ ...prev, probability_percentage: Number(v) }))}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map(p => <SelectItem key={p} value={p.toString()}>{p}%</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </div>
    <div>
      <Label>Échéance</Label>
      <Input type="date" value={opportunityData.deadline} onChange={(e) => setOpportunityData(prev => ({ ...prev, deadline: e.target.value }))} />
    </div>
    <div>
      <Label>Description</Label>
      <MentionableTextarea value={opportunityData.description} onChange={(val) => setOpportunityData(prev => ({ ...prev, description: val }))} rows={3} placeholder="Tapez @ pour mentionner" />
    </div>
    <div>
      <Label>Exigences</Label>
      <MentionableTextarea value={opportunityData.requirements} onChange={(val) => setOpportunityData(prev => ({ ...prev, requirements: val }))} rows={2} placeholder="Tapez @ pour mentionner" />
    </div>
    <div className="flex justify-end space-x-2">
      <Button type="button" variant="outline" onClick={onBack}>Retour</Button>
      <Button onClick={onCreateOpportunity} disabled={loading || !opportunityData.title}>
        {loading ? 'Création...' : 'Créer l\'opportunité'}
      </Button>
    </div>
  </div>
);
