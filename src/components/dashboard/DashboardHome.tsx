
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, FileText } from 'lucide-react';
import { DashboardStats } from './DashboardStats';
import { useAuth } from '@/hooks/useAuth';

interface DashboardHomeProps {
  onNavigate: (page: string) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue sur votre plateforme de booking d'artistes
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onNavigate('contacts')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Contact
          </Button>
          <Button onClick={() => onNavigate('events')} variant="outline" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel Événement
          </Button>
        </div>
      </div>

      <DashboardStats />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent/5" onClick={() => onNavigate('contacts')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion des Contacts
            </CardTitle>
            <CardDescription>
              Gérez votre CRM et vos prospects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Centralisez toutes vos informations clients et prospects avec un système de lead scoring.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/5" onClick={() => onNavigate('events')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Événements
            </CardTitle>
            <CardDescription>
              Planifiez et gérez vos bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Organisez vos événements et liez-les automatiquement à vos contacts.
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:bg-accent/5" onClick={() => onNavigate('contracts')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Devis & Contrats
            </CardTitle>
            <CardDescription>
              Créez et gérez vos propositions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Générez des devis personnalisés et suivez leur statut en temps réel.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activité Récente</CardTitle>
          <CardDescription>
            Dernières actions sur votre plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-muted-foreground">
            <p>Aucune activité récente</p>
            <p className="text-sm">Commencez par créer votre premier contact ou événement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
