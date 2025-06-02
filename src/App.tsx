
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from './contexts/UserContext';
import { Layout } from './components/Layout';
import { WebsiteLayout } from './components/WebsiteLayout';
import { Dashboard } from './pages/Dashboard';
import { Agenda } from './pages/Agenda';
import { Contacts } from './pages/Contacts';
import { Artists } from './pages/Artists';
import { ArtistDetail } from './pages/ArtistDetail';
import { Events } from './pages/Events';
import { EventTypes } from './pages/EventTypes';
import { Contracts } from './pages/Contracts';
import { Tasks } from './pages/Tasks';
import { Email } from './pages/Email';
import { EmailCampaigns } from './pages/EmailCampaigns';
import { Messagerie } from './pages/Messagerie';
import { ShowBible } from './pages/ShowBible';
import { RoadShow } from './pages/RoadShow';
import { Merchandise } from './pages/Merchandise';
import { Opportunities } from './pages/Opportunities';
import { Website } from './pages/Website';
import { Application } from './pages/Application';
import { Preferences } from './pages/Preferences';
import { Index } from './pages/Index';
import { NotFound } from './pages/NotFound';
import { Toaster } from '@/components/ui/toaster';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/website" element={
              <WebsiteLayout>
                <Website />
              </WebsiteLayout>
            } />
            <Route path="/*" element={<Layout />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="artists" element={<Artists />} />
              <Route path="artists/:id" element={<ArtistDetail />} />
              <Route path="events" element={<Events />} />
              <Route path="event-types" element={<EventTypes />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="email" element={<Email />} />
              <Route path="email-campaigns" element={<EmailCampaigns />} />
              <Route path="messagerie" element={<Messagerie />} />
              <Route path="show-bible" element={<ShowBible />} />
              <Route path="road-show" element={<RoadShow />} />
              <Route path="merchandise" element={<Merchandise />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="application" element={<Application />} />
              <Route path="preferences" element={<Preferences />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
