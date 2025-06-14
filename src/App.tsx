
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { UserProvider } from '@/contexts/UserContext';
import { Toaster } from '@/components/ui/sonner';
import { Index } from '@/pages/Index';
import { Dashboard } from '@/pages/Dashboard';
import { Contacts } from '@/pages/Contacts';
import { ContactLists } from '@/pages/ContactLists';
import { Artists } from '@/pages/Artists';
import { ArtistDetail } from '@/pages/ArtistDetail';
import { Events } from '@/pages/Events';
import { EventTypes } from '@/pages/EventTypes';
import { Agenda } from '@/pages/Agenda';
import { Opportunities } from '@/pages/Opportunities';
import { Contracts } from '@/pages/Contracts';
import { Tasks } from '@/pages/Tasks';
import { Email } from '@/pages/Email';
import { EmailCampaigns } from '@/pages/EmailCampaigns';
import { Messagerie } from '@/pages/Messagerie';
import { Forms } from '@/pages/Forms';
import { PublicationCalendar } from '@/pages/PublicationCalendar';
import { ShowBible } from '@/pages/ShowBible';
import { RoadShow } from '@/pages/RoadShow';
import { Merchandise } from '@/pages/Merchandise';
import { Website } from '@/pages/Website';
import { UserManagement } from '@/pages/UserManagement';
import { Application } from '@/pages/Application';
import { Preferences } from '@/pages/Preferences';
import { WebsiteBackoffice } from '@/pages/WebsiteBackoffice';
import { WebsitePageEditor } from '@/pages/WebsitePageEditor';
import { WebsiteWithEditor } from '@/pages/WebsiteWithEditor';
import { FrontHome } from '@/pages/FrontHome';
import { FrontArtists } from '@/pages/FrontArtists';
import { FrontEvents } from '@/pages/FrontEvents';
import { FrontContact } from '@/pages/FrontContact';
import { FrontShop } from '@/pages/FrontShop';
import { NotFound } from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Layout } from '@/components/Layout';
import { FrontLayout } from '@/components/FrontLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <Router>
            <Routes>
              {/* Public routes with FrontLayout */}
              <Route path="/" element={<FrontLayout><Index /></FrontLayout>} />
              <Route path="/front" element={<FrontLayout><FrontHome /></FrontLayout>} />
              <Route path="/front/artists" element={<FrontLayout><FrontArtists /></FrontLayout>} />
              <Route path="/front/events" element={<FrontLayout><FrontEvents /></FrontLayout>} />
              <Route path="/front/contact" element={<FrontLayout><FrontContact /></FrontLayout>} />
              <Route path="/front/shop" element={<FrontLayout><FrontShop /></FrontLayout>} />

              {/* Admin route */}
              <Route path="/admin" element={<Index />} />

              {/* Protected routes with Layout */}
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
              <Route path="/contact-lists" element={<ProtectedRoute><Layout><ContactLists /></Layout></ProtectedRoute>} />
              <Route path="/artists" element={<ProtectedRoute><Layout><Artists /></Layout></ProtectedRoute>} />
              <Route path="/artists/:id" element={<ProtectedRoute><Layout><ArtistDetail /></Layout></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
              <Route path="/event-types" element={<ProtectedRoute><Layout><EventTypes /></Layout></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><Layout><Agenda /></Layout></ProtectedRoute>} />
              <Route path="/opportunities" element={<ProtectedRoute><Layout><Opportunities /></Layout></ProtectedRoute>} />
              <Route path="/contracts" element={<ProtectedRoute><Layout><Contracts /></Layout></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
              <Route path="/email" element={<ProtectedRoute><Layout><Email /></Layout></ProtectedRoute>} />
              <Route path="/email-campaigns" element={<ProtectedRoute><Layout><EmailCampaigns /></Layout></ProtectedRoute>} />
              <Route path="/messagerie" element={<ProtectedRoute><Layout><Messagerie /></Layout></ProtectedRoute>} />
              <Route path="/forms" element={<ProtectedRoute><Layout><Forms /></Layout></ProtectedRoute>} />
              <Route path="/publication-calendar" element={<ProtectedRoute><Layout><PublicationCalendar /></Layout></ProtectedRoute>} />
              <Route path="/show-bible" element={<ProtectedRoute><Layout><ShowBible /></Layout></ProtectedRoute>} />
              <Route path="/road-show" element={<ProtectedRoute><Layout><RoadShow /></Layout></ProtectedRoute>} />
              <Route path="/merchandise" element={<ProtectedRoute><Layout><Merchandise /></Layout></ProtectedRoute>} />
              <Route path="/website" element={<ProtectedRoute><Layout><Website /></Layout></ProtectedRoute>} />
              <Route path="/user-management" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
              <Route path="/application" element={<ProtectedRoute><Layout><Application /></Layout></ProtectedRoute>} />
              <Route path="/preferences" element={<ProtectedRoute><Layout><Preferences /></Layout></ProtectedRoute>} />
              
              {/* Website management routes */}
              <Route path="/website/backoffice" element={<ProtectedRoute><Layout><WebsiteBackoffice /></Layout></ProtectedRoute>} />
              <Route path="/website/editor/:pageId" element={<ProtectedRoute><Layout><WebsitePageEditor /></Layout></ProtectedRoute>} />
              <Route path="/website-with-editor" element={<ProtectedRoute><Layout><WebsiteWithEditor /></Layout></ProtectedRoute>} />

              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
