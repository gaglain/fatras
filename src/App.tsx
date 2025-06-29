
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Artists } from "./pages/Artists";
import { Events } from "./pages/Events";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { AppDataProvider } from "./contexts/AppDataContext";
import { CentralizedDataProvider } from "./contexts/CentralizedDataContext";
import { UserProvider } from "./contexts/UserContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <BrowserRouter>
            <RealtimeProvider>
              <UserProvider>
                <MessagingProvider>
                  <AppDataProvider>
                    <CentralizedDataProvider>
                      <div className="min-h-screen bg-background font-sans antialiased">
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route 
                            path="/dashboard" 
                            element={
                              <ProtectedRoute>
                                <Dashboard />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/artists" 
                            element={
                              <ProtectedRoute>
                                <Artists />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/events" 
                            element={
                              <ProtectedRoute>
                                <Events />
                              </ProtectedRoute>
                            } 
                          />
                          <Route 
                            path="/publication-calendar" 
                            element={
                              <ProtectedRoute>
                                <PublicationCalendar />
                              </ProtectedRoute>
                            } 
                          />
                        </Routes>
                      </div>
                      <Toaster />
                    </CentralizedDataProvider>
                  </AppDataProvider>
                </MessagingProvider>
              </UserProvider>
            </RealtimeProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
