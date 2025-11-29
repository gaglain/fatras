import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Install from "./pages/Install";
import Auth from "./pages/Auth";
import { HelmetProvider } from "react-helmet-async";
import { FrontHome } from "./pages/FrontHome";
import { FrontArtists } from "./pages/FrontArtists";
import { FrontArtistDetail } from "./pages/FrontArtistDetail";
import { FrontEvents } from "./pages/FrontEvents";
import { FrontTour } from "./pages/FrontTour";
import { FrontContact } from "./pages/FrontContact";
import { FrontShop } from "./pages/FrontShop";
import Dashboard from "./pages/Dashboard";
import { Artists } from "./pages/Artists";
import { ArtistDetail } from "./pages/ArtistDetail";
import { ArtistDetailPage } from "./pages/ArtistDetailPage";
import { Events } from "./pages/Events";
import { EventDetail } from "./pages/EventDetail";
import { Contacts } from "./pages/Contacts";
import { Preferences } from "./pages/Preferences";
import { Tasks } from "./pages/Tasks";
import { NotFound } from "./pages/NotFound";
import { RoadShow } from "./pages/RoadShow";
import { Messagerie } from "./pages/Messagerie";
import { ShowBible } from "./pages/ShowBible";
import { Contracts } from "./pages/Contracts";
import Email from "./pages/EmailSimple";
import { EmailCampaigns } from "./pages/EmailCampaigns";
import { ContactLists } from "./pages/ContactLists";
import { ContactDetail } from "./pages/ContactDetail";
import { Opportunities } from "./pages/Opportunities";
import { EventTypes } from "./pages/EventTypes";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { Forms } from "./pages/Forms";
import { UserManagement } from "./pages/UserManagement";
import { FrontArtistShowcase } from "./pages/FrontArtistShowcase";
import { Agenda } from "./pages/Agenda";
import { Merchandise } from "./pages/Merchandise";
import { MerchandiseBackoffice } from "./pages/MerchandiseBackoffice";
import { Website } from "./pages/Website";
import { WebsiteManager } from "./pages/WebsiteManager";
import { WebsiteBackoffice } from "./pages/WebsiteBackoffice";
import { Application } from "./pages/Application";
import { Quotes } from "./pages/Quotes";
import { RolePermissions } from "./pages/RolePermissions";
import ContactTypes from "./pages/ContactTypes";
import Assignments from "./pages/Assignments";
import { Layout } from "./components/Layout";
import { FontManager } from "./components/website/FontManager";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import { AuthProvider } from "./contexts/AuthContext";
import { FrontLayout } from "./components/FrontLayout";
import { WebsiteConfigProvider } from "./contexts/WebsiteConfigContext";
import { WebsiteMenuSyncBridge } from "./components/WebsiteMenuSyncBridge";
import { ErrorBoundary } from "react-error-boundary";
import { PWAManifestSync } from "./components/PWAManifestSync";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 60000,
    },
  },
});

