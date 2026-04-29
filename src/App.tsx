import { Suspense, lazy } from "react";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from "react-helmet-async";
import { ErrorBoundary } from "react-error-boundary";

import { UnifiedAuthProvider } from "./contexts/UnifiedAuthContext";
import { WebsiteConfigProvider } from "./contexts/WebsiteConfigContext";
import { PWAManifestSync } from "./components/PWAManifestSync";
import { WebsiteMenuSyncBridge } from "./components/WebsiteMenuSyncBridge";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { FrontLayout } from "./components/FrontLayout";
import { logger } from "./lib/logger";

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Lazy loaded pages - PUBLIC
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Install = lazy(() => import("./pages/Install"));
const PublicForm = lazy(() => import("./pages/PublicForm"));
const NotFound = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));

// Lazy loaded pages - FRONT (public website)
const FrontHome = lazy(() => import("./pages/FrontHome").then(m => ({ default: m.FrontHome })));
const FrontArtists = lazy(() => import("./pages/FrontArtists").then(m => ({ default: m.FrontArtists })));
const FrontArtistDetail = lazy(() => import("./pages/FrontArtistDetail").then(m => ({ default: m.FrontArtistDetail })));
const FrontEvents = lazy(() => import("./pages/FrontEvents").then(m => ({ default: m.FrontEvents })));
const FrontTour = lazy(() => import("./pages/FrontTour").then(m => ({ default: m.FrontTour })));
const FrontContact = lazy(() => import("./pages/FrontContact").then(m => ({ default: m.FrontContact })));
const FrontShop = lazy(() => import("./pages/FrontShop").then(m => ({ default: m.FrontShop })));
const FrontDynamicPage = lazy(() => import("./pages/FrontDynamicPage").then(m => ({ default: m.FrontDynamicPage })));
const FrontArtistShowcase = lazy(() => import("./pages/FrontArtistShowcase").then(m => ({ default: m.FrontArtistShowcase })));
const RoadsheetPublic = lazy(() => import("./pages/RoadsheetPublic").then(m => ({ default: m.RoadsheetPublic })));

