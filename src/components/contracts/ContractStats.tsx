
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Contract {
  status: 'draft' | 'sent' | 'signed' | 'executed';
}

interface ContractStatsProps {
  contracts: Contract[];
}

export const ContractStats: React.FC<ContractStatsProps> = ({ contracts }) => {
  const draftCount = contracts.filter(c => c.status === 'draft').length;
  const sentCount = contracts.filter(c => c.status === 'sent').length;
  const signedCount = contracts.filter(c => c.status === 'signed').length;
  const executedCount = contracts.filter(c => c.status === 'executed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold">{draftCount}</div>
          <div className="text-sm text-muted-foreground">Brouillons</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{sentCount}</div>
          <div className="text-sm text-muted-foreground">Envoyés</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{signedCount}</div>
          <div className="text-sm text-muted-foreground">Signés</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{executedCount}</div>
          <div className="text-sm text-muted-foreground">Exécutés</div>
        </CardContent>
      </Card>
    </div>
  );
};
