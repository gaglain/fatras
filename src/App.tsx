import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Contacts } from './pages/Contacts';
import { Events } from './pages/Events';
import { EventTypes } from './pages/EventTypes';
import { Artists } from './pages/Artists';
import { Opportunities } from './pages/Opportunities';
import { Contracts } from './pages/Contracts';
import { Email } from './pages/Email';
import { EmailCampaigns } from './pages/EmailCampaigns';
import { Tasks } from './pages/Tasks';
import { Messagerie } from './pages/Messagerie';
import { Agenda } from './pages/Agenda';
import { ShowBible } from './pages/ShowBible';
import { Roadshow } from './pages/Roadshow';
import { Merchandise } from './pages/Merchandise';
import { Website } from './pages/Website';
import { Preferences } from './pages/Preferences';
import { NotFound } from './pages/NotFound';
import { QueryClientProvider as QueryClient } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';
import { UserProvider } from './contexts/UserContext';
import { Application } from './pages/Application';

function App() {
  return (
    <QueryClient client={queryClient}>
      <UserProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/events" element={<Events />} />
              <Route path="/event-types" element={<EventTypes />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/email" element={<Email />} />
              <Route path="/email-campaigns" element={<EmailCampaigns />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/messagerie" element={<Messagerie />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/show-bible" element={<ShowBible />} />
              <Route path="/roadshow" element={<Roadshow />} />
              <Route path="/merchandise" element={<Merchandise />} />
              <Route path="/application" element={<Application />} />
              <Route path="/website" element={<Website />} />
              <Route path="/preferences" element={<Preferences />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </UserProvider>
    </QueryClient>
  );
}

export default App;
