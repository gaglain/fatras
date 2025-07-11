
import React from 'react';
import { DashboardHome } from './DashboardHome';
import { useWebsiteRealTimeSync } from '@/hooks/useWebsiteRealTimeSync';

export const BookingDashboard: React.FC = () => {
  console.log('📊 BookingDashboard - Initializing dashboard');
  
  // Initialize real-time sync with optimized performance
  const { forceSync } = useWebsiteRealTimeSync();
  
  return <DashboardHome />;
};
