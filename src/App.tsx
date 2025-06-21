
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { FrontLayout } from '@/components/FrontLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomColors } from '@/hooks/useCustomColors';

// Pages existantes - using named exports
const Dashboard = lazy(() => import('@/pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Contacts = lazy(() => import('@/pages/Contacts').then(module => ({ default: module.Contacts })));
const ContactLists = lazy(() => import('@/pages/ContactLists'));
const Tasks = lazy(() => import('@/pages/Tasks').then(module => ({ default: module.Tasks })));
const Events = lazy(() => import('@/pages/Events').then(module => ({ default: module.Events })));
const EventTypes = lazy(() => import('@/pages/EventTypes'));
const Agenda = lazy(() => import('@/pages/Agenda'));
const Artists = lazy(() => import('@/pages/Artists'));
const Contracts = lazy(() => import('@/pages/Contracts'));
const Email = lazy(() => import('@/pages/Email'));
const EmailCampaigns = lazy(() => import('@/pages/EmailCampaigns'));
const Forms = lazy(() => import('@/pages/Forms'));
const Messagerie = lazy(() => import('@/pages/Messagerie').then(module => ({ default: module.Messagerie })));
const ShowBible = lazy(() => import('@/pages/ShowBible'));
const RoadShow = lazy(() => import('@/pages/RoadShow'));
const Merchandise = lazy(() => import('@/pages/Merchandise'));
const Opportunities = lazy(() => import('@/pages/Opportunities'));
const Website = lazy(() => import('@/pages/Website'));
const UserManagement = lazy(() => import('@/pages/UserManagement'));
const Application = lazy(() => import('@/pages/Application'));
const Preferences = lazy(() => import('@/pages/Preferences').then(module => ({ default: module.Preferences })));
const PublicationCalendar = lazy(() => import('@/pages/PublicationCalendar'));
const NotFound = lazy(() => import('@/pages/NotFound'));

// Page de connexion
const Index = lazy(() => import('@/pages/Index').then(module => ({ default: module.Index })));

function App() {
  // Utiliser le hook pour appliquer les couleurs personnalisées
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
          
          <Route path="/not-found" element={<FrontLayout><NotFound /></FrontLayout>} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
