import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "./contexts/UserContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Contacts } from "./pages/Contacts";
import { Events } from "./pages/Events";
import { Tasks } from "./pages/Tasks";
import { Artists } from "./pages/Artists";
import { Email } from "./pages/Email";
import { Contracts } from "./pages/Contracts";
import { Merchandise } from "./pages/Merchandise";
import { RoadShow } from "./pages/RoadShow";
import { ShowBible } from "./pages/ShowBible";
import { Preferences } from "./pages/Preferences";
import NotFound from "./pages/NotFound";
import { Messagerie } from "./pages/Messagerie";
import { Agenda } from "./pages/Agenda";
import { Opportunities } from "./pages/Opportunities";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <UserProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/events" element={<Events />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/artists" element={<Artists />} />
              <Route path="/email" element={<Email />} />
              <Route path="/contracts" element={<Contracts />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/messagerie" element={<Messagerie />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/merchandise" element={<Merchandise />} />
              <Route path="/roadshow" element={<RoadShow />} />
              <Route path="/show-bible" element={<ShowBible />} />
              <Route path="/preferences" element={<Preferences />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
