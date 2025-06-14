
import React from 'react';
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { PendingTasksCard } from '@/components/dashboard/PendingTasksCard';
import { TopArtistsCard } from '@/components/dashboard/TopArtistsCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">Bienvenue ! Voici un résumé de vos activités.</p>
      </div>

      {/* Stats Grid with hover animations */}
      <DashboardStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <RecentActivityCard />

        {/* Upcoming Events */}
        <UpcomingEventsCard />

        {/* Pending Tasks */}
        <PendingTasksCard />
      </div>

      {/* Top Artists Performance */}
      <TopArtistsCard />

      {/* Quick Actions with clickable buttons */}
      <QuickActionsCard />
    </div>
  );
};
