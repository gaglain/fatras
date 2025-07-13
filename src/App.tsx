import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import { ThemeProvider } from "next-themes";

import Index from "./pages/index";
import NotFound from "./pages/404";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import Pricing from "./pages/pricing";
import Terms from "./pages/terms";
import Privacy from "./pages/privacy";
import Contact from "./pages/contact";
import Blog from "./pages/blog";
import BlogPost from "./pages/blog/[slug]";
import Careers from "./pages/careers";
import Career from "./pages/careers/[slug]";
import Press from "./pages/press";
import PressRelease from "./pages/press/[slug]";

import Dashboard from "./pages/dashboard";
import Artists from "./pages/artists";
import ArtistDetail from "./pages/artist/[id]";
import Events from "./pages/events";
import Contacts from "./pages/contacts";
import ContactLists from "./pages/contact-lists";
import Contracts from "./pages/contracts";
import Email from "./pages/email";
import EmailCampaigns from "./pages/email-campaigns";
import Messagerie from "./pages/messagerie";
import Agenda from "./pages/agenda";
import RoadShow from "./pages/roadshow";
import Tasks from "./pages/tasks";
import Opportunities from "./pages/opportunities";
import ShowBible from "./pages/show-bible";
import PublicationCalendar from "./pages/publication-calendar";
import Merchandise from "./pages/merchandise";
import MerchandiseBackoffice from "./pages/merchandise-backoffice";
import Website from "./pages/website";
import WebsiteBackoffice from "./pages/website-backoffice";
import WebsitePageEditor from "./pages/website-page-editor";
import WebsiteWithEditor from "./pages/website-with-editor";
import EventTypes from "./pages/event-types";
import Forms from "./pages/forms";
import Preferences from "./pages/preferences";
import UserManagement from "./pages/user-management";
import Application from "./pages/application";

import FrontArtists from "./pages/front/artists";
import FrontEvents from "./pages/front/events";
import FrontShop from "./pages/front/shop";
import FrontContact from "./pages/front/contact";
import FrontLegalNotices from "./pages/front/mentions-legales";
import FrontTermsOfService from "./pages/front/cgv";
import FrontPrivacyPolicy from "./pages/front/politique-confidentialite";

import Layout from "./components/layout";
import ProtectedRoute from "./components/protected-route";

import { SimpleFrontLayout } from "./components/SimpleFrontLayout";
import { SimpleFrontHome } from "./pages/SimpleFrontHome";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/careers" element={<Careers />} />
              <Route path="/careers/:slug" element={<Career />} />
              <Route path="/press" element={<Press />} />
              <Route path="/press/:slug" element={<PressRelease />} />
              
              {/* Front Website Routes - Using simplified components */}
              <Route path="/front" element={<SimpleFrontLayout />}>
                <Route index element={<SimpleFrontHome />} />
                <Route path="artists" element={<FrontArtists />} />
                <Route path="events" element={<FrontEvents />} />
                <Route path="shop" element={<FrontShop />} />
                <Route path="contact" element={<FrontContact />} />
                <Route path="mentions-legales" element={<FrontLegalNotices />} />
                <Route path="cgv" element={<FrontTermsOfService />} />
                <Route path="politique-confidentialite" element={<FrontPrivacyPolicy />} />
              </Route>

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
              <Route path="/artists" element={<ProtectedRoute><Layout><Artists /></Layout></ProtectedRoute>} />
              <Route path="/artist/:id" element={<ProtectedRoute><Layout><ArtistDetail /></Layout></ProtectedRoute>} />
              <Route path="/events" element={<ProtectedRoute><Layout><Events /></Layout></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Layout><Contacts /></Layout></ProtectedRoute>} />
              <Route path="/contact-lists" element={<ProtectedRoute><Layout><ContactLists /></Layout></ProtectedRoute>} />
              <Route path="/contracts" element={<ProtectedRoute><Layout><Contracts /></Layout></ProtectedRoute>} />
              <Route path="/email" element={<ProtectedRoute><Layout><Email /></Layout></ProtectedRoute>} />
              <Route path="/email-campaigns" element={<ProtectedRoute><Layout><EmailCampaigns /></Layout></ProtectedRoute>} />
              <Route path="/messagerie" element={<ProtectedRoute><Layout><Messagerie /></Layout></ProtectedRoute>} />
              <Route path="/agenda" element={<ProtectedRoute><Layout><Agenda /></Layout></ProtectedRoute>} />
              <Route path="/roadshow" element={<ProtectedRoute><Layout><RoadShow /></Layout></ProtectedRoute>} />
              <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
              <Route path="/opportunities" element={<ProtectedRoute><Layout><Opportunities /></Layout></ProtectedRoute>} />
              <Route path="/show-bible" element={<ProtectedRoute><Layout><ShowBible /></Layout></ProtectedRoute>} />
              <Route path="/publication-calendar" element={<ProtectedRoute><Layout><PublicationCalendar /></Layout></ProtectedRoute>} />
              <Route path="/merchandise" element={<ProtectedRoute><Layout><Merchandise /></Layout></ProtectedRoute>} />
              <Route path="/merchandise-backoffice" element={<ProtectedRoute><Layout><MerchandiseBackoffice /></Layout></ProtectedRoute>} />
              <Route path="/website" element={<ProtectedRoute><Layout><Website /></Layout></ProtectedRoute>} />
              <Route path="/website-backoffice" element={<ProtectedRoute><Layout><WebsiteBackoffice /></Layout></ProtectedRoute>} />
              <Route path="/website-page-editor" element={<ProtectedRoute><Layout><WebsitePageEditor /></Layout></ProtectedRoute>} />
              <Route path="/website-with-editor" element={<ProtectedRoute><Layout><WebsiteWithEditor /></Layout></ProtectedRoute>} />
              <Route path="/event-types" element={<ProtectedRoute><Layout><EventTypes /></Layout></ProtectedRoute>} />
              <Route path="/forms" element={<ProtectedRoute><Layout><Forms /></Layout></ProtectedRoute>} />
              <Route path="/preferences" element={<ProtectedRoute><Layout><Preferences /></Layout></ProtectedRoute>} />
              <Route path="/user-management" element={<ProtectedRoute><Layout><UserManagement /></Layout></ProtectedRoute>} />
              <Route path="/application" element={<ProtectedRoute><Layout><Application /></Layout></ProtectedRoute>} />

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
