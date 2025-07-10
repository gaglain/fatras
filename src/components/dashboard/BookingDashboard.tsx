
import React from 'react';
import { DashboardHome } from './DashboardHome';
import { useWebsiteRealTimeSync } from '@/hooks/useWebsiteRealTimeSync';

export const BookingDashboard: React.FC = () => {
  console.log('📊 BookingDashboard - Initializing dashboard with real-time sync');
  
  // Initialiser la synchronisation temps réel
  useWebsiteRealTimeSync();
  
  return <DashboardHome />;
};
