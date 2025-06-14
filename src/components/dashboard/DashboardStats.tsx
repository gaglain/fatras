
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, FileText, ShoppingCart } from 'lucide-react';

export const DashboardStats = () => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-cardText, #18181b)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Contacts
          </CardTitle>
          <Users className="h-4 w-4" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            0
          </div>
          <p className="text-xs" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            +0% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-cardText, #18181b)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Événements
          </CardTitle>
          <Calendar className="h-4 w-4" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            0
          </div>
          <p className="text-xs" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            +0% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-cardText, #18181b)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Devis
          </CardTitle>
          <FileText className="h-4 w-4" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            0
          </div>
          <p className="text-xs" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            +0% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-sm hover:shadow-md transition-shadow" style={{
        background: 'var(--custom-cardBg, #ffffff)',
        color: 'var(--custom-cardText, #18181b)',
        border: '1px solid rgba(0,0,0,0.1)'
      }}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Commandes
          </CardTitle>
          <ShoppingCart className="h-4 w-4" style={{
            color: 'var(--custom-buttonBg, #1632f4)'
          }} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{
            color: 'var(--custom-cardText, #18181b)'
          }}>
            0
          </div>
          <p className="text-xs" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            +0% par rapport au mois dernier
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
