import React, { useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { DashboardKPIs } from './DashboardKPIs';
import { OpportunityStatsCard } from './OpportunityStatsCard';
import { DashboardQuickActions } from './DashboardQuickActions';
import { DashboardRecentActivity } from './DashboardRecentActivity';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DashboardHome: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<string>('all');

  const { data: artists = [] } = useQuery({
    queryKey: ['dashboard-artists-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 min-h-screen" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)'
    }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold truncate" style={{ color: 'var(--custom-text, #18181b)' }}>
            Tableau de Bord
          </h1>
          <p className="mt-1 text-sm lg:text-base" style={{ color: 'var(--custom-text, #666666)' }}>
            Bienvenue sur votre plateforme de booking d'artistes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={selectedArtist} onValueChange={setSelectedArtist}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par artiste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les artistes</SelectItem>
              {artists.map(artist => (
                <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link to="/events" className="w-full sm:w-auto">
            <Button className="back-office-button w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvel Événement</span>
              <span className="sm:hidden">Événement</span>
            </Button>
          </Link>
        </div>
      </div>

      <DashboardStats selectedArtist={selectedArtist} />
      <DashboardKPIs selectedArtist={selectedArtist} />
      <DashboardCharts selectedArtist={selectedArtist} />
      <OpportunityStatsCard />
      <DashboardQuickActions />
      <DashboardRecentActivity />
    </div>
  );
};
