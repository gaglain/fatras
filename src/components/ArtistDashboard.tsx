import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CentralizedArtist } from '@/hooks/useCentralizedData';
import { ContactDialog } from '@/components/contacts/ContactDialog';
import { EventDialog } from '@/components/events/EventDialog';
import { TaskEditor } from '@/components/tasks/TaskEditor';
import { PublicationFormMultiPlatform } from '@/components/PublicationFormMultiPlatform';
import { OpportunityEditor } from './OpportunityEditor';
import { QuoteEditor } from './QuoteEditor';
import { ArtistDashboardStats } from './artist/ArtistDashboardStats';
import { ArtistDashboardTabs } from './artist/ArtistDashboardTabs';

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
  const [stats, setStats] = useState<DashboardStats>({ contacts: 0, quotes: 0, opportunities: 0, tasks: 0, events: 0, publications: 0, contactLists: 0, campaigns: 0 });
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [publications, setPublications] = useState<any[]>([]);
  const [contactLists, setContactLists] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  
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
      const { data } = await supabase.from('user_profiles').select('user_id, username, first_name, last_name');
      if (data) setUserProfiles(data);
    } catch {}
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

      const { data: mapOpps } = await supabase.from('artist_opportunities').select('opportunity_id').eq('artist_id', artist.id);
      const mappedOppIds = mapOpps?.map(o => o.opportunity_id) || [];
      const { data: directOppIdsData } = await supabase.from('opportunities').select('id').eq('artist_id', artist.id);
      const directOppIds = directOppIdsData?.map(o => o.id) || [];
      const allOppIds = Array.from(new Set([...mappedOppIds, ...directOppIds]));

      let opportunitiesData: any[] = [];
      if (allOppIds.length > 0) {
        const { data } = await supabase.from('opportunities').select('*').in('id', allOppIds);
        opportunitiesData = data || [];
      }

      const { data: mapEvents } = await supabase.from('artist_events').select('event_id').eq('artist_id', artist.id);
      const mappedEventIds = mapEvents?.map(e => e.event_id) || [];
      const oppEventIds = opportunitiesData.map(o => o.event_id).filter(Boolean);
      const allEventIds = Array.from(new Set([...mappedEventIds, ...oppEventIds as string[]]));

      let eventsData: any[] = [];
      if (allEventIds.length > 0) {
        const { data } = await supabase.from('events').select('*').in('id', allEventIds).eq('user_id', user.id);
        eventsData = data || [];
      }

      let contactIds: string[] = [];
      if (allOppIds.length > 0) {
        const { data: oppContacts } = await supabase.from('contact_opportunities').select('contact_id').in('opportunity_id', allOppIds);
        contactIds.push(...(oppContacts?.map(c => c.contact_id) || []));
      }
      if (allEventIds.length > 0) {
        const { data: evtContacts } = await supabase.from('contact_events').select('contact_id').in('event_id', allEventIds);
        contactIds.push(...(evtContacts?.map(c => c.contact_id) || []));
      }
      contactIds.push(...opportunitiesData.map(o => o.contact_id).filter(Boolean));
      contactIds.push(...eventsData.map(e => e.contact_id).filter(Boolean));
      contactIds = Array.from(new Set(contactIds));

      let contactsData: any[] = [];
      if (contactIds.length > 0) {
        const { data } = await supabase.from('contacts').select('*').in('id', contactIds).eq('user_id', user.id);
        contactsData = data || [];
      }

      let tasksData: any[] = [];
      try {
        const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).or(`artist_id.eq.${artist.id}`);
        tasksData = data || [];
      } catch {
        try {
          const { data } = await supabase.from('tasks').select('*').eq('user_id', user.id).ilike('title', `%${artist.name}%`);
          tasksData = data || [];
        } catch { tasksData = []; }
      }

      const { data: publicationsData } = await supabase.from('publications').select('*').eq('user_id', user.id).eq('artist_id', artist.id);
      const { data: contactListsData } = await supabase.from('contact_lists').select('*').eq('user_id', user.id).eq('artist_id', artist.id);
      const { data: campaignsData } = await supabase.from('email_campaigns').select('*').eq('user_id', user.id).eq('artist_id', artist.id);
      const { data: quotesData } = await supabase.from('quotes').select('*').eq('user_id', user.id).eq('artist_id', artist.id);

      setContacts(contactsData || []);
      setOpportunities(opportunitiesData);
      setEvents(eventsData);
      setTasks(tasksData || []);
      setPublications(publicationsData || []);
      setQuotes(quotesData || []);
      setContactLists(contactListsData || []);
      setCampaigns(campaignsData || []);

      setStats({
        contacts: contactsData?.length || 0, quotes: quotesData?.length || 0,
        opportunities: opportunitiesData.length, tasks: tasksData?.length || 0,
        events: eventsData.length, publications: publicationsData?.length || 0,
        contactLists: contactListsData?.length || 0, campaigns: campaignsData?.length || 0
      });
    } catch {}
  };

  return (
    <div className="space-y-6">
      <ArtistDashboardStats stats={stats} />
      <ArtistDashboardTabs
        contacts={contacts} opportunities={opportunities} quotes={quotes} events={events}
        tasks={tasks} publications={publications} contactLists={contactLists} campaigns={campaigns}
        onContactClick={(c) => { setSelectedContact(c); setIsContactDialogOpen(true); }}
        onOpportunityClick={(o) => { setSelectedOpportunity(o); setIsOpportunityDialogOpen(true); }}
        onQuoteClick={(q) => { setSelectedQuote(q); setIsQuoteDialogOpen(true); }}
        onEventClick={(e) => { setSelectedEvent(e); setIsEventDialogOpen(true); }}
        onTaskClick={(t) => { setSelectedTask(t); setIsTaskDialogOpen(true); }}
        onPublicationClick={(p) => { setSelectedPublication(p); setIsPublicationDialogOpen(true); }}
      />

      {selectedContact && <ContactDialog isOpen={isContactDialogOpen} onClose={handleDialogClose} contact={selectedContact} onSave={handleDialogClose} />}
      {selectedOpportunity && <OpportunityEditor isOpen={isOpportunityDialogOpen} onClose={handleDialogClose} opportunity={selectedOpportunity} onSave={handleDialogClose} />}
      {selectedQuote && <QuoteEditor isOpen={isQuoteDialogOpen} onClose={handleDialogClose} quote={selectedQuote} onSave={handleDialogClose} />}
      <EventDialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen} event={selectedEvent} onSave={handleDialogClose} />
      {selectedTask && <TaskEditor task={selectedTask} isOpen={isTaskDialogOpen} onClose={handleDialogClose} onTaskUpdated={handleDialogClose} />}
      {selectedPublication && (
        <PublicationFormMultiPlatform
          isOpen={isPublicationDialogOpen} onClose={handleDialogClose}
          onSubmit={async (data) => {
            try {
              const { error } = await supabase.from('publications').update({
                title: data.title, content: data.content, scheduled_date: data.scheduled_date,
                platforms: data.platforms, media_url: data.media_url, media_type: data.media_type, external_link: data.external_link
              }).eq('id', selectedPublication?.id);
              if (error) throw error;
              handleDialogClose();
            } catch (error) { console.error('Error updating publication:', error); }
          }}
          initialData={selectedPublication ? {
            title: selectedPublication.title, content: selectedPublication.content, scheduled_date: selectedPublication.scheduled_date,
            platforms: selectedPublication.platforms || [], assigned_to: selectedPublication.assigned_to || '',
            media_url: selectedPublication.media_url, media_type: selectedPublication.media_type, external_link: selectedPublication.external_link
          } : {}}
          userProfiles={userProfiles} isEditing={true}
        />
      )}
    </div>
  );
};
