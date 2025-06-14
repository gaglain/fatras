
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, ShoppingCart } from 'lucide-react';

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="arc-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium arc-text-secondary">Contacts</CardTitle>
          <Users className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold arc-text-primary">0</div>
          <p className="text-xs arc-text-secondary">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="arc-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium arc-text-secondary">Événements</CardTitle>
          <Calendar className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold arc-text-primary">0</div>
          <p className="text-xs arc-text-secondary">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="arc-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium arc-text-secondary">Devis</CardTitle>
          <FileText className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold arc-text-primary">0</div>
          <p className="text-xs arc-text-secondary">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="arc-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium arc-text-secondary">Commandes</CardTitle>
          <ShoppingCart className="h-4 w-4 text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold arc-text-primary">0</div>
          <p className="text-xs arc-text-secondary">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
    </div>
  );
};
