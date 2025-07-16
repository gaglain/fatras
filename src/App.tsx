import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { NewSimpleFrontLayout } from "./components/NewSimpleFrontLayout";
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
import { WebsiteManager } from "./pages/WebsiteManager";
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
import { CentralizedDataProvider } from "./contexts/CentralizedDataContext";
import { MessagingProvider } from "./contexts/MessagingContext";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
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
                      
                      {/* Routes du back-office */}
                      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
                      <Route path="/artists" element={<Layout><Artists /></Layout>} />
                      <Route path="/artists/:id" element={<Layout><ArtistDetail /></Layout>} />
                      <Route path="/events" element={<Layout><Events /></Layout>} />
                      <Route path="/contacts" element={<Layout><Contacts /></Layout>} />
                      <Route path="/tasks" element={<Layout><Tasks /></Layout>} />
                      <Route path="/roadshow" element={<Layout><RoadShow /></Layout>} />
                      <Route path="/messagerie" element={<Layout><Messagerie /></Layout>} />
                      <Route path="/show-bible" element={<Layout><ShowBible /></Layout>} />
                      <Route path="/contracts" element={<Layout><Contracts /></Layout>} />
                      <Route path="/email" element={<Layout><Email /></Layout>} />
                      <Route path="/email-campaigns" element={<Layout><EmailCampaigns /></Layout>} />
                      <Route path="/contact-lists" element={<Layout><ContactLists /></Layout>} />
                      <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
                      <Route path="/event-types" element={<Layout><EventTypes /></Layout>} />
                      <Route path="/publication-calendar" element={<Layout><PublicationCalendar /></Layout>} />
                      <Route path="/forms" element={<Layout><Forms /></Layout>} />
                      <Route path="/user-management" element={<Layout><UserManagement /></Layout>} />
                      <Route path="/agenda" element={<Layout><Agenda /></Layout>} />
                      <Route path="/merchandise" element={<Layout><Merchandise /></Layout>} />
                      <Route path="/merchandise-backoffice" element={<Layout><MerchandiseBackoffice /></Layout>} />
                      <Route path="/website" element={<Layout><WebsiteManager /></Layout>} />
                      <Route path="/preferences" element={<Layout><Preferences /></Layout>} />
                      
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
    </QueryClientProvider>
  );
};

export default App;
