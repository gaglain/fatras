
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { UserProvider } from './contexts/UserContext';
import Index from './pages/Index';
import { Dashboard } from './pages/Dashboard';
import { Events } from './pages/Events';
import { EventTypes } from './pages/EventTypes';
import { Artists } from './pages/Artists';
import { Contacts } from './pages/Contacts';
import { Tasks } from './pages/Tasks';
import { Contracts } from './pages/Contracts';
import { Opportunities } from './pages/Opportunities';
import { Email } from './pages/Email';
import { EmailCampaigns } from './pages/EmailCampaigns';
import { Messagerie } from './pages/Messagerie';
import { Agenda } from './pages/Agenda';
import { ShowBible } from './pages/ShowBible';
import { RoadShow } from './pages/RoadShow';
import { Merchandise } from './pages/Merchandise';
import { Preferences } from './pages/Preferences';
import { Website } from './pages/Website';
import NotFound from './pages/NotFound';
import { Toaster } from './components/ui/sonner';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/website" element={<Website />} />
            <Route path="/" element={<Layout />}>
              <Route index element={<Index />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="event-types" element={<EventTypes />} />
              <Route path="artists" element={<Artists />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="contracts" element={<Contracts />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="email" element={<Email />} />
              <Route path="email-campaigns" element={<EmailCampaigns />} />
              <Route path="messagerie" element={<Messagerie />} />
              <Route path="agenda" element={<Agenda />} />
              <Route path="show-bible" element={<ShowBible />} />
              <Route path="road-show" element={<RoadShow />} />
              <Route path="merchandise" element={<Merchandise />} />
              <Route path="preferences" element={<Preferences />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
