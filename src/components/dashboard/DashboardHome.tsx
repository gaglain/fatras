
import React from 'react';
import { DashboardStats } from './DashboardStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, Users, FileText, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardHome: React.FC = () => {
  return (
    <div className="space-y-6 min-h-screen p-6" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)'
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{
            color: 'var(--custom-text, #18181b)'
          }}>
            Tableau de Bord
          </h1>
          <p className="mt-2" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Bienvenue sur votre plateforme de booking d'artistes
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/events">
            <Button className="back-office-button">
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
        <Card className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Link to="/contacts">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3" style={{
                color: 'var(--custom-buttonBg, #1632f4)'
              }} />
              <h3 className="font-semibold" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Gestion Contacts
              </h3>
              <p className="text-sm mt-1" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Gérer vos contacts et prospects
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Link to="/events">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-3" style={{
                color: 'var(--custom-secondary, #ec5f65)'
              }} />
              <h3 className="font-semibold" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Événements
              </h3>
              <p className="text-sm mt-1" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Planifier et gérer vos événements
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Link to="/contracts">
            <CardContent className="p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-3" style={{
                color: 'var(--custom-accent, #f5a623)'
              }} />
              <h3 className="font-semibold" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Devis & Contrats
              </h3>
              <p className="text-sm mt-1" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Créer et suivre vos devis
              </p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Link to="/email-campaigns">
            <CardContent className="p-6 text-center">
              <Mail className="h-8 w-8 mx-auto mb-3" style={{
                color: 'var(--custom-buttonBg, #1632f4)'
              }} />
              <h3 className="font-semibold" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Marketing
              </h3>
              <p className="text-sm mt-1" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Campagnes et automatisation
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <CardHeader>
            <CardTitle style={{
              color: 'var(--custom-cardText, #18181b)'
            }}>
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    Nouveau contact ajouté
                  </p>
                  <p className="text-xs" style={{
                    color: 'var(--custom-text, #666666)'
                  }}>
                    Il y a 2 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    Événement planifié
                  </p>
                  <p className="text-xs" style={{
                    color: 'var(--custom-text, #666666)'
                  }}>
                    Hier
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium" style={{
                    color: 'var(--custom-cardText, #18181b)'
                  }}>
                    Devis envoyé
                  </p>
                  <p className="text-xs" style={{
                    color: 'var(--custom-text, #666666)'
                  }}>
                    Il y a 3 jours
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <CardHeader>
            <CardTitle style={{
              color: 'var(--custom-cardText, #18181b)'
            }}>
              Prochains Événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center py-4" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Aucun événement planifié</p>
                <Link to="/events">
                  <Button variant="outline" size="sm" className="mt-2 back-office-button">
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
