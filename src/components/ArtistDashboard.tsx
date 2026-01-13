import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Users, FileText, DollarSign, CheckSquare, Mail } from 'lucide-react';
import { CentralizedArtist } from '@/hooks/useCentralizedData';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { EventDialog } from '@/components/events/EventDialog';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { PublicationFormMultiPlatform } from '@/components/PublicationFormMultiPlatform';
import { OpportunityEditor } from './OpportunityEditor';
import { QuoteEditor } from './QuoteEditor';

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
  contactLists: number;
  campaigns: number;
}

export const ArtistDashboard: React.FC<ArtistDashboardProps> = ({ artist }) => {
  const [stats, setStats] = useState<DashboardStats>({
    contacts: 0,
    quotes: 0,
    opportunities: 0,
    tasks: 0,
    events: 0,
    publications: 0,
    contactLists: 0,
    campaigns: 0
  });
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
  // Dialog states
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<any>(null);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [isQuoteDialogOpen, setIsQuoteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [selectedPublication, setSelectedPublication] = useState<any>(null);
  const [isPublicationDialogOpen, setIsPublicationDialogOpen] = useState(false);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
    loadUserProfiles();
  }, [artist.id]);

  const loadUserProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('user_id, username, first_name, last_name');
      
      if (error) throw error;
      setUserProfiles(data || []);
    } catch {
      // Error loading user profiles - silently ignore
    }
  };

  const handleContactClick = (contact: any) => {
    setSelectedContact(contact);
    setIsContactDialogOpen(true);
  };

  const handleOpportunityClick = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsOpportunityDialogOpen(true);
  };

  const handleQuoteClick = (quote: any) => {
    setSelectedQuote(quote);
    setIsQuoteDialogOpen(true);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDialogOpen(true);
  };

  const handlePublicationClick = (publication: any) => {
    setSelectedPublication(publication);
    setIsPublicationDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsContactDialogOpen(false);
    setIsOpportunityDialogOpen(false);
    setIsQuoteDialogOpen(false);
    setIsEventDialogOpen(false);
    setIsTaskDialogOpen(false);
    setIsPublicationDialogOpen(false);
    fetchDashboardData();
  };

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Build artist data by combining direct links and junction tables
      // 1) Opportunities: union of direct opportunities (artist_id) and artist_opportunities mapping
      const { data: mapOpps } = await supabase
        .from('artist_opportunities')
        .select('opportunity_id')
        .eq('artist_id', artist.id);
      const mappedOppIds = mapOpps?.map(o => o.opportunity_id) || [];

      const { data: directOppIdsData } = await supabase
        .from('opportunities')
        .select('id')
        .eq('artist_id', artist.id);
      const directOppIds = directOppIdsData?.map(o => o.id) || [];

      const allOppIds = Array.from(new Set([...mappedOppIds, ...directOppIds]));

      let opportunitiesData: any[] = [];
      if (allOppIds.length > 0) {
        const { data } = await supabase
          .from('opportunities')
          .select('*')
          .in('id', allOppIds);
        opportunitiesData = data || [];
      }
      

      // 2) Events: union of mapping (artist_events) and events linked via opportunities.event_id
      const { data: mapEvents } = await supabase
        .from('artist_events')
        .select('event_id')
        .eq('artist_id', artist.id);
      const mappedEventIds = mapEvents?.map(e => e.event_id) || [];
      const oppEventIds = opportunitiesData.map(o => o.event_id).filter(Boolean);
      const allEventIds = Array.from(new Set([...
        mappedEventIds,
        ...oppEventIds as string[]
      ]));

      let eventsData: any[] = [];
      if (allEventIds.length > 0) {
        const { data } = await supabase
          .from('events')
          .select('*')
          .in('id', allEventIds)
          .eq('user_id', user.id);
        eventsData = data || [];
      }
      

      // 3) Contacts: from junctions + direct fields on opportunities/events
      let contactIds: string[] = [];
      if (allOppIds.length > 0) {
        const { data: oppContacts } = await supabase
          .from('contact_opportunities')
          .select('contact_id')
          .in('opportunity_id', allOppIds);
        contactIds.push(...(oppContacts?.map(c => c.contact_id) || []));
      }
      if (allEventIds.length > 0) {
        const { data: evtContacts } = await supabase
          .from('contact_events')
          .select('contact_id')
          .in('event_id', allEventIds);
        contactIds.push(...(evtContacts?.map(c => c.contact_id) || []));
      }
      // add direct references
      contactIds.push(...opportunitiesData.map(o => o.contact_id).filter(Boolean));
      contactIds.push(...eventsData.map(e => e.contact_id).filter(Boolean));
      contactIds = Array.from(new Set(contactIds));

      let contactsData: any[] = [];
      if (contactIds.length > 0) {
        const { data } = await supabase
          .from('contacts')
          .select('*')
          .in('id', contactIds)
          .eq('user_id', user.id);
        contactsData = data || [];
      }
      


      // Fetch artist tasks safely (avoid non-existent JSON path)
      let tasksData: any[] = [];
      try {
        const { data } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .or(`artist_id.eq.${artist.id}`);
        tasksData = data || [];
        
      } catch {
        try {
          const { data } = await supabase
            .from('tasks')
            .select('*')
            .eq('user_id', user.id)
            .ilike('title', `%${artist.name}%`);
          tasksData = data || [];
        } catch {
          tasksData = [];
        }
      }

      // Fetch artist publications using artist_id
      const { data: publicationsData } = await supabase
        .from('publications')
        .select('*')
        .eq('user_id', user.id)
        .eq('artist_id', artist.id);

      

      // Fetch contact lists linked to artist
      const { data: contactListsData } = await supabase
        .from('contact_lists')
        .select('*')
        .eq('user_id', user.id)
        .eq('artist_id', artist.id);
      
      

      // Fetch email campaigns linked to artist
      const { data: campaignsData } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .eq('artist_id', artist.id);
      
      

      // Fetch quotes linked via artist_id
      const { data: quotesData } = await supabase
        .from('quotes')
        .select('*')
        .eq('user_id', user.id)
        .eq('artist_id', artist.id);
      

      setContacts(contactsData || []);
      setOpportunities(opportunitiesData);
      setEvents(eventsData);
      setTasks(tasksData || []);
      setPublications(publicationsData || []);
      setQuotes(quotesData || []);
      setContactLists(contactListsData || []);
      setCampaigns(campaignsData || []);

      setStats({
        contacts: contactsData?.length || 0,
        quotes: quotesData?.length || 0,
        opportunities: opportunitiesData.length,
        tasks: tasksData?.length || 0,
        events: eventsData.length,
        publications: publicationsData?.length || 0,
        contactLists: contactListsData?.length || 0,
        campaigns: campaignsData?.length || 0
      });
    } catch {
      // Error fetching dashboard data - silently ignore
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Listes de contacts</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contactLists}</div>
            <p className="text-xs text-muted-foreground">
              Listes dédiées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campagnes email</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.campaigns}</div>
            <p className="text-xs text-muted-foreground">
              Campagnes créées
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="w-full h-auto flex flex-wrap gap-1 bg-muted/50 p-1">
          <TabsTrigger value="contacts" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Contacts</TabsTrigger>
          <TabsTrigger value="opportunities" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
            <span className="hidden sm:inline">Opportunités</span>
            <span className="sm:hidden">Opport.</span>
          </TabsTrigger>
          <TabsTrigger value="quotes" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Devis</TabsTrigger>
          <TabsTrigger value="events" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
            <span className="hidden sm:inline">Événements</span>
            <span className="sm:hidden">Événem.</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Tâches</TabsTrigger>
          <TabsTrigger value="publications" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
            <span className="hidden sm:inline">Publications</span>
            <span className="sm:hidden">Publi.</span>
          </TabsTrigger>
          <TabsTrigger value="lists" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">Listes</TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1 min-w-[80px] text-xs sm:text-sm px-2 py-1.5">
            <span className="hidden sm:inline">Campagnes</span>
            <span className="sm:hidden">Camp.</span>
          </TabsTrigger>
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
                    <div 
                      key={contact.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handleContactClick(contact)}
                    >
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
                    <div 
                      key={opp.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handleOpportunityClick(opp)}
                    >
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
                    <div 
                      key={quote.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handleQuoteClick(quote)}
                    >
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
                    <div 
                      key={event.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handleEventClick(event)}
                    >
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
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handleTaskClick(task)}
                    >
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
                    <div 
                      key={pub.id} 
                      className="flex items-center justify-between border-b pb-2 cursor-pointer hover:bg-muted/50 transition-colors rounded p-2"
                      onClick={() => handlePublicationClick(pub)}
                    >
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

        <TabsContent value="lists" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Listes de contacts liées</CardTitle>
            </CardHeader>
            <CardContent>
              {contactLists.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune liste liée à cet artiste</p>
              ) : (
                <div className="space-y-4">
                  {contactLists.map((list: any) => (
                    <div 
                      key={list.id} 
                      className="flex items-center justify-between border-b pb-2 rounded p-2"
                    >
                      <div>
                        <p className="font-medium">{list.name}</p>
                        <p className="text-sm text-muted-foreground">{list.description}</p>
                      </div>
                      <Badge variant="secondary">
                        {new Date(list.created_at).toLocaleDateString('fr-FR')}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campagnes email liées</CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune campagne liée à cet artiste</p>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: any) => (
                    <div 
                      key={campaign.id} 
                      className="flex items-center justify-between border-b pb-2 rounded p-2"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                      </div>
                      <Badge>{campaign.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {selectedContact && (
        <ContactDialog
          isOpen={isContactDialogOpen}
          onClose={handleDialogClose}
          contact={selectedContact}
          onSave={handleDialogClose}
        />
      )}

      {selectedOpportunity && (
        <OpportunityEditor
          isOpen={isOpportunityDialogOpen}
          onClose={handleDialogClose}
          opportunity={selectedOpportunity}
          onSave={handleDialogClose}
        />
      )}

      {selectedQuote && (
        <QuoteEditor
          isOpen={isQuoteDialogOpen}
          onClose={handleDialogClose}
          quote={selectedQuote}
          onSave={handleDialogClose}
        />
      )}

      <EventDialog
        open={isEventDialogOpen}
        onOpenChange={setIsEventDialogOpen}
        event={selectedEvent}
        onSave={handleDialogClose}
      />

      {selectedTask && (
        <TaskEditor
          task={selectedTask}
          isOpen={isTaskDialogOpen}
          onClose={handleDialogClose}
          onTaskUpdated={handleDialogClose}
        />
      )}

      {selectedPublication && (
        <PublicationFormMultiPlatform
          isOpen={isPublicationDialogOpen}
          onClose={handleDialogClose}
          onSubmit={async (data) => {
            try {
              const { error } = await supabase
                .from('publications')
                .update({
                  title: data.title,
                  content: data.content,
                  scheduled_date: data.scheduled_date,
                  platforms: data.platforms,
                  media_url: data.media_url,
                  media_type: data.media_type,
                  external_link: data.external_link
                })
                .eq('id', selectedPublication?.id);

              if (error) throw error;
              handleDialogClose();
            } catch (error) {
              console.error('Error updating publication:', error);
            }
          }}
          initialData={selectedPublication ? {
            title: selectedPublication.title,
            content: selectedPublication.content,
            scheduled_date: selectedPublication.scheduled_date,
            platforms: selectedPublication.platforms || [],
            assigned_to: selectedPublication.assigned_to || '',
            media_url: selectedPublication.media_url,
            media_type: selectedPublication.media_type,
            external_link: selectedPublication.external_link
          } : {}}

          userProfiles={userProfiles}
          isEditing={true}
        />
      )}
    </div>
  );
};