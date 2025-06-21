import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
          <Route path="/front" element={<FrontLayout />}>
            <Route index element={<FrontHome />} />
            <Route path="artists" element={<FrontArtists />} />
            <Route path="events" element={<FrontEvents />} />
            <Route path="shop" element={<FrontShop />} />
            <Route path="contact" element={<FrontContact />} />
          </Route>
          
          {/* Routes protégées avec Layout */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
          </Route>
          
          
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Contacts />} />
          </Route>
          
          <Route
            path="/contact-lists"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ContactLists />} />
          </Route>
          
          <Route
            path="/artists"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Artists />} />
          </Route>
          
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Events />} />
          </Route>
          
          <Route
            path="/event-types"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EventTypes />} />
          </Route>
          
          <Route
            path="/agenda"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Agenda />} />
          </Route>
          
          <Route
            path="/contracts"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Contracts />} />
          </Route>
          
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Tasks />} />
          </Route>
          
          <Route
            path="/opportunities"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Opportunities />} />
          </Route>
          
          <Route
            path="/road-show"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoadShow />} />
          </Route>
          
          <Route
            path="/feuille-de-route"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<RoadShow />} />
          </Route>
          
          <Route
            path="/email"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Email />} />
          </Route>
          
          <Route
            path="/email-campaigns"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<EmailCampaigns />} />
          </Route>
          
          <Route
            path="/messagerie"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Messagerie />} />
          </Route>
          
          <Route
            path="/forms"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Forms />} />
          </Route>
          
          <Route
            path="/publication-calendar"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<PublicationCalendar />} />
          </Route>
          
          <Route
            path="/show-bible"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ShowBible />} />
          </Route>
          
          <Route
            path="/merchandise"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Merchandise />} />
          </Route>
          
          <Route
            path="/website"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Website />} />
          </Route>
          
          <Route
            path="/user-management"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserManagement />} />
          </Route>
          
          <Route
            path="/application"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Application />} />
          </Route>
          
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Preferences />} />
          </Route>
          
          
          <Route path="/404" element={<FrontLayout><NotFound /></FrontLayout>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
