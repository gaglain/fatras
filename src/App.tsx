import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Import pages et composants
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";
import { Events } from "./pages/Events";
import { Contacts } from "./pages/Contacts";
import { Artists } from "./pages/Artists";
import { Agenda } from "./pages/Agenda";
import { Tasks } from "./pages/Tasks";
import { Email } from "./pages/Email";
import { EmailCampaigns } from "./pages/EmailCampaigns";
import { Merchandise } from "./pages/Merchandise";
import { ShowBible } from "./pages/ShowBible";
import { Contracts } from "./pages/Contracts";
import { UserManagement } from "./pages/UserManagement";
import { Preferences } from "./pages/Preferences";
// Pages manquantes
import { ContactLists } from "./pages/ContactLists";
import { EventTypes } from "./pages/EventTypes";
import { Opportunities } from "./pages/Opportunities";
import { RoadShow } from "./pages/RoadShow";
import { Messagerie } from "./pages/Messagerie";
import { Forms } from "./pages/Forms";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { Website } from "./pages/Website";
import { Application } from "./pages/Application";
import { Layout } from "@/components/Layout";

// Composant de protection des routes simple sans contextes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// Create a stable query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

const App = () => {
  console.log('🚀 Fatras Cooking App - Phase 1');
  
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
            <Routes>
                {/* Page d'accueil */}
                <Route path="/" element={<Index />} />
                
                {/* Pages avec Layout */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Contacts & Relations */}
                <Route 
                  path="/contacts" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Contacts />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Artistes */}
                <Route 
                  path="/artists" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Artists />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Événements & Agenda */}
                <Route 
                  path="/events" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Events />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/agenda" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Agenda />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Booking */}
                <Route 
                  path="/contracts" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Contracts />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/tasks" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Tasks />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Communication */}
                <Route 
                  path="/email" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Email />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/email-campaigns" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EmailCampaigns />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Ressources */}
                <Route 
                  path="/show-bible" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ShowBible />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Boutique */}
                <Route 
                  path="/merchandise" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Merchandise />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Administration */}
                <Route 
                  path="/user-management" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/preferences" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Preferences />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Pages manquantes */}
                <Route 
                  path="/contact-lists" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ContactLists />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/event-types" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <EventTypes />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/opportunities" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Opportunities />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/roadshow" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <RoadShow />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/messagerie" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Messagerie />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/forms" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Forms />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/publication-calendar" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PublicationCalendar />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/website" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Website />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/application" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Application />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Page 404 */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;