// Lazy loaded pages - BACK-OFFICE (protected)
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Artists = lazy(() => import("./pages/Artists").then(m => ({ default: m.Artists })));
const ArtistDetailPage = lazy(() => import("./pages/ArtistDetailPage").then(m => ({ default: m.ArtistDetailPage })));
const Events = lazy(() => import("./pages/Events").then(m => ({ default: m.Events })));
const EventDetail = lazy(() => import("./pages/EventDetail").then(m => ({ default: m.EventDetail })));
const Contacts = lazy(() => import("./pages/Contacts").then(m => ({ default: m.Contacts })));
const ContactDetail = lazy(() => import("./pages/ContactDetail").then(m => ({ default: m.ContactDetail })));
const ContactTypes = lazy(() => import("./pages/ContactTypes"));
const ContactLists = lazy(() => import("./pages/ContactLists").then(m => ({ default: m.ContactLists })));
const Tasks = lazy(() => import("./pages/Tasks").then(m => ({ default: m.Tasks })));
const RoadShow = lazy(() => import("./pages/RoadShow").then(m => ({ default: m.RoadShow })));
const RoadshowAudit = lazy(() => import("./pages/RoadshowAudit").then(m => ({ default: m.RoadshowAudit })));
const Messagerie = lazy(() => import("./pages/Messagerie").then(m => ({ default: m.Messagerie })));
const ShowBible = lazy(() => import("./pages/ShowBible").then(m => ({ default: m.ShowBible })));
const Contracts = lazy(() => import("./pages/Contracts").then(m => ({ default: m.Contracts })));
const Email = lazy(() => import("./pages/EmailSimple"));
const EmailCampaigns = lazy(() => import("./pages/EmailCampaigns").then(m => ({ default: m.EmailCampaigns })));
const Opportunities = lazy(() => import("./pages/Opportunities").then(m => ({ default: m.Opportunities })));
const OpportunityDetail = lazy(() => import("./pages/OpportunityDetail").then(m => ({ default: m.OpportunityDetail })));
const EventTypes = lazy(() => import("./pages/EventTypes").then(m => ({ default: m.EventTypes })));
const PublicationCalendar = lazy(() => import("./pages/PublicationCalendar").then(m => ({ default: m.PublicationCalendar })));
const Forms = lazy(() => import("./pages/Forms").then(m => ({ default: m.Forms })));
const UserManagement = lazy(() => import("./pages/UserManagement").then(m => ({ default: m.UserManagement })));
const RolePermissions = lazy(() => import("./pages/RolePermissions").then(m => ({ default: m.RolePermissions })));
const Agenda = lazy(() => import("./pages/Agenda").then(m => ({ default: m.Agenda })));
const Merchandise = lazy(() => import("./pages/Merchandise").then(m => ({ default: m.Merchandise })));
const MerchandiseBackoffice = lazy(() => import("./pages/MerchandiseBackoffice").then(m => ({ default: m.MerchandiseBackoffice })));
const Website = lazy(() => import("./pages/Website").then(m => ({ default: m.Website })));
const WebsiteManager = lazy(() => import("./pages/WebsiteManager").then(m => ({ default: m.WebsiteManager })));
const WebsiteBackoffice = lazy(() => import("./pages/WebsiteBackoffice").then(m => ({ default: m.WebsiteBackoffice })));
const Application = lazy(() => import("./pages/Application").then(m => ({ default: m.Application })));
const Quotes = lazy(() => import("./pages/Quotes").then(m => ({ default: m.Quotes })));
const Preferences = lazy(() => import("./pages/Preferences").then(m => ({ default: m.Preferences })));
const Assignments = lazy(() => import("./pages/Assignments"));
const FontManager = lazy(() => import("./components/website/FontManager").then(m => ({ default: m.FontManager })));

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
  logger.log('🚀 App starting...');
  
  return (
    <ErrorBoundary
      fallbackRender={({ error, resetErrorBoundary }) => {
        // Detect stale chunk errors (after a new deploy, lazy() imports return HTML instead of JS)
        const msg = String(error?.message || '');
        const isChunkLoadError =
          msg.includes("Unexpected token '<'") ||
          msg.includes('Failed to fetch dynamically imported module') ||
          msg.includes('Loading chunk') ||
          msg.includes('Loading CSS chunk') ||
          msg.includes('Importing a module script failed') ||
          (error as any)?.name === 'ChunkLoadError';

        if (isChunkLoadError) {
          // Auto-recover: bust caches + SW, then hard-reload once
          const flag = 'chunk_reload_attempted_at';
          const last = Number(sessionStorage.getItem(flag) || '0');
          const now = Date.now();
          if (now - last > 10000) {
            sessionStorage.setItem(flag, String(now));
            (async () => {
              try {
                if ('caches' in window) {
                  const keys = await caches.keys();
                  await Promise.all(keys.map((k) => caches.delete(k)));
                }
                if ('serviceWorker' in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map((r) => r.unregister()));
                }
              } catch {}
              const url = new URL(window.location.href);
              url.searchParams.set('_r', String(now));
              window.location.replace(url.toString());
            })();
            return (
              <div style={{ padding: '24px', textAlign: 'center' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p style={{ marginTop: 12, color: '#6b7280' }}>Mise à jour de l'application…</p>
              </div>
            );
          }
        }

        return (
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
              onClick={async () => {
                try {
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

                  // Also clear Service Worker + Cache Storage to prevent mixed-build crashes
                  if ('caches' in window) {
                    const keys = await caches.keys();
                    await Promise.all(keys.map((k) => caches.delete(k)));
                  }
                  if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations();
                    await Promise.all(regs.map((r) => r.unregister()));
                  }
                } catch (e) {
                  logger.warn('Cache reset failed:', e);
                }

                resetErrorBoundary();
                window.location.reload();
              }}
              style={{ padding: '8px 12px', border: '1px solid #ef4444', color: '#ef4444', borderRadius: 6, background: 'white', cursor: 'pointer' }}
            >
              Réinitialiser l'application
            </button>
          </div>

          <pre style={{ marginTop: 16, fontSize: 12, color: '#6b7280', whiteSpace: 'pre-wrap', maxWidth: '600px', margin: '16px auto 0', textAlign: 'left' }}>
            {String(error?.message || error || 'Unknown error')}
            {error?.stack ? '\n\n' + error.stack.split('\n').slice(0, 5).join('\n') : ''}
          </pre>
        </div>
        );
      }}
      onError={(error) => {
        logger.error('💥 React Error Boundary caught error:', error);
        try {
          localStorage.setItem('last_app_error', JSON.stringify({ message: String(error?.message || error), time: new Date().toISOString() }));
        } catch {}
      }}
    >
      <QueryClientProvider client={queryClient}>
        <UnifiedAuthProvider>
          <HelmetProvider>
            <ThemeProvider 
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
              storageKey="lovable-theme"
            >
              <TooltipProvider>
                <ConfirmProvider>
                <BrowserRouter>
                  <WebsiteConfigProvider>
                    <PWAManifestSync />
                    <Toaster />
                    <WebsiteMenuSyncBridge />
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        
                        {/* Routes du front-end - PUBLIC */}
                        <Route path="/front" element={<FrontHome />} />
                        <Route path="/front/artists" element={<FrontLayout><FrontArtists /></FrontLayout>} />
                        <Route path="/front/events" element={<FrontLayout><FrontEvents /></FrontLayout>} />
                        <Route path="/front/contact" element={<FrontLayout><FrontContact /></FrontLayout>} />
                        <Route path="/front/shop" element={<FrontLayout><FrontShop /></FrontLayout>} />
                        <Route path="/front/*" element={<FrontDynamicPage />} />
                        
                        {/* Routes publiques pour les artistes et tournées */}
                        <Route path="/artistes" element={<FrontLayout><FrontArtists /></FrontLayout>} />
                        <Route path="/artistes/:id" element={<FrontLayout><FrontArtistDetail /></FrontLayout>} />
                        <Route path="/tournee" element={<FrontLayout><FrontTour /></FrontLayout>} />
                        <Route path="/front-tour" element={<FrontLayout><FrontTour /></FrontLayout>} />
                        <Route path="/feuille-de-route/:id" element={<RoadsheetPublic />} />
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
                        <Route path="/opportunities/:id" element={<ProtectedRoute><Layout><OpportunityDetail /></Layout></ProtectedRoute>} />
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
                        
                        {/* Pages dynamiques du site web */}
                        {/* Formulaire public */}
                        <Route path="/form/:id" element={<PublicForm />} />
                        
                        <Route path="/:slug" element={<FrontDynamicPage />} />
                        
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </WebsiteConfigProvider>
                </BrowserRouter>
                </ConfirmProvider>
              </TooltipProvider>
            </ThemeProvider>
          </HelmetProvider>
        </UnifiedAuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
