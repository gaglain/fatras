import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Leaf, Route, Euro } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DashboardKPIsProps {
  selectedArtist: string;
}

export const DashboardKPIs: React.FC<DashboardKPIsProps> = ({ selectedArtist }) => {
  const { user } = useAuth();

  const { data: kpis } = useQuery({
    queryKey: ['dashboard-kpis', selectedArtist, user?.id],
    queryFn: async () => {
      // 1. Roadshow stops with distance
      const { data: stops } = await supabase
        .from('roadshow_stops')
        .select('distance_km, vehicle_type, status, event_date');

      // 2. Vehicle rates for CO2
      const { data: rates } = await supabase
        .from('vehicle_rates')
        .select('vehicle_name, co2_per_km');

      const rateMap = new Map(
        (rates || []).map(r => [r.vehicle_name, r.co2_per_km || 0.21])
      );

      const confirmedStops = (stops || []).filter(s => s.status === 'confirmed');

      const totalDistance = confirmedStops.reduce((sum, s) => sum + (s.distance_km || 0), 0);

      const totalCO2 = confirmedStops.reduce((sum, s) => {
        const km = s.distance_km || 0;
        const co2PerKm = (s.vehicle_type && rateMap.has(s.vehicle_type))
          ? rateMap.get(s.vehicle_type)!
          : 0.21;
        return sum + km * co2PerKm;
      }, 0);

      const totalDates = confirmedStops.length;

      // 3. Revenue from accepted quotes
      let quotesQuery = supabase
        .from('quotes')
        .select('total_amount, events!inner(artist_id)')
        .eq('status', 'accepted');

      if (selectedArtist !== 'all') {
        quotesQuery = quotesQuery.eq('events.artist_id', selectedArtist);
      }

      const { data: quotes } = await quotesQuery;
      const totalRevenue = (quotes || []).reduce(
        (sum, q) => sum + (Number(q.total_amount) || 0), 0
      );

      return { totalDistance, totalCO2, totalDates, totalRevenue };
    },
    enabled: !!user?.id,
  });

  const stats = [
    {
      title: 'Dates confirmées',
      value: kpis?.totalDates?.toString() || '0',
      icon: MapPin,
      description: 'Étapes de tournée',
      color: 'text-blue-600',
    },
    {
      title: 'Revenus',
      value: `€${(kpis?.totalRevenue || 0).toLocaleString('fr-FR')}`,
      icon: Euro,
      description: 'Devis acceptés',
      color: 'text-emerald-600',
    },
    {
      title: 'Distance totale',
      value: `${Math.round(kpis?.totalDistance || 0).toLocaleString('fr-FR')} km`,
      icon: Route,
      description: 'Étapes confirmées',
      color: 'text-orange-600',
    },
    {
      title: 'Empreinte carbone',
      value: (kpis?.totalCO2 || 0) >= 1000
        ? `${(kpis!.totalCO2 / 1000).toFixed(1)} t`
        : `${Math.round(kpis?.totalCO2 || 0)} kg`,
      icon: Leaf,
      description: 'CO₂ estimé',
      color: 'text-green-600',
    },
  ];

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card
          key={stat.title}
          className="hover:shadow-elegant transition-all duration-300 border-border bg-card animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-bold text-card-foreground">
              {stat.value}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              {stat.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
