import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Layout } from '@/components/Layout';
import { FrontLayout } from '@/components/FrontLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useCustomColors } from '@/hooks/useCustomColors';

// Pages
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Tasks = lazy(() => import('@/pages/Tasks'));
const Events = lazy(() => import('@/pages/Events'));
const Messagerie = lazy(() => import('@/pages/Messagerie'));
const Preferences = lazy(() => import('@/pages/Preferences'));
const Pricing = lazy(() => import('@/pages/Pricing'));
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const Home = lazy(() => import('@/pages/Home'));
const Legal = lazy(() => import('@/pages/Legal'));
const NotFound = lazy(() => import('@/pages/NotFound'));

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
          {/* Routes publiques */}
          <Route path="/" element={<FrontLayout><Home /></FrontLayout>} />
          <Route path="/login" element={<FrontLayout><Login /></FrontLayout>} />
          <Route path="/register" element={<FrontLayout><Register /></FrontLayout>} />
          <Route path="/pricing" element={<FrontLayout><Pricing /></FrontLayout>} />
          <Route path="/legal" element={<FrontLayout><Legal /></FrontLayout>} />
          <Route path="/not-found" element={<FrontLayout><NotFound /></FrontLayout>} />
          <Route path="*" element={<Navigate to="/not-found" replace />} />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Layout><Contacts /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Layout><Tasks /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Layout><Events /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/messagerie"
            element={
              <ProtectedRoute>
                <Layout><Messagerie /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/preferences"
            element={
              <ProtectedRoute>
                <Layout><Preferences /></Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
