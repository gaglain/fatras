
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
                            <Route path="/events" element={<Events />} />
                            <Route path="/publication-calendar" element={<PublicationCalendar />} />
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
