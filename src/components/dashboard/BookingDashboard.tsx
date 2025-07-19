
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, MapPin, Users, Euro, Plus, TrendingUp, Music, CheckCircle, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/types/event.types';
import { getStatusColor, getStatusLabel } from '@/utils/roadshow.utils';

export const BookingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBookingStats = () => {
    const total = events.length;
    const thisMonth = events.filter(e => {
      if (!e.start_date) return false;
      const eventDate = new Date(e.start_date);
      const now = new Date();
      return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
    }).length;
    
    const confirmed = events.filter(e => e.status === 'confirmed').length;
    const pending = events.filter(e => e.status === 'pending').length;
    const revenue = events
      .filter(e => e.status === 'confirmed' && e.budget_min)
      .reduce((sum, e) => sum + (e.budget_min || 0), 0);

    return { total, thisMonth, confirmed, pending, revenue };
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    return events
      .filter(e => e.start_date && new Date(e.start_date) > now)
      .slice(0, 5);
  };

  const getPendingBookings = () => {
    return events.filter(e => e.status === 'pending').slice(0, 5);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const stats = getBookingStats();
  const upcomingEvents = getUpcomingEvents();
  const pendingBookings = getPendingBookings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Booking Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Gérez vos réservations et événements
          </p>
        </div>
        <div className="flex space-x-2">
          <Link to="/roadshow">
            <Button variant="outline">
              <Music className="h-4 w-4 mr-2" />
              Feuille de Route
            </Button>
          </Link>
          <Link to="/events">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau Booking
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ce Mois</p>
                <p className="text-2xl font-bold text-blue-600">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Confirmés</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">En Attente</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Euro className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Chiffre d'Affaires</p>
                <p className="text-2xl font-bold">{stats.revenue.toLocaleString()}€</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Prochains Événements</TabsTrigger>
          <TabsTrigger value="pending">Bookings en Attente</TabsTrigger>
          <TabsTrigger value="overview">Vue d'Ensemble</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Prochains Événements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun événement à venir</p>
                  <Link to="/events">
                    <Button className="mt-2" variant="outline">
                      Créer un événement
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                          <h3 className="font-semibold">{event.title}</h3>
                        </div>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(event.start_date)}
                          </div>
                          {event.venue && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.venue}
                            </div>
                          )}
                          {event.attendees_count && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" />
                              {event.attendees_count} personnes
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {event.budget_min && (
                          <p className="font-semibold text-primary">
                            {event.budget_min.toLocaleString()}€
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Bookings en Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun booking en attente</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingBookings.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
                      <div className="flex-1">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {formatDate(event.start_date)}
                          </div>
                          {event.venue && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {event.venue}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link to={`/events`}>
                          <Button size="sm" variant="outline">
                            Voir Détails
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Actions Rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/events" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un nouveau booking
                  </Button>
                </Link>
                <Link to="/contacts" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Gérer les contacts
                  </Button>
                </Link>
                <Link to="/roadshow" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Music className="h-4 w-4 mr-2" />
                    Planifier une tournée
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistiques du Mois</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Événements ce mois</span>
                    <span className="font-semibold">{stats.thisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux de confirmation</span>
                    <span className="font-semibold">
                      {stats.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CA prévisionnel</span>
                    <span className="font-semibold text-primary">
                      {stats.revenue.toLocaleString()}€
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
