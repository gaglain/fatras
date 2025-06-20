
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
const Tasks = lazy(() => import('@/pages/Tasks').then(module => ({ default: module.Tasks })));
const Events = lazy(() => import('@/pages/Events').then(module => ({ default: module.Events })));
const Messagerie = lazy(() => import('@/pages/Messagerie').then(module => ({ default: module.Messagerie })));
const Preferences = lazy(() => import('@/pages/Preferences').then(module => ({ default: module.Preferences })));
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
          
          <Route path="/not-found" element={<FrontLayout><NotFound /></FrontLayout>} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />

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
            path="/preferences"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Preferences />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
