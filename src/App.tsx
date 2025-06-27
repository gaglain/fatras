
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { FrontLayout } from '@/components/FrontLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomColors } from '@/hooks/useCustomColors';

// Pages existantes - using correct export types
const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Contacts = lazy(() => import('@/pages/Contacts').then(module => ({ default: module.Contacts })));
const ContactLists = lazy(() => import('@/pages/ContactLists').then(module => ({ default: module.ContactLists })));
const Tasks = lazy(() => import('@/pages/Tasks').then(module => ({ default: module.Tasks })));
const Events = lazy(() => import('@/pages/Events').then(module => ({ default: module.Events })));
const EventTypes = lazy(() => import('@/pages/EventTypes').then(module => ({ default: module.EventTypes })));
const Agenda = lazy(() => import('@/pages/Agenda').then(module => ({ default: module.Agenda })));
const Artists = lazy(() => import('@/pages/Artists').then(module => ({ default: module.Artists })));
const Contracts = lazy(() => import('@/pages/Contracts').then(module => ({ default: module.Contracts })));
const Email = lazy(() => import('@/pages/Email').then(module => ({ default: module.Email })));
const EmailCampaigns = lazy(() => import('@/pages/EmailCampaigns').then(module => ({ default: module.EmailCampaigns })));
const Forms = lazy(() => import('@/pages/Forms').then(module => ({ default: module.Forms })));
const Messagerie = lazy(() => import('@/pages/Messagerie').then(module => ({ default: module.Messagerie })));
const ShowBible = lazy(() => import('@/pages/ShowBible').then(module => ({ default: module.ShowBible })));
const RoadShow = lazy(() => import('@/pages/RoadShow'));
const Merchandise = lazy(() => import('@/pages/Merchandise').then(module => ({ default: module.Merchandise })));
const Opportunities = lazy(() => import('@/pages/Opportunities').then(module => ({ default: module.Opportunities })));
const Website = lazy(() => import('@/pages/Website').then(module => ({ default: module.Website })));
const WebsiteBackoffice = lazy(() => import('@/pages/WebsiteBackoffice').then(module => ({ default: module.WebsiteBackoffice })));
const WebsitePageEditor = lazy(() => import('@/pages/WebsitePageEditor').then(module => ({ default: module.WebsitePageEditor })));
const UserManagement = lazy(() => import('@/pages/UserManagement').then(module => ({ default: module.UserManagement })));
const Application = lazy(() => import('@/pages/Application').then(module => ({ default: module.Application })));
const Preferences = lazy(() => import('@/pages/Preferences').then(module => ({ default: module.Preferences })));
const PublicationCalendar = lazy(() => import('@/pages/PublicationCalendar').then(module => ({ default: module.PublicationCalendar })));
const NotFound = lazy(() => import('@/pages/NotFound').then(module => ({ default: module.NotFound })));

// Page de connexion
const Index = lazy(() => import('@/pages/Index').then(module => ({ default: module.Index })));

// Pages front-end
const FrontHome = lazy(() => import('@/pages/FrontHome').then(module => ({ default: module.FrontHome })));
const FrontArtists = lazy(() => import('@/pages/FrontArtists').then(module => ({ default: module.FrontArtists })));
const FrontEvents = lazy(() => import('@/pages/FrontEvents').then(module => ({ default: module.FrontEvents })));
const FrontShop = lazy(() => import('@/pages/FrontShop').then(module => ({ default: module.FrontShop })));
const FrontContact = lazy(() => import('@/pages/FrontContact').then(module => ({ default: module.FrontContact })));

function App() {
  useCustomColors();

  return (
    <>
      <Helmet>
        <title>MusiConnect - Plateforme de Booking Musical</title>
        <meta name="description" content="Plateforme complète de booking musical pour artistes et organisateurs" />
      </Helmet>

      <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Chargement...</div>}>
        <Routes>
          {/* Pages publiques */}
          <Route path="/" element={<Index />} />
          <Route path="/admin" element={<Index />} />
          <Route path="/login" element={<Index />} />
          
          {/* Routes front-end publiques */}
          <Route path="/front" element={<FrontLayout><Outlet /></FrontLayout>}>
            <Route index element={<FrontHome />} />
            <Route path="artists" element={<FrontArtists />} />
            <Route path="events" element={<FrontEvents />} />
            <Route path="shop" element={<FrontShop />} />
            <Route path="contact" element={<FrontContact />} />
          </Route>
          
          {/* Routes protégées avec Layout */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="contact-lists" element={<ContactLists />} />
            <Route path="artists" element={<Artists />} />
            <Route path="events" element={<Events />} />
            <Route path="event-types" element={<EventTypes />} />
            <Route path="agenda" element={<Agenda />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="opportunities" element={<Opportunities />} />
            <Route path="roadshow" element={<RoadShow />} />
            <Route path="feuille-de-route" element={<Navigate to="/roadshow" replace />} />
            <Route path="road-show" element={<Navigate to="/roadshow" replace />} />
            <Route path="email" element={<Email />} />
            <Route path="email-campaigns" element={<EmailCampaigns />} />
            <Route path="messagerie" element={<Messagerie />} />
            <Route path="forms" element={<Forms />} />
            <Route path="publication-calendar" element={<PublicationCalendar />} />
            <Route path="show-bible" element={<ShowBible />} />
            <Route path="merchandise" element={<Merchandise />} />
            <Route path="website" element={<WebsiteBackoffice />} />
            <Route path="website/editor/:pageId" element={<WebsitePageEditor />} />
            <Route path="admin/editor/:pageId" element={<WebsitePageEditor />} />
            <Route path="user-management" element={<UserManagement />} />
            <Route path="application" element={<Application />} />
            <Route path="preferences" element={<Preferences />} />
          </Route>
          
          <Route path="/404" element={<FrontLayout><NotFound /></FrontLayout>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
