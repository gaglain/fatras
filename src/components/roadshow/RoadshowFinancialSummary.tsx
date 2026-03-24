import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Receipt, FileText, Truck, Calculator } from 'lucide-react';
import { StopFinancialSummary, GlobalFinancialSummary } from '@/hooks/useRoadshowFinancialSummary';

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);

const MarginBadge: React.FC<{ margin: number; percent: number | null }> = ({ margin, percent }) => {
  const isPositive = margin >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${
        isPositive
          ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
          : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
      }`}
    >
      <Icon className="h-3 w-3 mr-1" />
      {formatCurrency(margin)}
      {percent !== null && ` (${percent > 0 ? '+' : ''}${percent.toFixed(1)}%)`}
    </Badge>
  );
};

interface RoadshowFinancialSummaryProps {
  stopSummaries: StopFinancialSummary[];
  globalSummary: GlobalFinancialSummary;
  loading: boolean;
}

export const RoadshowFinancialSummary: React.FC<RoadshowFinancialSummaryProps> = ({
  stopSummaries,
  globalSummary,
  loading,
}) => {
  if (loading) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        Calcul du bilan financier...
      </div>
    );
  }

  if (stopSummaries.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center text-muted-foreground">
          <Calculator className="h-10 w-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucune donnée financière disponible.</p>
          <p className="text-xs mt-1">Ajoutez des notes de frais ou liez des devis à vos étapes.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Global Summary */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Bilan financier global
            <Badge variant="secondary" className="text-[10px] ml-auto">
              {globalSummary.stopCount} étape{globalSummary.stopCount > 1 ? 's' : ''}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="h-3 w-3" />
                Devis
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(globalSummary.totalQuotes)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Receipt className="h-3 w-3" />
                Frais
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(globalSummary.totalExpenses)}</p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Truck className="h-3 w-3" />
                Transport
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(globalSummary.totalTravelCosts)}</p>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Marge</div>
              <div className="flex items-center gap-2">
                <p className={`text-lg font-bold ${globalSummary.globalMargin >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {formatCurrency(globalSummary.globalMargin)}
                </p>
              </div>
              {globalSummary.globalMarginPercent !== null && (
                <MarginBadge margin={globalSummary.globalMargin} percent={globalSummary.globalMarginPercent} />
              )}
            </div>
          </div>

          {/* Progress bar: costs vs quotes */}
          {globalSummary.totalQuotes > 0 && (
            <div className="mt-4 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Coûts totaux: {formatCurrency(globalSummary.totalCosts)}</span>
                <span>Devis: {formatCurrency(globalSummary.totalQuotes)}</span>
              </div>
              <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    globalSummary.totalCosts <= globalSummary.totalQuotes
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min((globalSummary.totalCosts / globalSummary.totalQuotes) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Per-stop breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Détail par étape</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {stopSummaries.map(stop => (
              <div key={stop.stopId} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{stop.city}</span>
                    <span className="text-muted-foreground text-xs">— {stop.venue}</span>
                    {stop.date && (
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(stop.date + 'T00:00:00').toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    {stop.quoteCount > 0 && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {formatCurrency(stop.totalQuotes)}
                      </span>
                    )}
                    {stop.expenseCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3 w-3" />
                        {formatCurrency(stop.totalExpenses)} ({stop.expenseCount})
                      </span>
                    )}
                    {stop.travelCost > 0 && (
                      <span className="flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {formatCurrency(stop.travelCost)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="shrink-0">
                  <MarginBadge margin={stop.margin} percent={stop.marginPercent} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
