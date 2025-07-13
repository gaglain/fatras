
import React from 'react';
import { DashboardHome } from '@/components/dashboard/DashboardHome';

const Dashboard = () => {
  console.log('📊 Dashboard - Rendering Dashboard page...');
  
  return (
    <div className="min-h-screen bg-background">
      <DashboardHome />
    </div>
  );
};

export default Dashboard;
