
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "next-themes";

import Index from "./pages/Index";
import { NotFound } from "./pages/NotFound";
import { Dashboard } from "./pages/Dashboard";
import { FrontShop } from "./pages/FrontShop";
import { Merchandise } from "./pages/Merchandise";
import { FrontArtists } from "./pages/FrontArtists";
import { FrontLegalNotices } from "./pages/FrontLegalNotices";
import { FrontPrivacyPolicy } from "./pages/FrontPrivacyPolicy";
import { FrontTermsOfService } from "./pages/FrontTermsOfService";
import { WebsiteWithEditor } from "./pages/WebsiteWithEditor";
import { Preferences } from "./pages/Preferences";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";

import { SimpleFrontLayout } from "./components/SimpleFrontLayout";
import { SimpleFrontHome } from "./pages/SimpleFrontHome";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Simple placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="min-h-screen flex items-center justify-center">
    <h1 className="text-2xl font-bold">{title} - Coming Soon</h1>
  </div>
);

const App = () => {
  console.log('🚀 App - Starting application...');
  
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <UserProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<PlaceholderPage title="Login" />} />
                  <Route path="/register" element={<PlaceholderPage title="Register" />} />
                  <Route path="/forgot-password" element={<PlaceholderPage title="Forgot Password" />} />
                  <Route path="/reset-password" element={<PlaceholderPage title="Reset Password" />} />
                  <Route path="/pricing" element={<PlaceholderPage title="Pricing" />} />
                  <Route path="/terms" element={<PlaceholderPage title="Terms" />} />
                  <Route path="/privacy" element={<PlaceholderPage title="Privacy" />} />
                  <Route path="/contact" element={<PlaceholderPage title="Contact" />} />
                  <Route path="/blog" element={<PlaceholderPage title="Blog" />} />
                  <Route path="/blog/:slug" element={<PlaceholderPage title="Blog Post" />} />
                  <Route path="/careers" element={<PlaceholderPage title="Careers" />} />
                  <Route path="/careers/:slug" element={<PlaceholderPage title="Career" />} />
                  <Route path="/press" element={<PlaceholderPage title="Press" />} />
                  <Route path="/press/:slug" element={<PlaceholderPage title="Press Release" />} />
                  
                  {/* Front Website Routes - Using simplified components */}
                  <Route path="/front" element={<SimpleFrontLayout />}>
                    <Route index element={<SimpleFrontHome />} />
                    <Route path="artists" element={<FrontArtists />} />
                    <Route path="events" element={<PlaceholderPage title="Events" />} />
                    <Route path="shop" element={<FrontShop />} />
                    <Route path="contact" element={<PlaceholderPage title="Contact" />} />
                    <Route path="mentions-legales" element={<FrontLegalNotices />} />
                    <Route path="cgv" element={<FrontTermsOfService />} />
                    <Route path="politique-confidentialite" element={<FrontPrivacyPolicy />} />
                  </Route>

                  {/* Protected Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
                  <Route path="/artists" element={<ProtectedRoute><Layout><PlaceholderPage title="Artists" /></Layout></ProtectedRoute>} />
                  <Route path="/artist/:id" element={<ProtectedRoute><Layout><PlaceholderPage title="Artist Detail" /></Layout></ProtectedRoute>} />
                  <Route path="/events" element={<ProtectedRoute><Layout><PlaceholderPage title="Events" /></Layout></ProtectedRoute>} />
                  <Route path="/contacts" element={<ProtectedRoute><Layout><PlaceholderPage title="Contacts" /></Layout></ProtectedRoute>} />
                  <Route path="/contact-lists" element={<ProtectedRoute><Layout><PlaceholderPage title="Contact Lists" /></Layout></ProtectedRoute>} />
                  <Route path="/contracts" element={<ProtectedRoute><Layout><PlaceholderPage title="Contracts" /></Layout></ProtectedRoute>} />
                  <Route path="/email" element={<ProtectedRoute><Layout><PlaceholderPage title="Email" /></Layout></ProtectedRoute>} />
                  <Route path="/email-campaigns" element={<ProtectedRoute><Layout><PlaceholderPage title="Email Campaigns" /></Layout></ProtectedRoute>} />
                  <Route path="/messagerie" element={<ProtectedRoute><Layout><PlaceholderPage title="Messages" /></Layout></ProtectedRoute>} />
                  <Route path="/agenda" element={<ProtectedRoute><Layout><PlaceholderPage title="Agenda" /></Layout></ProtectedRoute>} />
                  <Route path="/roadshow" element={<ProtectedRoute><Layout><PlaceholderPage title="Road Show" /></Layout></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Layout><PlaceholderPage title="Tasks" /></Layout></ProtectedRoute>} />
                  <Route path="/opportunities" element={<ProtectedRoute><Layout><PlaceholderPage title="Opportunities" /></Layout></ProtectedRoute>} />
                  <Route path="/show-bible" element={<ProtectedRoute><Layout><PlaceholderPage title="Show Bible" /></Layout></ProtectedRoute>} />
                  <Route path="/publication-calendar" element={<ProtectedRoute><Layout><PlaceholderPage title="Publication Calendar" /></Layout></ProtectedRoute>} />
                  <Route path="/merchandise" element={<ProtectedRoute><Layout><Merchandise /></Layout></ProtectedRoute>} />
                  <Route path="/merchandise-backoffice" element={<ProtectedRoute><Layout><PlaceholderPage title="Merchandise Backoffice" /></Layout></ProtectedRoute>} />
                  <Route path="/website" element={<ProtectedRoute><Layout><PlaceholderPage title="Website" /></Layout></ProtectedRoute>} />
                  <Route path="/website-backoffice" element={<ProtectedRoute><Layout><PlaceholderPage title="Website Backoffice" /></Layout></ProtectedRoute>} />
                  <Route path="/website-page-editor" element={<ProtectedRoute><Layout><PlaceholderPage title="Website Page Editor" /></Layout></ProtectedRoute>} />
                  <Route path="/website-with-editor" element={<ProtectedRoute><Layout><WebsiteWithEditor /></Layout></ProtectedRoute>} />
                  <Route path="/event-types" element={<ProtectedRoute><Layout><PlaceholderPage title="Event Types" /></Layout></ProtectedRoute>} />
                  <Route path="/forms" element={<ProtectedRoute><Layout><PlaceholderPage title="Forms" /></Layout></ProtectedRoute>} />
                  <Route path="/preferences" element={<ProtectedRoute><Layout><Preferences /></Layout></ProtectedRoute>} />
                  <Route path="/user-management" element={<ProtectedRoute><Layout><PlaceholderPage title="User Management" /></Layout></ProtectedRoute>} />
                  <Route path="/application" element={<ProtectedRoute><Layout><PlaceholderPage title="Application" /></Layout></ProtectedRoute>} />

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </UserProvider>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;
