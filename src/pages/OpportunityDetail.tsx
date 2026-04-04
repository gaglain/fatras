import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, MapPin, Edit, DollarSign, Clock, Percent } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { OpportunityOverviewTab } from './opportunities/OpportunityOverviewTab';
import { OpportunityLinkedTab } from './opportunities/OpportunityLinkedTabs';

interface Owner { user_id: string; first_name: string | null; last_name: string | null; username: string | null; email: string | null; }
interface LinkedContact { id: string; first_name: string; last_name: string; email: string | null; phone: string | null; company: string | null; role: string | null; }
interface LinkedEvent { id: string; title: string; start_date: string | null; venue: string | null; city: string | null; status: string | null; }
interface LinkedTask { id: string; title: string; status: string; due_date: string | null; priority: string | null; }
interface LinkedArtist { id: string; name: string; genre: string; image: string | null; }
interface Opportunity { id: string; title: string; description: string | null; venue: string | null; location: string | null; date: string | null; budget: number | null; probability_percentage: number | null; status: string | null; deadline: string | null; requirements: string | null; contact: string | null; artist_id: string | null; contact_id: string | null; event_id: string | null; task_id: string | null; owner_id: string | null; created_at: string; updated_at: string; }

const getStatusLabel = (s: string | null) => ({ open: 'Ouverte', applied: 'Candidaturé', won: 'Remportée', lost: 'Perdue' }[s || ''] || s || 'Non défini');
const getStatusColor = (s: string | null) => ({ open: 'bg-green-100 text-green-800', applied: 'bg-blue-100 text-blue-800', won: 'bg-emerald-100 text-emerald-800', lost: 'bg-red-100 text-red-800' }[s || ''] || 'bg-gray-100 text-gray-800');

export const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [linkedContacts, setLinkedContacts] = useState<LinkedContact[]>([]);
  const [linkedEvents, setLinkedEvents] = useState<LinkedEvent[]>([]);
  const [linkedTasks, setLinkedTasks] = useState<LinkedTask[]>([]);
  const [linkedArtists, setLinkedArtists] = useState<LinkedArtist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOpportunity = async () => {
    if (!id || !user?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single();
      if (error) throw error;
      setOpportunity(data);

      if (data.owner_id) {
        const { data: ownerData } = await supabase.from('user_profiles').select('user_id, first_name, last_name, username, email').eq('user_id', data.owner_id).single();
        if (ownerData) setOwner(ownerData);
      }

      const { data: contactLinks } = await supabase.from('contact_opportunities').select('contact_id, role').eq('opportunity_id', id);
      if (contactLinks && contactLinks.length > 0) {
        const { data: contactsData } = await supabase.from('contacts').select('id, first_name, last_name, email, phone, company').in('id', contactLinks.map(l => l.contact_id));
        if (contactsData) setLinkedContacts(contactsData.map(c => ({ ...c, role: contactLinks.find(l => l.contact_id === c.id)?.role || null })));
      }

      if (data.contact_id) {
        const { data: dc } = await supabase.from('contacts').select('id, first_name, last_name, email, phone, company').eq('id', data.contact_id).single();
        if (dc) setLinkedContacts(prev => prev.find(c => c.id === dc.id) ? prev : [...prev, { ...dc, role: 'Principal' }]);
      }

      const { data: eventLinks } = await supabase.from('opportunity_events').select('event_id').eq('opportunity_id', id);
      if (eventLinks && eventLinks.length > 0) {
        const { data: eventsData } = await supabase.from('events').select('id, title, start_date, venue, city, status').in('id', eventLinks.map(l => l.event_id));
        if (eventsData) setLinkedEvents(eventsData);
      }

      if (data.event_id) {
        const { data: de } = await supabase.from('events').select('id, title, start_date, venue, city, status').eq('id', data.event_id).single();
        if (de) setLinkedEvents(prev => prev.find(e => e.id === de.id) ? prev : [...prev, de]);
      }

      const { data: artistLinks } = await supabase.from('artist_opportunities').select('artist_id').eq('opportunity_id', id);
      if (artistLinks && artistLinks.length > 0) {
        const { data: artistsData } = await supabase.from('centralized_artists').select('id, name, genre, image').in('id', artistLinks.map(l => l.artist_id));
        if (artistsData) setLinkedArtists(artistsData);
      }

      if (data.artist_id) {
        const { data: da } = await supabase.from('centralized_artists').select('id, name, genre, image').eq('id', data.artist_id).single();
        if (da) setLinkedArtists(prev => prev.find(a => a.id === da.id) ? prev : [...prev, da]);
      }

      if (data.task_id) {
        const { data: taskData } = await supabase.from('tasks').select('id, title, status, due_date, priority').eq('id', data.task_id).single();
        if (taskData) setLinkedTasks([taskData]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement de l\'opportunité');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchOpportunity(); }, [id, user?.id]);

  if (loading) return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  if (!opportunity) return (
    <div className="container mx-auto py-6 px-4">
      <Button variant="ghost" onClick={() => navigate('/opportunities')}><ArrowLeft className="h-4 w-4 mr-2" />Retour</Button>
      <div className="mt-8 text-center"><p className="text-muted-foreground">Opportunité non trouvée</p></div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6 px-4 lg:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/opportunities')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-2xl font-bold">{opportunity.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={getStatusColor(opportunity.status)}>{getStatusLabel(opportunity.status)}</Badge>
              {opportunity.probability_percentage && <Badge variant="outline" className="flex items-center gap-1"><Percent className="h-3 w-3" />{opportunity.probability_percentage}%</Badge>}
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/opportunities')}><Edit className="h-4 w-4 mr-2" />Modifier</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: MapPin, label: 'Lieu', value: opportunity.venue || 'Non défini', sub: opportunity.location || '' },
          { icon: Calendar, label: 'Date', value: opportunity.date ? format(new Date(opportunity.date), 'dd MMMM yyyy', { locale: fr }) : 'Non définie' },
          { icon: DollarSign, label: 'Budget', value: opportunity.budget ? `${opportunity.budget.toLocaleString('fr-FR')}€` : 'Non défini' },
          { icon: Clock, label: 'Deadline', value: opportunity.deadline ? format(new Date(opportunity.deadline), 'dd MMMM yyyy', { locale: fr }) : 'Non définie' },
        ].map(({ icon: Icon, label, value, sub }) => (
          <Card key={label}><CardContent className="pt-4"><div className="flex items-center gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Icon className="h-5 w-5 text-primary" /></div><div><p className="text-sm text-muted-foreground">{label}</p><p className="font-medium">{value}</p>{sub && <p className="text-xs text-muted-foreground">{sub}</p>}</div></div></CardContent></Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="contacts">Contacts ({linkedContacts.length})</TabsTrigger>
          <TabsTrigger value="events">Événements ({linkedEvents.length})</TabsTrigger>
          <TabsTrigger value="artists">Artistes ({linkedArtists.length})</TabsTrigger>
          <TabsTrigger value="tasks">Tâches ({linkedTasks.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><OpportunityOverviewTab opportunity={opportunity} owner={owner} /></TabsContent>
        <TabsContent value="contacts"><OpportunityLinkedTab type="contacts" contacts={linkedContacts} /></TabsContent>
        <TabsContent value="events"><OpportunityLinkedTab type="events" events={linkedEvents} /></TabsContent>
        <TabsContent value="artists"><OpportunityLinkedTab type="artists" artists={linkedArtists} /></TabsContent>
        <TabsContent value="tasks"><OpportunityLinkedTab type="tasks" tasks={linkedTasks} /></TabsContent>
      </Tabs>
    </div>
  );
};
