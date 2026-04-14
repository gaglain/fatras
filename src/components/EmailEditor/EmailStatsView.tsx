import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmailStatsViewProps {
  onBack: () => void;
}

export const EmailStatsView: React.FC<EmailStatsViewProps> = ({ onBack }) => {
  const mockStats = {
    sent: 1250, delivered: 1205, opened: 542, clicked: 89,
    bounced: 15, unsubscribed: 3, openRate: 45, clickRate: 16
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Statistiques de l'email</h2>
        <Button onClick={onBack}>Retour à l'éditeur</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-blue-600">{mockStats.sent}</div><p className="text-sm text-gray-600">Emails envoyés</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-green-600">{mockStats.delivered}</div><p className="text-sm text-gray-600">Délivrés</p><p className="text-xs text-gray-500">{((mockStats.delivered / mockStats.sent) * 100).toFixed(1)}%</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-purple-600">{mockStats.opened}</div><p className="text-sm text-gray-600">Ouvertures</p><p className="text-xs text-gray-500">{mockStats.openRate}%</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-orange-600">{mockStats.clicked}</div><p className="text-sm text-gray-600">Clics</p><p className="text-xs text-gray-500">{mockStats.clickRate}%</p></CardContent></Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-red-600">{mockStats.bounced}</div><p className="text-sm text-gray-600">Bounces</p><p className="text-xs text-gray-500">{((mockStats.bounced / mockStats.sent) * 100).toFixed(1)}%</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-gray-600">{mockStats.unsubscribed}</div><p className="text-sm text-gray-600">Désabonnements</p><p className="text-xs text-gray-500">{((mockStats.unsubscribed / mockStats.sent) * 100).toFixed(2)}%</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="text-2xl font-bold text-indigo-600">{((mockStats.clicked / mockStats.opened) * 100).toFixed(1)}%</div><p className="text-sm text-gray-600">Taux clic/ouverture</p><p className="text-xs text-gray-500">CTR</p></CardContent></Card>
      </div>
    </div>
  );
};
