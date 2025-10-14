
import React from 'react';
import { DashboardHome } from '@/components/dashboard/DashboardHome';
import { DebugTest } from '@/components/DebugTest';
import { NotificationTester } from '@/components/debug/NotificationTester';

const Dashboard = () => {
  console.log('📊 Dashboard - Rendering Dashboard page...');
  
  return (
    <div className="min-h-screen bg-background space-y-2 sm:space-y-4 lg:space-y-6">
      <DashboardHome />
      {/* Zone de test désactivée pour stabilité */}
      {/*
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">🔧 Zone de test (temporaire)</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <DebugTest />
          <NotificationTester />
        </div>
      </div>
      */}
    </div>
  );
};

export default Dashboard;
