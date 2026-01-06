import React from 'react';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { TeamEmailDashboard } from '@/components/dashboard/TeamEmailDashboard';
import { logger } from '@/lib/logger';

const Dashboard = () => {
  logger.log('📊 Dashboard - Rendering');
  
  return (
    <div className="min-h-screen bg-background space-y-2 sm:space-y-4 lg:space-y-6">
      <DashboardHome />
      
      <div className="mt-6">
        <TeamEmailDashboard />
      </div>
    </div>
  );
};

export default Dashboard;
