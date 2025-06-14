
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { Layout } from '@/components/Layout';
import { FrontLayout } from '@/components/FrontLayout';
import { WebsiteLayout } from '@/components/WebsiteLayout';

// Pages
import { Index } from '@/pages/Index';
import { Dashboard } from '@/pages/Dashboard';
import { Artists } from '@/pages/Artists';
import { ArtistDetail } from '@/pages/ArtistDetail';
import { Events } from '@/pages/Events';
import { Agenda } from '@/pages/Agenda';
import { Contacts } from '@/pages/Contacts';
import { ContactLists } from '@/pages/ContactLists';
import { Contracts } from '@/pages/Contracts';
import { Tasks } from '@/pages/Tasks';
import { RoadShow } from '@/pages/RoadShow';
import { Email } from '@/pages/Email';
import { EmailCampaigns } from '@/pages/EmailCampaigns';
import { Messagerie } from '@/pages/Messagerie';
import { Forms } from '@/pages/Forms';
import { Merchandise } from '@/pages/Merchandise';
import { ShowBible } from '@/pages/ShowBible';
import { Opportunities } from '@/pages/Opportunities';
import { EventTypes } from '@/pages/EventTypes';
import { UserManagement } from '@/pages/UserManagement';
import { Preferences } from '@/pages/Preferences';
import { Application } from '@/pages/Application';
import { PublicationCalendar } from '@/pages/PublicationCalendar';
import { Website } from '@/pages/Website';
import { WebsiteBackoffice } from '@/pages/WebsiteBackoffice';
import { WebsitePageEditor } from '@/pages/WebsitePageEditor';
import { WebsiteWithEditor } from '@/pages/WebsiteWithEditor';

// Front pages
import { FrontHome } from '@/pages/FrontHome';
import { FrontArtists } from '@/pages/FrontArtists';
import { FrontEvents } from '@/pages/FrontEvents';
import { FrontContact } from '@/pages/FrontContact';
import { FrontShop } from '@/pages/FrontShop';

import { NotFound } from '@/pages/NotFound';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <MessagingProvider>
            <Router>
              <Routes>
                {/* Redirection pour /road-show vers /roadshow */}
                <Route path="/road-show" element={<Navigate to="/roadshow" replace />} />
                
                {/* Routes principales avec Layout */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Index />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="artists" element={<Artists />} />
                  <Route path="artists/:id" element={<ArtistDetail />} />
                  <Route path="events" element={<Events />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="contacts" element={<Contacts />} />
                  <Route path="contact-lists" element={<ContactLists />} />
                  <Route path="contracts" element={<Contracts />} />
                  <Route path="tasks" element={<Tasks />} />
                  <Route path="roadshow" element={<RoadShow />} />
                  <Route path="email" element={<Email />} />
                  <Route path="email-campaigns" element={<EmailCampaigns />} />
                  <Route path="messagerie" element={<Messagerie />} />
                  <Route path="forms" element={<Forms />} />
                  <Route path="merchandise" element={<Merchandise />} />
                  <Route path="show-bible" element={<ShowBible />} />
                  <Route path="opportunities" element={<Opportunities />} />
                  <Route path="event-types" element={<EventTypes />} />
                  <Route path="user-management" element={<UserManagement />} />
                  <Route path="preferences" element={<Preferences />} />
                  <Route path="application" element={<Application />} />
                  <Route path="publication-calendar" element={<PublicationCalendar />} />
                  <Route path="website" element={<Website />} />
                  <Route path="website-editor" element={<WebsiteWithEditor />} />
                  
                  {/* Routes admin (back-office) */}
                  <Route path="admin" element={<WebsiteBackoffice />} />
                  <Route path="admin/editor/:pageId" element={<WebsitePageEditor />} />
                </Route>

                {/* Routes front-office avec FrontLayout */}
                <Route path="/front" element={<FrontLayout />}>
                  <Route index element={<FrontHome />} />
                  <Route path="artists" element={<FrontArtists />} />
                  <Route path="events" element={<FrontEvents />} />
                  <Route path="contact" element={<FrontContact />} />
                  <Route path="shop" element={<FrontShop />} />
                </Route>

                {/* Redirections pour compatibilité */}
                <Route path="/website/backoffice" element={<Navigate to="/admin" replace />} />
                <Route path="/website/editor/:pageId" element={<Navigate to="/admin/editor/:pageId" replace />} />

                {/* Page 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </MessagingProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
