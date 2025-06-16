
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProvider } from '@/contexts/UserContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { Toaster } from '@/components/ui/toaster';
import { Layout } from '@/components/Layout';
import { WebsitePageEditor } from '@/pages/WebsitePageEditor';
import { Admin } from '@/pages/Admin';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <UserProvider>
          <MessagingProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route path="admin" element={<Admin />} />
                  <Route path="admin/editor/:pageId" element={<WebsitePageEditor />} />
                  <Route path="dashboard" element={<div>Dashboard</div>} />
                  <Route path="artists" element={<div>Artistes</div>} />
                  <Route path="events" element={<div>Événements</div>} />
                  <Route path="contacts" element={<div>Contacts</div>} />
                  <Route path="messagerie" element={<div>Messagerie</div>} />
                  <Route path="preferences" element={<div>Préférences</div>} />
                  <Route path="application" element={<div>Application</div>} />
                  <Route path="publication-calendar" element={<div>Calendrier de publication</div>} />
                  <Route path="tasks" element={<div>Tâches</div>} />
                  <Route path="*" element={<div>Page non trouvée</div>} />
                </Route>
              </Routes>
            </BrowserRouter>
            <Toaster />
          </MessagingProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
