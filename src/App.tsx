import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Simple test component
const SimpleIndex = () => {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333', marginBottom: '20px' }}>
        🎵 Fatras Cooking - Test Mode
      </h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Application en cours de diagnostic...
      </p>
      <div style={{ 
        background: '#f0f9ff', 
        border: '2px solid #0284c7', 
        borderRadius: '8px', 
        padding: '20px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h2 style={{ color: '#0284c7', margin: '0 0 15px 0' }}>
          Mode Test Activé
        </h2>
        <p style={{ margin: 0, lineHeight: '1.5' }}>
          Cette version simplifiée permet de vérifier que l'application se charge correctement.
          Si vous voyez ce message, la base de l'application fonctionne.
        </p>
      </div>
      <div style={{ marginTop: '30px' }}>
        <button 
          style={{
            background: '#0284c7',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
          onClick={() => window.location.href = '#test'}
        >
          Test Navigation
        </button>
        <button 
          style={{
            background: '#dc2626',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
          onClick={() => console.log('Test Console Log')}
        >
          Test Console
        </button>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div style={{ padding: '40px', textAlign: 'center' }}>
    <h1>404 - Page non trouvée</h1>
    <p>La page demandée n'existe pas.</p>
  </div>
);

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
  console.log('🚀 App starting in test mode...');
  
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
              <Route path="/" element={<SimpleIndex />} />
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