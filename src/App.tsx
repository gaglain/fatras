
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { FrontLayout } from '@/components/FrontLayout';
import { BackOfficeHeader } from '@/components/BackOfficeHeader';
import { Dashboard } from '@/pages/Dashboard';
import { Contacts } from '@/pages/Contacts';
import { ContactLists } from '@/pages/ContactLists';
import { Artists } from '@/pages/Artists';
import { Events } from '@/pages/Events';
import { Tasks } from '@/pages/Tasks';
import { Contracts } from '@/pages/Contracts';
import { Email } from '@/pages/Email';
import { EmailCampaigns } from '@/pages/EmailCampaigns';
import { Messagerie } from '@/pages/Messagerie';
import { Agenda } from '@/pages/Agenda';
import { ShowBible } from '@/pages/ShowBible';
import { RoadShow } from '@/pages/RoadShow';
import { Merchandise } from '@/pages/Merchandise';
import { Opportunities } from '@/pages/Opportunities';
import { Website } from '@/pages/Website';
import { Application } from '@/pages/Application';
import { Preferences } from '@/pages/Preferences';
import { FrontHome } from '@/pages/FrontHome';
import { FrontArtists } from '@/pages/FrontArtists';
import { FrontEvents } from '@/pages/FrontEvents';
import { FrontContact } from '@/pages/FrontContact';
import { UserProvider } from '@/contexts/UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Front-end routes */}
          <Route path="/front/*" element={
            <FrontLayout>
              <Routes>
                <Route path="/" element={<FrontHome />} />
                <Route path="/artists" element={<FrontArtists />} />
                <Route path="/events" element={<FrontEvents />} />
                <Route path="/contact" element={<FrontContact />} />
              </Routes>
            </FrontLayout>
          } />
          
          {/* Back-office routes */}
          <Route path="/*" element={
            <div className="min-h-screen bg-gray-50 flex w-full">
              <Sidebar />
              <div className="flex-1 flex flex-col">
                <Header />
                <BackOfficeHeader />
                <main className="flex-1 overflow-y-auto">
                  <div className="p-6">
                    <Routes>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/contacts" element={<Contacts />} />
                      <Route path="/contact-lists" element={<ContactLists />} />
                      <Route path="/artists" element={<Artists />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/contracts" element={<Contracts />} />
                      <Route path="/email" element={<Email />} />
                      <Route path="/email-campaigns" element={<EmailCampaigns />} />
                      <Route path="/messagerie" element={<Messagerie />} />
                      <Route path="/agenda" element={<Agenda />} />
                      <Route path="/show-bible" element={<ShowBible />} />
                      <Route path="/road-show" element={<RoadShow />} />
                      <Route path="/merchandise" element={<Merchandise />} />
                      <Route path="/opportunities" element={<Opportunities />} />
                      <Route path="/website" element={<Website />} />
                      <Route path="/application" element={<Application />} />
                      <Route path="/preferences" element={<Preferences />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </div>
          } />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </UserProvider>
  );
}

export default App;
