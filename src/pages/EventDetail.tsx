import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, User, Target, CheckSquare, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { EventDashboard } from '@/components/EventDashboard';
import { EventDialog } from '@/components/events/EventDialog';
import { ContactEventManager } from '@/components/contacts/ContactEventManager';
import { OpportunityEventManager } from '@/components/events/OpportunityEventManager';
import { TaskEventManager } from '@/components/events/TaskEventManager';
import { Event } from '@/types/event.types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { EventDetailHeader } from './events/EventDetailHeader';
import { EventOverviewTab } from './events/EventOverviewTab';
import { EventLinkedTabs } from './events/EventLinkedTabs';

interface Owner {
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  email: string | null;
}

interface LinkedOpportunity { id: string; title: string; status: string; venue: string | null; date: string | null; budget: number | null; }
interface LinkedContact { id: string; first_name: string; last_name: string; email: string | null; phone: string | null; company: string | null; role: string | null; }
interface LinkedTask { id: string; title: string; status: string; due_date: string | null; priority: string | null; }

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [linkedOpportunities, setLinkedOpportunities] = useState<LinkedOpportunity[]>([]);
  const [linkedContacts, setLinkedContacts] = useState<LinkedContact[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [contactManagerOpen, setContactManagerOpen] = useState(false);
  const [opportunityManagerOpen, setOpportunityManagerOpen] = useState(false);
  const [taskManagerOpen, setTaskManagerOpen] = useState(false);

  const fetchEvent = async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('events').select('*').eq('id', id).single();
      if (error) throw error;
      setEvent(data);

      if (data.owner_id) {
        const { data: ownerData } = await supabase.from('user_profiles').select('user_id, first_name, last_name, username, email').eq('user_id', data.owner_id).single();
        if (ownerData) setOwner(ownerData);
      }

      // Fetch linked contacts
      let allContacts: LinkedContact[] = [];
      if (data.contact_id) {
        const { data: directContact } = await supabase.from('contacts').select('id, first_name, last_name, email, phone, company, role').eq('id', data.contact_id).single();
        if (directContact) allContacts.push(directContact);
      }
      const { data: contactLinks } = await supabase.from('contact_events').select('contact_id').eq('event_id', id);
      if (contactLinks && contactLinks.length > 0) {
        const contactIds = contactLinks.map(l => l.contact_id);
        const { data: contacts } = await supabase.from('contacts').select('id, first_name, last_name, email, phone, company, role').in('id', contactIds);
        if (contacts) {
          const existingIds = new Set(allContacts.map(c => c.id));
          contacts.forEach(c => { if (!existingIds.has(c.id)) allContacts.push(c); });
        }
      }
      setLinkedContacts(allContacts);

      // Fetch linked opportunities
      const { data: directOpps } = await supabase.from('opportunities').select('id, title, status, venue, date, budget').eq('event_id', id);
      const { data: oppLinks } = await supabase.from('opportunity_events').select('opportunity_id').eq('event_id', id);
      let allOpps = directOpps || [];
      if (oppLinks && oppLinks.length > 0) {
        const { data: linkedOpps } = await supabase.from('opportunities').select('id, title, status, venue, date, budget').in('id', oppLinks.map(l => l.opportunity_id));
        if (linkedOpps) {
          const existingIds = new Set(allOpps.map(o => o.id));
          linkedOpps.forEach(o => { if (!existingIds.has(o.id)) allOpps.push(o); });
        }
      }
      setLinkedOpportunities(allOpps);

      // Fetch linked tasks
      const { data: tasks } = await supabase.from('tasks').select('id, title, status, due_date, priority').eq('event_id', id);
      if (tasks) setLinkedTasks(tasks);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Erreur lors du chargement du spectacle');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvent(); }, [id, user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl font-semibold">Spectacle non trouvé</p>
          <Button onClick={() => navigate('/events')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux spectacles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 lg:px-0">
      <EventDetailHeader event={event} onEdit={() => setEditDialogOpen(true)} />

      {/* Info Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {event.start_date && (
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Calendar className="h-4 w-4 text-primary" /><div className="text-sm"><p className="text-muted-foreground">Date</p><p className="font-medium">{format(new Date(event.start_date), 'dd/MM/yyyy', { locale: fr })}</p></div></div></CardContent></Card>
        )}
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Users className="h-4 w-4 text-blue-600" /><div className="text-sm"><p className="text-muted-foreground">Contacts</p><p className="font-medium">{linkedContacts.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><Target className="h-4 w-4 text-green-600" /><div className="text-sm"><p className="text-muted-foreground">Opportunités</p><p className="font-medium">{linkedOpportunities.length}</p></div></div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><CheckSquare className="h-4 w-4 text-orange-600" /><div className="text-sm"><p className="text-muted-foreground">Tâches</p><p className="font-medium">{linkedTasks.length}</p></div></div></CardContent></Card>
        {owner && (
          <Card><CardContent className="p-4"><div className="flex items-center space-x-2"><User className="h-4 w-4 text-purple-600" /><div className="text-sm"><p className="text-muted-foreground">Propriétaire</p><p className="font-medium truncate">{owner.first_name || owner.last_name ? `${owner.first_name || ''} ${owner.last_name || ''}`.trim() : owner.username || owner.email}</p></div></div></CardContent></Card>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({linkedContacts.length})</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités ({linkedOpportunities.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tâches ({linkedTasks.length})</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <EventOverviewTab event={event} owner={owner} linkedContacts={linkedContacts} linkedOpportunities={linkedOpportunities} linkedTasks={linkedTasks} />
        </TabsContent>

        <EventLinkedTabs
          linkedContacts={linkedContacts}
          linkedOpportunities={linkedOpportunities}
          linkedTasks={linkedTasks}
          onOpenContactManager={() => setContactManagerOpen(true)}
          onOpenOpportunityManager={() => setOpportunityManagerOpen(true)}
          onOpenTaskManager={() => setTaskManagerOpen(true)}
        />

        <TabsContent value="dashboard" className="space-y-4">
          <EventDashboard eventId={event.id} eventName={event.title} />
        </TabsContent>
      </Tabs>

      {editDialogOpen && (
        <EventDialog event={event} open={editDialogOpen} onOpenChange={setEditDialogOpen} onSave={() => { setEditDialogOpen(false); fetchEvent(); }} />
      )}
      <ContactEventManager isOpen={contactManagerOpen} onClose={() => { setContactManagerOpen(false); fetchEvent(); }} eventId={event.id!} eventTitle={event.title} />
      <OpportunityEventManager isOpen={opportunityManagerOpen} onClose={() => { setOpportunityManagerOpen(false); fetchEvent(); }} eventId={event.id!} eventTitle={event.title} onUpdate={fetchEvent} />
      <TaskEventManager isOpen={taskManagerOpen} onClose={() => { setTaskManagerOpen(false); fetchEvent(); }} eventId={event.id!} eventTitle={event.title} onUpdate={fetchEvent} />
    </div>
  );
};
