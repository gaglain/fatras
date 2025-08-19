import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Layout } from "./components/Layout";
import { NewSimpleFrontLayout } from "./components/NewSimpleFrontLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
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
import { Opportunities } from "./pages/Opportunities";
import { EventTypes } from "./pages/EventTypes";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { Forms } from "./pages/Forms";
import { UserManagement } from "./pages/UserManagement";
import { Agenda } from "./pages/Agenda";
import { Merchandise } from "./pages/Merchandise";
import { MerchandiseBackoffice } from "./pages/MerchandiseBackoffice";
import { Website } from "./pages/Website";
import { WebsiteManager } from "./pages/WebsiteManager";
import { Application } from "./pages/Application";
import { FrontHome } from "./pages/FrontHome";
import { FrontArtists } from "./pages/FrontArtists";
import { FrontEvents } from "./pages/FrontEvents";
import { FrontContact } from "./pages/FrontContact";
import { FrontShop } from "./pages/FrontShop";
import { FrontLegalNotices } from "./pages/FrontLegalNotices";
import { FrontPrivacyPolicy } from "./pages/FrontPrivacyPolicy";
import { FrontTermsOfService } from "./pages/FrontTermsOfService";
import { SimpleFrontHome } from "./pages/SimpleFrontHome";
import { UserProvider } from "./contexts/UserContext";
import { WebsiteConfigProvider } from "./contexts/WebsiteConfigContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { CentralizedDataProvider } from "./contexts/CentralizedDataProvider";
import { MessagingProvider } from "./contexts/MessagingContext";

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
  console.log('🚀 App starting...');
  
  try {
    console.log('🚀 App about to render providers...');
    return (
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
              <CentralizedDataProvider>
                <RealtimeProvider>
                  <MessagingProvider>
                    <WebsiteConfigProvider>
                      <Toaster />
                      <Routes>
                      {/* Route d'accueil */}
                      <Route path="/" element={<Index />} />
                      
                      {/* Routes du back-office - PROTÉGÉES */}
                      <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                      <Route path="/artists" element={<ProtectedRoute><Layout><Artists /></Layout></ProtectedRoute>} />
                      <Route path="/artists/:id" element={<ProtectedRoute><Layout><ArtistDetail /></Layout></ProtectedRoute>} />
                      <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
                      <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
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
                      <Route path="/website" element={<ProtectedRoute><Layout><Website /></Layout></ProtectedRoute>} />
                      <Route path="/website-manager" element={<ProtectedRoute><Layout><WebsiteManager /></Layout></ProtectedRoute>} />
                      <Route path="/application" element={<ProtectedRoute><Layout><Application /></Layout></ProtectedRoute>} />
                      <Route path="/preferences" element={<ProtectedRoute><Layout><Preferences /></Layout></ProtectedRoute>} />
                      
                      {/* Routes du site web public - utilisation du nouveau layout */}
                      <Route path="/front" element={<NewSimpleFrontLayout />}>
                        <Route index element={<SimpleFrontHome />} />
                      </Route>
                      <Route path="/front/artists" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontArtists />} />
                      </Route>
                      <Route path="/front/events" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontEvents />} />
                      </Route>
                      <Route path="/front/contact" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontContact />} />
                      </Route>
                      <Route path="/front/shop" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontShop />} />
                      </Route>
                      <Route path="/front/legal/notices" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontLegalNotices />} />
                      </Route>
                      <Route path="/front/legal/privacy" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontPrivacyPolicy />} />
                      </Route>
                      <Route path="/front/legal/terms" element={<NewSimpleFrontLayout />}>
                        <Route index element={<FrontTermsOfService />} />
                      </Route>
                      
                      {/* Page 404 */}
                      <Route path="*" element={<NotFound />} />
                      </Routes>
                    </WebsiteConfigProvider>
                  </MessagingProvider>
                </RealtimeProvider>
              </CentralizedDataProvider>
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
  } catch (error) {
    console.error('💥 App rendering error:', error);
    return (
      <div style={{ padding: '20px', color: 'red' }}>
        <h1>Erreur de rendu</h1>
        <p>Une erreur s'est produite: {error instanceof Error ? error.message : 'Erreur inconnue'}</p>
      </div>
    );
  }
};

export default App;