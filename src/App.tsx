
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import { Dashboard } from "./pages/Dashboard";
import { Artists } from "./pages/Artists";
import { Events } from "./pages/Events";
import { PublicationCalendar } from "./pages/PublicationCalendar";
import { Layout } from "./components/Layout";
import { AppDataProvider } from "./contexts/AppDataContext";
import { CentralizedDataProvider } from "./contexts/CentralizedDataContext";
import { UserProvider } from "./contexts/UserContext";
import { RealtimeProvider } from "./contexts/RealtimeContext";
import { MessagingProvider } from "./contexts/MessagingContext";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  console.log('🚀 App - Rendering...');
  
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
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route element={<Layout />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/artists" element={<Artists />} />
                          <Route path="/events" element={<Events />} />
                          <Route path="/publication-calendar" element={<PublicationCalendar />} />
                        </Route>
                      </Routes>
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
