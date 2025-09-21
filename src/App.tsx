import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { FrontHome } from "./pages/FrontHome";
import { FrontArtists } from "./pages/FrontArtists";
import { FrontEvents } from "./pages/FrontEvents";
import { FrontContact } from "./pages/FrontContact";
import { FrontShop } from "./pages/FrontShop";
import Dashboard from "./pages/Dashboard";
import { Artists } from "./pages/Artists";
import { ArtistDetail } from "./pages/ArtistDetail";
import { Events } from "./pages/Events";
import { Contacts } from "./pages/Contacts";
import { Preferences } from "./pages/Preferences";
import { Tasks } from "./pages/Tasks";
import { NotFound } from "./pages/NotFound";
import { RoadShow } from "./pages/RoadShow";
import { Messagerie } from "./pages/Messagerie";
import { ShowBible } from "./pages/ShowBible";
import { Contracts } from "./pages/Contracts";
import { Email } from "./pages/Email";
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
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import { FrontLayout } from "./components/FrontLayout";
import { WebsiteConfigProvider } from "./contexts/WebsiteConfigContext";
import { WebsiteMenuSyncBridge } from "./components/WebsiteMenuSyncBridge";
import { ErrorBoundary } from "react-error-boundary";

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
      fallback={
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          <h1>Application Error</h1>
          <p>Something went wrong loading the application.</p>
          <p>Please refresh the page or contact support.</p>
        </div>
      }
      onError={(error) => {
        console.error('💥 React Error Boundary caught error:', error);
      }}
    >
      <QueryClientProvider client={queryClient}>
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
                
                <Route path="/artist-showcase" element={<FrontArtistShowcase />} />
                <Route path="/auth" element={<Auth />} />
                
                {/* Routes du back-office - PROTÉGÉES */}
                <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                <Route path="/artists" element={<ProtectedRoute><Layout><Artists /></Layout></ProtectedRoute>} />
                <Route path="/artists/:id" element={<ProtectedRoute><Layout><ArtistDetail /></Layout></ProtectedRoute>} />
                <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
                <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
                <Route path="/contacts/:id" element={<ProtectedRoute><Layout><ContactDetail /></Layout></ProtectedRoute>} />
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
<Route path="/agenda" element={<ProtectedRoute><Layout><Agenda /></Layout></ProtectedRoute>} />
<Route path="/merchandise" element={<ProtectedRoute><Layout><Merchandise /></Layout></ProtectedRoute>} />
<Route path="/merchandise-backoffice" element={<ProtectedRoute><Layout><MerchandiseBackoffice /></Layout></ProtectedRoute>} />
<Route path="/website" element={<ProtectedRoute><Website /></ProtectedRoute>} />
<Route path="/website-manager" element={<ProtectedRoute><WebsiteManager /></ProtectedRoute>} />
<Route path="/website-backoffice" element={<ProtectedRoute><WebsiteBackoffice /></ProtectedRoute>} />
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
    </QueryClientProvider>
  </ErrorBoundary>
  );
};

export default App;