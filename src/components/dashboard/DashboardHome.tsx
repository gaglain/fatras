import React, { useState } from 'react';
import { DashboardStats } from './DashboardStats';
import { DashboardCharts } from './DashboardCharts';
import { DashboardKPIs } from './DashboardKPIs';
import { OpportunityStatsCard } from './OpportunityStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Calendar, Users, FileText, Mail, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const DashboardHome: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<string>('all');

  // Charger la liste des artistes
  const { data: artists = [] } = useQuery({
    queryKey: ['dashboard-artists-filter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('centralized_artists')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 min-h-screen" style={{
      background: 'var(--custom-background, #ffffff)',
      color: 'var(--custom-text, #18181b)'
    }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl lg:text-3xl font-bold truncate" style={{
            color: 'var(--custom-text, #18181b)'
          }}>
            Tableau de Bord
          </h1>
          <p className="mt-1 text-sm lg:text-base" style={{
            color: 'var(--custom-text, #666666)'
          }}>
            Bienvenue sur votre plateforme de booking d'artistes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Select value={selectedArtist} onValueChange={setSelectedArtist}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrer par artiste" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les artistes</SelectItem>
              {artists.map(artist => (
                <SelectItem key={artist.id} value={artist.id}>
                  {artist.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Link to="/events" className="w-full sm:w-auto">
            <Button className="back-office-button w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nouvel Événement</span>
              <span className="sm:hidden">Événement</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <DashboardStats selectedArtist={selectedArtist} />

      {/* KPIs Tournée */}
      <DashboardKPIs selectedArtist={selectedArtist} />

      {/* Charts Section */}
      <DashboardCharts selectedArtist={selectedArtist} />
      
      {/* Opportunity Stats */}
      <OpportunityStatsCard />

      {/* Quick Actions */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md hover:scale-105 transition-all cursor-pointer" style={{
          background: 'var(--custom-cardBg, #ffffff)',
          color: 'var(--custom-cardText, #18181b)',
          border: '1px solid rgba(0,0,0,0.1)'
        }}>
          <Link to="/contacts">
            <CardContent className="p-3 md:p-6 text-center">
              <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3" style={{
                color: 'var(--custom-buttonBg, #1632f4)'
              }} />
              <h3 className="text-sm md:text-base font-semibold truncate" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Contacts
              </h3>
              <p className="text-xs md:text-sm mt-1 hidden md:block" style={{
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
            <CardContent className="p-3 md:p-6 text-center">
              <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3" style={{
                color: 'var(--custom-secondary, #ec5f65)'
              }} />
              <h3 className="text-sm md:text-base font-semibold truncate" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Événements
              </h3>
              <p className="text-xs md:text-sm mt-1 hidden md:block" style={{
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
            <CardContent className="p-3 md:p-6 text-center">
              <FileText className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3" style={{
                color: 'var(--custom-accent, #f5a623)'
              }} />
              <h3 className="text-sm md:text-base font-semibold truncate" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Devis
              </h3>
              <p className="text-xs md:text-sm mt-1 hidden md:block" style={{
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
            <CardContent className="p-3 md:p-6 text-center">
              <Mail className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 md:mb-3" style={{
                color: 'var(--custom-buttonBg, #1632f4)'
              }} />
              <h3 className="text-sm md:text-base font-semibold truncate" style={{
                color: 'var(--custom-cardText, #18181b)'
              }}>
                Marketing
              </h3>
              <p className="text-xs md:text-sm mt-1 hidden md:block" style={{
                color: 'var(--custom-text, #666666)'
              }}>
                Campagnes et automatisation
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
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
