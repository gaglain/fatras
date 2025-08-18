import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

// Version de test simple pour diagnostiquer
const TestIndex = () => {
  console.log('✅ TestIndex component rendering...');
  
  return (
    <div style={{ 
      padding: '40px', 
      backgroundColor: '#ffffff',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        color: '#333', 
        marginBottom: '20px',
        fontSize: '32px'
      }}>
        🎵 Fatras Cooking - Mode Diagnostic
      </h1>
      <p style={{ 
        color: '#666', 
        fontSize: '18px',
        marginBottom: '30px'
      }}>
        Application en cours de diagnostic. Si vous voyez ce message, la base fonctionne.
      </p>
      
      <div style={{ 
        background: '#f0f9ff', 
        border: '2px solid #0284c7', 
        borderRadius: '8px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h3>État du diagnostic :</h3>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>✅ React fonctionne</li>
          <li>✅ Routing fonctionne</li>
          <li>✅ Styles inline fonctionnent</li>
        </ul>
      </div>

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
        onClick={() => {
          console.log('🔄 Test button clicked');
          alert('Test réussi ! L\'application répond.');
        }}
      >
        Tester l'interactivité
      </button>
    </div>
  );
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
  console.log('🚀 App diagnostic mode starting...');
  
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
              <Route path="/" element={<TestIndex />} />
              <Route path="*" element={<TestIndex />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;