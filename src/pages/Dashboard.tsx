
import React from 'react';
import { DashboardStatsCards } from '@/components/dashboard/DashboardStatsCards';
import { RecentActivityCard } from '@/components/dashboard/RecentActivityCard';
import { UpcomingEventsCard } from '@/components/dashboard/UpcomingEventsCard';
import { PendingTasksCard } from '@/components/dashboard/PendingTasksCard';
import { TopArtistsCard } from '@/components/dashboard/TopArtistsCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';

export const Dashboard: React.FC = () => {
  console.log('🎯 Dashboard - Component rendering');
  
  return (
    <div className="space-y-6 min-h-screen p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)'
    }}>
      <div>
        <h1 className="text-3xl font-bold" style={{
          color: 'var(--custom-text, #18181b)'
        }}>
          Tableau de Bord
        </h1>
        <p className="mt-2" style={{
          color: 'var(--custom-text, #666666)'
        }}>
          Bienvenue ! Voici un résumé de vos activités en temps réel.
        </p>
      </div>

      {/* Stats Grid with real data */}
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
