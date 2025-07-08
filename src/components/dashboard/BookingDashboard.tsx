import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Star,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  Music,
  Briefcase,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingStats {
  totalEvents: number;
  activeArtists: number;
  monthlyRevenue: number;
  pendingContracts: number;
  upcomingEvents: number;
  completedEvents: number;
  averageEventValue: number;
  conversionRate: number;
}

interface RecentActivity {
  id: string;
  type: 'event_created' | 'contract_signed' | 'payment_received' | 'artist_added' | 'task_completed';
  title: string;
  description: string;
  timestamp: string;
  priority?: 'high' | 'medium' | 'low';
}

interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  venue: string;
  artist: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  budget: number;
}

interface TopArtist {
  id: string;
  name: string;
  eventsCount: number;
  totalRevenue: number;
  rating: number;
  lastEvent: string;
}

export const BookingDashboard: React.FC = () => {
  const [stats, setStats] = useState<BookingStats>({
    totalEvents: 0,
    activeArtists: 0,
    monthlyRevenue: 0,
    pendingContracts: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    averageEventValue: 0,
    conversionRate: 0
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [topArtists, setTopArtists] = useState<TopArtist[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = () => {
    // Simuler des données pour le dashboard de booking
    setStats({
      totalEvents: 156,
      activeArtists: 23,
      monthlyRevenue: 45000,
      pendingContracts: 8,
      upcomingEvents: 12,
      completedEvents: 144,
      averageEventValue: 3200,
      conversionRate: 68
    });

    setRecentActivity([
      {
        id: '1',
        type: 'contract_signed',
        title: 'Contrat signé - The Midnight Express',
        description: 'Festival Rock - 15/08/2024',
        timestamp: 'Il y a 2 heures',
        priority: 'high'
      },
      {
        id: '2',
        type: 'event_created',
        title: 'Nouvel événement créé',
        description: 'Concert Jazz Club - 22/08/2024',
        timestamp: 'Il y a 4 heures'
      },
      {
        id: '3',
        type: 'payment_received',
        title: 'Paiement reçu - €2,500',
        description: 'Concert privé - Sarah Johnson',
        timestamp: 'Il y a 6 heures',
        priority: 'high'
      },
      {
        id: '4',
        type: 'artist_added',
        title: 'Nouvel artiste ajouté',
        description: 'Electric Dreams Band',
        timestamp: 'Hier'
      },
      {
        id: '5',
        type: 'task_completed',
        title: 'Tâche terminée',
        description: 'Suivi client - Restaurant Le Gourmet',
        timestamp: 'Hier'
      }
    ]);

    setUpcomingEvents([
      {
        id: '1',
        title: 'Festival Rock 2024',
        date: '2024-08-15',
        venue: 'Stade Municipal',
        artist: 'The Midnight Express',
        status: 'confirmed',
        budget: 8500
      },
      {
        id: '2',
        title: 'Concert Jazz Club',
        date: '2024-08-22',
        venue: 'Blue Note Paris',
        artist: 'Sarah Johnson Quartet',
        status: 'pending',
        budget: 3200
      },
      {
        id: '3',
        title: 'Soirée Privée',
        date: '2024-08-28',
        venue: 'Château de Versailles',
        artist: 'Electric Dreams',
        status: 'confirmed',
        budget: 5000
      }
    ]);

    setTopArtists([
      {
        id: '1',
        name: 'The Midnight Express',
        eventsCount: 8,
        totalRevenue: 24000,
        rating: 4.9,
        lastEvent: '2024-07-20'
      },
      {
        id: '2',
        name: 'Sarah Johnson Quartet',
        eventsCount: 6,
        totalRevenue: 18000,
        rating: 4.8,
        lastEvent: '2024-07-15'
      },
      {
        id: '3',
        name: 'Electric Dreams',
        eventsCount: 5,
        totalRevenue: 15000,
        rating: 4.7,
        lastEvent: '2024-07-10'
      }
    ]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contract_signed': return <Briefcase className="h-4 w-4" />;
      case 'event_created': return <Calendar className="h-4 w-4" />;
      case 'payment_received': return <DollarSign className="h-4 w-4" />;
      case 'artist_added': return <Music className="h-4 w-4" />;
      case 'task_completed': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'contract_signed': return 'text-green-600';
      case 'event_created': return 'text-blue-600';
      case 'payment_received': return 'text-emerald-600';
      case 'artist_added': return 'text-purple-600';
      case 'task_completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tableau de Bord Booking</h1>
          <p className="text-muted-foreground mt-2">
            Vue d'ensemble de votre activité de booking d'artistes
          </p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link to="/events">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Événement
            </Link>
          </Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Événements Total</p>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-xs text-green-600">+12% ce mois</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Artistes Actifs</p>
                <p className="text-2xl font-bold">{stats.activeArtists}</p>
                <p className="text-xs text-green-600">+3 ce mois</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Music className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">CA Mensuel</p>
                <p className="text-2xl font-bold">{stats.monthlyRevenue.toLocaleString('fr-FR')}€</p>
                <p className="text-xs text-green-600">+18% vs mois dernier</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taux Conversion</p>
                <p className="text-2xl font-bold">{stats.conversionRate}%</p>
                <p className="text-xs text-green-600">+5% ce mois</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicateurs de performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Performance Mensuelle</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Événements confirmés</span>
                <span>{stats.upcomingEvents}/{stats.upcomingEvents + 4}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Contrats signés</span>
                <span>8/12</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Objectif CA</span>
                <span>45k/60k€</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="h-5 w-5" />
              <span>Top Artistes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                <div key={artist.id} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{artist.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {artist.eventsCount} événements • {artist.totalRevenue.toLocaleString('fr-FR')}€
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs">{artist.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span>Actions Urgentes</span>
              </div>
              <Badge variant="destructive">{stats.pendingContracts}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Contrats en attente</p>
                  <p className="text-xs text-muted-foreground">8 signatures requises</p>
                </div>
                <Button size="sm" variant="destructive" asChild>
                  <Link to="/contracts">Voir</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Suivis clients</p>
                  <p className="text-xs text-muted-foreground">5 relances à faire</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/tasks">Voir</Link>
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Devis expirés</p>
                  <p className="text-xs text-muted-foreground">3 à renouveler</p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/contracts">Voir</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Événements à venir et activité récente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Prochains Événements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{event.title}</h4>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === 'confirmed' ? 'Confirmé' : 
                         event.status === 'pending' ? 'En attente' : 'Annulé'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{event.venue}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Music className="h-3 w-3" />
                        <span>{event.artist}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <DollarSign className="h-3 w-3" />
                        <span>{event.budget.toLocaleString('fr-FR')}€</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(event.date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" asChild className="w-full">
                <Link to="/events">Voir tous les événements</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Activité Récente</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)} bg-gray-100`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">{activity.title}</p>
                      {activity.priority === 'high' && (
                        <Badge variant="destructive" className="text-xs">Urgent</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
