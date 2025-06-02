
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
            <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
            <Route path="/agenda" element={<Layout><Agenda /></Layout>} />
            <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
            <Route path="/artists" element={<Layout><Artists /></Layout>} />
            <Route path="/artists/:id" element={<Layout><ArtistDetail /></Layout>} />
            <Route path="/events" element={<Layout><Events /></Layout>} />
            <Route path="/event-types" element={<Layout><EventTypes /></Layout>} />
            <Route path="/contracts" element={<Layout><Contracts /></Layout>} />
            <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
            <Route path="/email" element={<Layout><Email /></Layout>} />
            <Route path="/email-campaigns" element={<Layout><EmailCampaigns /></Layout>} />
            <Route path="/messagerie" element={<Layout><Messagerie /></Layout>} />
            <Route path="/show-bible" element={<Layout><ShowBible /></Layout>} />
            <Route path="/road-show" element={<Layout><RoadShow /></Layout>} />
            <Route path="/merchandise" element={<Layout><Merchandise /></Layout>} />
            <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
            <Route path="/application" element={<Layout><Application /></Layout>} />
            <Route path="/preferences" element={<Layout><Preferences /></Layout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
