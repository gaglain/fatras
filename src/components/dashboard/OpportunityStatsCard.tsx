import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, DollarSign, Target, Percent } from 'lucide-react';
import { useOpportunityStats } from '@/hooks/useOpportunityStats';

export const OpportunityStatsCard: React.FC = () => {
  const { stats, loading } = useOpportunityStats();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Opportunités
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Opportunités
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalOpportunities}</div>
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Probabilité moy.</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(stats.averageProbability)}%</div>
          </div>
        </div>

        {/* Budget total et pondéré */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-orange-500" />
            <span className="text-sm font-medium">Budget total</span>
          </div>
          <div className="text-xl font-semibold">{formatCurrency(stats.totalBudget)}</div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-medium">Revenus prévisionnels pondérés</span>
          </div>
          <div className="text-xl font-semibold text-purple-600">
            {formatCurrency(stats.weightedRevenue)}
          </div>
        </div>

        {/* Répartition par statut */}
        <div className="space-y-3">
          <div className="text-sm font-medium">Répartition par statut</div>
          
          <div className="space-y-2">
            {Object.entries(stats.byStatus).map(([status, data]) => {
              const statusLabels = {
                open: { label: 'Ouvertes', color: 'bg-blue-100 text-blue-800' },
                applied: { label: 'Candidature', color: 'bg-yellow-100 text-yellow-800' },
                won: { label: 'Gagnées', color: 'bg-green-100 text-green-800' },
                lost: { label: 'Perdues', color: 'bg-red-100 text-red-800' }
              };

              const statusInfo = statusLabels[status as keyof typeof statusLabels];

              if (data.count === 0) return null;

              return (
                <div key={status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                    <span>{data.count}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(data.budget)}</div>
                    <div className="text-xs text-muted-foreground">
                      Pondéré: {formatCurrency(data.weightedRevenue)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {stats.totalOpportunities === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            Aucune opportunité créée
          </div>
        )}
      </CardContent>
    </Card>
  );
};