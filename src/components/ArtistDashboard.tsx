import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, FileText, DollarSign, CheckSquare, Mail } from 'lucide-react';
import { CentralizedArtist } from '@/hooks/useCentralizedData';

interface ArtistDashboardProps {
  artist: CentralizedArtist;
}

interface DashboardStats {
  contacts: number;
  quotes: number;
  opportunities: number;
  tasks: number;
  events: number;
  publications: number;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ artist }) => {
  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0,
    quotes: 0,
    opportunities: 0,
    tasks: 0,
    events: 0,
    publications: 0
  });
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, [artist.id]);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch artist-related contacts (liés via opportunités ou événements)
      const { data: artistOpps } = await supabase
        .from('artist_opportunities')
        .select('opportunity_id')
        .eq('artist_id', artist.id);

      const oppIds = artistOpps?.map(o => o.opportunity_id) || [];

      const { data: artistEvts } = await supabase
        .from('artist_events')
        .select('event_id')
        .eq('artist_id', artist.id);

      const evtIds = artistEvts?.map(e => e.event_id) || [];

      // Get contact IDs from opportunities and events
      let contactIds: string[] = [];
      if (oppIds.length > 0) {
        const { data: oppContacts } = await supabase
          .from('contact_opportunities')
          .select('contact_id')
          .in('opportunity_id', oppIds);
        contactIds = [...contactIds, ...(oppContacts?.map(c => c.contact_id) || [])];
      }
      if (evtIds.length > 0) {
        const { data: evtContacts } = await supabase
          .from('contact_events')
          .select('contact_id')
          .in('event_id', evtIds);
        contactIds = [...contactIds, ...(evtContacts?.map(c => c.contact_id) || [])];
      }

      // Remove duplicates
      contactIds = [...new Set(contactIds)];

      let contactsData = [];
      if (contactIds.length > 0) {
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .in('id', contactIds);
        contactsData = data || [];
      }

      console.log('Contacts fetched:', contactsData?.length);

      // Fetch artist opportunities through junction table
      const { data: artistOpportunitiesData } = await supabase
        .from('artist_opportunities')
        .select('opportunity_id')
        .eq('artist_id', artist.id);

      const opportunityIds = artistOpportunitiesData?.map(ao => ao.opportunity_id) || [];
      
      let opportunitiesData = [];
      if (opportunityIds.length > 0) {
        const { data } = await supabase
          .from('opportunities')
          .select('*')
          .in('id', opportunityIds);
        opportunitiesData = data || [];
      }

      console.log('Opportunities fetched:', opportunitiesData.length);

      // Fetch artist events through junction table
      const { data: artistEventsData } = await supabase
        .from('artist_events')
        .select('event_id')
        .eq('artist_id', artist.id);

      const eventIds = artistEventsData?.map(ae => ae.event_id) || [];
      
      let eventsData = [];
      if (eventIds.length > 0) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .in('id', eventIds);
        eventsData = data || [];
      }

      console.log('Events fetched:', eventsData.length);

      // Fetch artist tasks safely (avoid non-existent JSON path)
      let tasksData: any[] = [];
      try {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .or(`artist_id.eq.${artist.id}`);
        tasksData = data || [];
        console.log('Tasks fetched:', tasksData.length);
      } catch (e) {
        console.warn('Tasks fetch failed (no metadata column). Falling back to title search...', e);
        try {
          const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .ilike('title', `%${artist.name}%`);
          tasksData = data || [];
          console.log('Tasks fetched (fallback):', tasksData.length);
        } catch (e2) {
          console.error('Tasks fetch error:', e2);
          tasksData = [];
        }
      }

      // Fetch artist publications
      const { data: publicationsData } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', `%${artist.name}%`);

      console.log('Publications fetched:', publicationsData?.length);

      // Fetch artist quotes
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .ilike('title', `%${artist.name}%`);

      console.log('Quotes fetched:', quotesData?.length);

      setContacts(contactsData?.slice(0, 5) || []);
      setOpportunities(opportunitiesData.slice(0, 5));
      setEvents(eventsData.slice(0, 5));
      setTasks(tasksData?.slice(0, 5) || []);
      setPublications(publicationsData?.slice(0, 5) || []);
      setQuotes(quotesData?.slice(0, 5) || []);

      setStats({
        contacts: contactsData?.length || 0,
        quotes: quotesData?.length || 0,
        opportunities: opportunitiesData.length,
        tasks: tasksData?.length || 0,
        events: eventsData.length,
        publications: publicationsData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contacts}</div>
            <p className="text-xs text-muted-foreground">
              Contacts liés au spectacle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Opportunités</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.opportunities}</div>
            <p className="text-xs text-muted-foreground">
              Opportunités en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Devis</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotes}</div>
            <p className="text-xs text-muted-foreground">
              Devis créés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Événements</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.events}</div>
            <p className="text-xs text-muted-foreground">
              Événements planifiés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tasks}</div>
            <p className="text-xs text-muted-foreground">
              Tâches en cours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Publications</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publications}</div>
            <p className="text-xs text-muted-foreground">
              Publications planifiées
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="quotes">Devis</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
          <TabsTrigger value="tasks">Tâches</TabsTrigger>
          <TabsTrigger value="publications">Publications</TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contacts récents</CardTitle>
            </CardHeader>
            <CardContent>
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun contact lié</p>
              ) : (
                <div className="space-y-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                        <p className="text-sm text-muted-foreground">{contact.company}</p>
                      </div>
                      <Badge>{contact.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Opportunités</CardTitle>
            </CardHeader>
            <CardContent>
              {opportunities.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune opportunité</p>
              ) : (
                <div className="space-y-4">
                  {opportunities.map((opp) => (
                    <div key={opp.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{opp.title}</p>
                        <p className="text-sm text-muted-foreground">{opp.venue}</p>
                      </div>
                      <Badge>{opp.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quotes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Devis récents</CardTitle>
            </CardHeader>
            <CardContent>
              {quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun devis</p>
              ) : (
                <div className="space-y-4">
                  {quotes.map((quote) => (
                    <div key={quote.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{quote.title}</p>
                        <p className="text-sm text-muted-foreground">{quote.total_amount}€</p>
                      </div>
                      <Badge>{quote.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Événements à venir</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun événement</p>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">{event.venue}</p>
                      </div>
                      <Badge>{event.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tâches en cours</CardTitle>
            </CardHeader>
            <CardContent>
              {tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune tâche</p>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                      </div>
                      <Badge>{task.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="publications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Publications planifiées</CardTitle>
            </CardHeader>
            <CardContent>
              {publications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune publication</p>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub) => (
                    <div key={pub.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{pub.title}</p>
                        <p className="text-sm text-muted-foreground">{pub.platform}</p>
                      </div>
                      <Badge>{pub.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};