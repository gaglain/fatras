
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, ShoppingCart } from 'lucide-react';

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Contacts</CardTitle>
          <Users className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <p className="text-xs text-gray-500">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Événements</CardTitle>
          <Calendar className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <p className="text-xs text-gray-500">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Devis</CardTitle>
          <FileText className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <p className="text-xs text-gray-500">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
      <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-700">Commandes</CardTitle>
          <ShoppingCart className="h-4 w-4 text-brand-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">0</div>
          <p className="text-xs text-gray-500">+0% par rapport au mois dernier</p>
        </CardContent>
      </Card>
    </div>
  );
};
