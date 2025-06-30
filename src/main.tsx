
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from '@/components/ui/sonner';
import { UserProvider } from '@/contexts/UserContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { AppDataProvider } from '@/contexts/AppDataContext';
import { RealtimeProvider } from '@/contexts/RealtimeContext';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <UserProvider>
            <MessagingProvider>
              <AppDataProvider>
                <RealtimeProvider>
                  <App />
                  <Toaster />
                </RealtimeProvider>
              </AppDataProvider>
            </MessagingProvider>
          </UserProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>
);
