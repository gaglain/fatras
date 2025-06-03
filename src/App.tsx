
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

// Import existing pages
import Dashboard from '@/pages/Dashboard';
import Contacts from '@/pages/Contacts';
import Events from '@/pages/Events';
import Contracts from '@/pages/Contracts';
import Artists from '@/pages/Artists';
import ArtistDetail from '@/pages/ArtistDetail';
import Agenda from '@/pages/Agenda';
import Email from '@/pages/Email';
import EmailCampaigns from '@/pages/EmailCampaigns';
import Messagerie from '@/pages/Messagerie';
import Tasks from '@/pages/Tasks';
import Opportunities from '@/pages/Opportunities';
import Merchandise from '@/pages/Merchandise';
import RoadShow from '@/pages/RoadShow';
import ShowBible from '@/pages/ShowBible';
import EventTypes from '@/pages/EventTypes';
import Preferences from '@/pages/Preferences';
import Website from '@/pages/Website';
import WebsiteWithEditor from '@/pages/WebsiteWithEditor';

const queryClient = new QueryClient();

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={setCurrentPage} />;
      case 'contacts':
        return <Contacts />;
      case 'events':
        return <Events />;
      case 'contracts':
        return <Contracts />;
      case 'artists':
        return <Artists />;
      case 'artist-detail':
        return <ArtistDetail />;
      case 'agenda':
        return <Agenda />;
      case 'email':
        return <Email />;
      case 'email-campaigns':
        return <EmailCampaigns />;
      case 'messagerie':
        return <Messagerie />;
      case 'tasks':
        return <Tasks />;
      case 'opportunities':
        return <Opportunities />;
      case 'merchandise':
        return <Merchandise />;
      case 'roadshow':
        return <RoadShow />;
      case 'showbible':
        return <ShowBible />;
      case 'event-types':
        return <EventTypes />;
      case 'preferences':
        return <Preferences />;
      case 'website':
        return <Website />;
      case 'website-editor':
        return <WebsiteWithEditor />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ProtectedRoute>
        <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
          {renderPage()}
        </Layout>
      </ProtectedRoute>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
