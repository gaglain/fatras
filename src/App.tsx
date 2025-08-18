import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Import des pages principales
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import { NotFound } from "./pages/NotFound";

// Import des composants d'authentification et layout
import { useAuth } from "@/hooks/useAuth";
import { UserProvider } from "@/contexts/UserContext";
import { Layout } from "@/components/Layout";
import { RealtimeProvider } from "@/contexts/RealtimeContext";
import { CentralizedDataProvider } from "@/contexts/CentralizedDataProvider";

// Composant de protection des routes
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Chargement...
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/" replace />;
  }
  
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
  console.log('🚀 Fatras Cooking App starting...');
  
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
              <RealtimeProvider>
                <CentralizedDataProvider>
                  <Routes>
                    {/* Page d'accueil */}
                    <Route path="/" element={<Index />} />
                    
                    {/* Dashboard avec layout protégé */}
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
                    
                    {/* Page 404 */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <Toaster />
                </CentralizedDataProvider>
              </RealtimeProvider>
            </UserProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;