const App = () => {
  console.log('🚀 App starting - WITH ALL ROUTES...');
  
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => (
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <h1 style={{ marginBottom: 8, color: 'var(--destructive, #ef4444)' }}>Application Error</h1>
          <p>Something went wrong loading the application.</p>
          <p>Please refresh the page or contact support.</p>

          <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: 6, background: 'white', cursor: 'pointer' }}
            >
              Rafraîchir
            </button>
            <button
              onClick={() => {
                try {
                  // Conserver l'auth Supabase et le thème, nettoyer le reste
                  const preserved: Record<string, string> = {};
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i)!;
                    if (key.startsWith('sb-') || key === 'lovable-theme') {
                      preserved[key] = localStorage.getItem(key) || '';
                    }
                  }
                  localStorage.clear();
                  Object.entries(preserved).forEach(([k, v]) => localStorage.setItem(k, v));
                  sessionStorage.clear();
                } catch (e) {
                  console.warn('Cache reset failed:', e);
                }
                resetErrorBoundary();
                window.location.reload();
              }}
              style={{ padding: '8px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer' }}
            >
              Réinitialiser l'application
            </button>
          </div>

          {import.meta.env.MODE !== 'production' && (
            <pre style={{ marginTop: 16, fontSize: 12, color: '#6b7280', whiteSpace: 'pre-wrap' }}>
              {String(error?.message || '')}
            </pre>
          )}
        </div>
      )}
      onError={(error) => {
        console.error('💥 React Error Boundary caught error:', error);
        try {
          localStorage.setItem('last_app_error', JSON.stringify({ message: String(error?.message || error), time: new Date().toISOString() }));
        } catch {}
      }}
    >
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
      <PWAManifestSync />
      <HelmetProvider>
      <ThemeProvider 
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
        storageKey="lovable-theme"
      >
        <TooltipProvider>
          <BrowserRouter>
            <UserProvider>
              <WebsiteConfigProvider>
                <Toaster />
                <WebsiteMenuSyncBridge />
                <Routes>
                <Route path="/" element={<Index />} />
                
                {/* Routes du front-end - PUBLIC */}
                <Route path="/front" element={<FrontHome />} />
                <Route path="/front/artists" element={<FrontLayout><FrontArtists /></FrontLayout>} />
                <Route path="/front/events" element={<FrontLayout><FrontEvents /></FrontLayout>} />
                <Route path="/front/contact" element={<FrontLayout><FrontContact /></FrontLayout>} />
                <Route path="/front/shop" element={<FrontLayout><FrontShop /></FrontLayout>} />
                
                {/* Routes publiques pour les artistes et tournées */}
                <Route path="/artistes" element={<FrontLayout><FrontArtists /></FrontLayout>} />
                <Route path="/artistes/:id" element={<FrontLayout><FrontArtistDetail /></FrontLayout>} />
                <Route path="/tournee" element={<FrontLayout><FrontTour /></FrontLayout>} />
                <Route path="/spectacles" element={<FrontLayout><FrontArtists /></FrontLayout>} />
                
                <Route path="/artist-showcase" element={<FrontArtistShowcase />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/install" element={<Install />} />
                
                {/* Routes du back-office - PROTÉGÉES */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/assignments" element={<ProtectedRoute><Layout><Assignments /></Layout></ProtectedRoute>} />
                <Route path="/artists" element={<ProtectedRoute><Layout><Artists /></Layout></ProtectedRoute>} />
                <Route path="/artists/:id" element={<ProtectedRoute><Layout><ArtistDetailPage /></Layout></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
                <Route path="/events/:id" element={<ProtectedRoute><Layout><EventDetail /></Layout></ProtectedRoute>} />
<Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
<Route path="/contacts/:id" element={<ProtectedRoute><Layout><ContactDetail /></Layout></ProtectedRoute>} />
<Route path="/contact-types" element={<ProtectedRoute><Layout><ContactTypes /></Layout></ProtectedRoute>} />
<Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
                <Route path="/roadshow" element={<ProtectedRoute><Layout><RoadShow /></Layout></ProtectedRoute>} />
                <Route path="/messagerie" element={<ProtectedRoute><Layout><Messagerie /></Layout></ProtectedRoute>} />
<Route path="/show-bible" element={<ProtectedRoute><Layout><ShowBible /></Layout></ProtectedRoute>} />
<Route path="/contracts" element={<ProtectedRoute><Layout><Contracts /></Layout></ProtectedRoute>} />
<Route path="/email" element={<ProtectedRoute><Layout><Email /></Layout></ProtectedRoute>} />
<Route path="/email-campaigns" element={<ProtectedRoute><Layout><EmailCampaigns /></Layout></ProtectedRoute>} />
<Route path="/contact-lists" element={<ProtectedRoute><Layout><ContactLists /></Layout></ProtectedRoute>} />
<Route path="/opportunities" element={<ProtectedRoute><Layout><Opportunities /></Layout></ProtectedRoute>} />
<Route path="/event-types" element={<ProtectedRoute><Layout><EventTypes /></Layout></ProtectedRoute>} />
<Route path="/publication-calendar" element={<ProtectedRoute><Layout><PublicationCalendar /></Layout></ProtectedRoute>} />
<Route path="/forms" element={<ProtectedRoute><Layout><Forms /></Layout></ProtectedRoute>} />
<Route path="/user-management" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
<Route path="/role-permissions" element={<ProtectedRoute><Layout><RolePermissions /></Layout></ProtectedRoute>} />
<Route path="/agenda" element={<ProtectedRoute><Layout><Agenda /></Layout></ProtectedRoute>} />
<Route path="/merchandise" element={<ProtectedRoute><Layout><Merchandise /></Layout></ProtectedRoute>} />
<Route path="/merchandise-backoffice" element={<ProtectedRoute><Layout><MerchandiseBackoffice /></Layout></ProtectedRoute>} />
                <Route path="/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
                <Route path="/website-manager" element={<ProtectedRoute><WebsiteManager /></ProtectedRoute>} />
                <Route path="/website-backoffice" element={<ProtectedRoute><WebsiteBackoffice /></ProtectedRoute>} />
                <Route path="/website/fonts" element={<ProtectedRoute><Layout><FontManager /></Layout></ProtectedRoute>} />
<Route path="/application" element={<ProtectedRoute><Layout><Application /></Layout></ProtectedRoute>} />
<Route path="/quotes" element={<ProtectedRoute><Layout><Quotes /></Layout></ProtectedRoute>} />
                <Route path="/preferences" element={<ProtectedRoute><Layout><Preferences /></Layout></ProtectedRoute>} />
                {/* Admin aliases */}
                <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="/Admin" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<NotFound />} />
                </Routes>
              </WebsiteConfigProvider>
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
      </HelmetProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;