
import React from 'react';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6 arc-content">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold arc-text-primary">Tableau de Bord</h1>
          <p className="arc-text-secondary mt-2">Bienvenue sur votre plateforme de booking d'artistes</p>
        </div>
        <div className="flex space-x-3">
          <Link to="/events">
            <Button className="arc-button">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats />

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="arc-card hover:scale-105 transition-transform cursor-pointer">
          <Link to="/contacts">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 text-purple-400 mx-auto mb-3" />
              <h3 className="font-semibold arc-text-primary">Gestion Contacts</h3>
              <p className="text-sm arc-text-secondary mt-1">Gérer vos contacts et prospects</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="arc-card hover:scale-105 transition-transform cursor-pointer">
          <Link to="/events">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <h3 className="font-semibold arc-text-primary">Événements</h3>
              <p className="text-sm arc-text-secondary mt-1">Planifier et gérer vos événements</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="arc-card hover:scale-105 transition-transform cursor-pointer">
          <Link to="/contracts">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <h3 className="font-semibold arc-text-primary">Devis & Contrats</h3>
              <p className="text-sm arc-text-secondary mt-1">Créer et suivre vos devis</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="arc-card hover:scale-105 transition-transform cursor-pointer">
          <Link to="/email-campaigns">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <h3 className="font-semibold arc-text-primary">Marketing</h3>
              <p className="text-sm arc-text-secondary mt-1">Campagnes et automatisation</p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="arc-card">
          <CardHeader>
            <CardTitle className="arc-text-primary">Activité Récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium arc-text-primary">Nouveau contact ajouté</p>
                  <p className="text-xs arc-text-secondary">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium arc-text-primary">Événement planifié</p>
                  <p className="text-xs arc-text-secondary">Hier</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium arc-text-primary">Devis envoyé</p>
                  <p className="text-xs arc-text-secondary">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="arc-card">
          <CardHeader>
            <CardTitle className="arc-text-primary">Prochains Événements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center arc-text-secondary py-4">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun événement planifié</p>
                <Link to="/events">
                  <Button variant="outline" size="sm" className="mt-2 arc-button-secondary">
                    Créer un événement
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
