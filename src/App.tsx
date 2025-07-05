
import React from "react";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { HelmetProvider } from 'react-helmet-async';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { UserProvider } from "@/contexts/UserContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { AppDataProvider } from "@/contexts/AppDataContext";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CentralizedDataProvider } from "@/contexts/CentralizedDataContext";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Artists } from "./pages/Artists";
import { Events } from "./pages/Events";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { Contacts } from "./pages/Contacts";
import { ContactLists } from "./pages/ContactLists";
import { EventTypes } from "./pages/EventTypes";
import { Agenda } from "./pages/Agenda";
import { Opportunities } from "./pages/Opportunities";
import { Contracts } from "./pages/Contracts";
import { Tasks } from "./pages/Tasks";
import { RoadShow } from "./pages/RoadShow";
import { Email } from "./pages/Email";
import { EmailCampaigns } from "./pages/EmailCampaigns";
import { Messagerie } from "./pages/Messagerie";
import { Forms } from "./pages/Forms";
import { ShowBible } from "./pages/ShowBible";
import { Merchandise } from "./pages/Merchandise";
import { Website } from "./pages/Website";
import { WebsiteBackoffice } from "./pages/WebsiteBackoffice";
import { UserManagement } from "./pages/UserManagement";
import { Application } from "./pages/Application";
import { Preferences } from "./pages/Preferences";
import { Layout } from "./components/Layout";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  console.log('🚀 App - Rendering App component...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <TooltipProvider>
            <UserProvider>
              <MessagingProvider>
                <AppDataProvider>
                  <RealtimeProvider>
                    <CentralizedDataProvider>
                      <div className="min-h-screen bg-white">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route element={<Layout />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/artists" element={<Artists />} />
                            <Route path="/contacts" element={<Contacts />} />
                            <Route path="/contact-lists" element={<ContactLists />} />
                            <Route path="/events" element={<Events />} />
                            <Route path="/event-types" element={<EventTypes />} />
                            <Route path="/agenda" element={<Agenda />} />
                            <Route path="/opportunities" element={<Opportunities />} />
                            <Route path="/contracts" element={<Contracts />} />
                            <Route path="/tasks" element={<Tasks />} />
                            <Route path="/roadshow" element={<RoadShow />} />
                            <Route path="/road-show" element={<RoadShow />} />
                            <Route path="/email" element={<Email />} />
                            <Route path="/email-campaigns" element={<EmailCampaigns />} />
                            <Route path="/messagerie" element={<Messagerie />} />
                            <Route path="/forms" element={<Forms />} />
                            <Route path="/publication-calendar" element={<PublicationCalendar />} />
                            <Route path="/show-bible" element={<ShowBible />} />
                            <Route path="/merchandise" element={<Merchandise />} />
                            <Route path="/website" element={<Website />} />
                            <Route path="/website-editor" element={<WebsiteBackoffice />} />
                            <Route path="/user-management" element={<UserManagement />} />
                            <Route path="/application" element={<Application />} />
                            <Route path="/preferences" element={<Preferences />} />
                          </Route>
                        </Routes>
                      </div>
                      <Toaster />
                    </CentralizedDataProvider>
                  </RealtimeProvider>
                </AppDataProvider>
              </MessagingProvider>
            </UserProvider>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
