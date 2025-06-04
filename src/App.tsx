
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { UserProvider } from '@/contexts/UserContext';

// Import existing pages with named exports
import { Dashboard } from '@/pages/Dashboard';
import { Contacts } from '@/pages/Contacts';
import { Events } from '@/pages/Events';
import { Contracts } from '@/pages/Contracts';
import { Artists } from '@/pages/Artists';
import { ArtistDetail } from '@/pages/ArtistDetail';
import { Agenda } from '@/pages/Agenda';
import { Email } from '@/pages/Email';
import { EmailCampaigns } from '@/pages/EmailCampaigns';
import { Messagerie } from '@/pages/Messagerie';
import { Tasks } from '@/pages/Tasks';
import { Opportunities } from '@/pages/Opportunities';
import { Merchandise } from '@/pages/Merchandise';
import { RoadShow } from '@/pages/RoadShow';
import { ShowBible } from '@/pages/ShowBible';
import { EventTypes } from '@/pages/EventTypes';
import { Preferences } from '@/pages/Preferences';
import { Website } from '@/pages/Website';
import { WebsiteWithEditor } from '@/pages/WebsiteWithEditor';
import { Application } from '@/pages/Application';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <Router>
          <ProtectedRoute>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<DashboardHome />} />
                <Route path="dashboard" element={<DashboardHome />} />
                <Route path="contacts" element={<Contacts />} />
                <Route path="events" element={<Events />} />
                <Route path="contracts" element={<Contracts />} />
                <Route path="artists" element={<Artists />} />
                <Route path="artist-detail" element={<ArtistDetail />} />
                <Route path="agenda" element={<Agenda />} />
                <Route path="email" element={<Email />} />
                <Route path="email-campaigns" element={<EmailCampaigns />} />
                <Route path="messagerie" element={<Messagerie />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="opportunities" element={<Opportunities />} />
                <Route path="merchandise" element={<Merchandise />} />
                <Route path="road-show" element={<RoadShow />} />
                <Route path="show-bible" element={<ShowBible />} />
                <Route path="event-types" element={<EventTypes />} />
                <Route path="preferences" element={<Preferences />} />
                <Route path="website" element={<Website />} />
                <Route path="website-editor" element={<WebsiteWithEditor />} />
                <Route path="application" element={<Application />} />
              </Route>
            </Routes>
          </ProtectedRoute>
        </Router>
      </UserProvider>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
