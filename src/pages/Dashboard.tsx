import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Calendar, CheckSquare, Music, TrendingUp, Clock, Mail, FileText, MapPin, Euro, Star, Activity } from 'lucide-react';

const stats = [
  { name: 'Total Contacts', value: '2,847', icon: Users, change: '+12%', changeType: 'positive' as const },
  { name: 'Événements ce mois', value: '23', icon: Calendar, change: '+5%', changeType: 'positive' as const },
  { name: 'Tâches en cours', value: '47', icon: CheckSquare, change: '-8%', changeType: 'negative' as const },
  { name: 'Artistes actifs', value: '12', icon: Music, change: '+2%', changeType: 'positive' as const },
  { name: 'Revenus ce mois', value: '48,500€', icon: Euro, change: '+15%', changeType: 'positive' as const },
  { name: 'Campagnes email', value: '8', icon: Mail, change: '+3%', changeType: 'positive' as const },
];

const recentActivities = [
  { 
    type: 'contact', 
    title: 'Nouveau contact',
    message: 'John Smith - Responsable de salle', 
    time: '2 minutes',
    status: 'new',
    priority: 'high'
  },
  { 
    type: 'event', 
    title: 'Événement mis à jour',
    message: 'Festival d\'été 2024 - Dates confirmées', 
    time: '15 minutes',
    status: 'updated',
    priority: 'medium'
  },
  { 
    type: 'contract', 
    title: 'Contrat signé',
    message: 'Madison Square Garden - The Midnight Express', 
    time: '1 heure',
    status: 'signed',
    priority: 'high'
  },
  { 
    type: 'tour', 
    title: 'Tournée programmée',
    message: 'Dates ajoutées pour Sarah Mitchell', 
    time: '2 heures',
    status: 'scheduled',
    priority: 'medium'
  },
  { 
    type: 'email', 
    title: 'Campagne envoyée',
    message: 'Newsletter mars 2024 - 1,247 destinataires', 
    time: '3 heures',
    status: 'sent',
    priority: 'low'
  },
];

const upcomingEvents = [
  {
    id: '1',
    title: 'Concert Acoustique - Sarah Mitchell',
    date: '2024-07-15',
    venue: 'Blue Note Jazz Club',
    city: 'Paris',
    status: 'confirmed',
    attendees: 120
  },
  {
    id: '2',
    title: 'Rock Legends Tour',
    date: '2024-08-10',
    venue: 'Olympia',
    city: 'Paris',
    status: 'pending',
    attendees: 2000
  },
  {
    id: '3',
    title: 'Festival Jazz & Blues',
    date: '2024-09-05',
    venue: 'Parc des Expositions',
    city: 'Lyon',
    status: 'confirmed',
    attendees: 5000
  }
];

const pendingTasks = [
  { id: '1', title: 'Révision contrat Olympia', priority: 'high', deadline: '2024-07-10' },
  { id: '2', title: 'Préparation technique festival', priority: 'medium', deadline: '2024-07-15' },
  { id: '3', title: 'Suivi partenaires merchandising', priority: 'low', deadline: '2024-07-20' },
  { id: '4', title: 'Validation rider technique', priority: 'high', deadline: '2024-07-08' },
];

const topArtists = [
  { name: 'The Midnight Express', shows: 15, revenue: '45,000€', rating: 4.9 },
  { name: 'Sarah Mitchell', shows: 8, revenue: '18,500€', rating: 4.7 },
  { name: 'Thunder Road', shows: 12, revenue: '38,200€', rating: 4.8 },
];

export const Dashboard: React.FC = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleQuickAction = (action: string) => {
    console.log(`Action rapide: ${action}`);
    // Logique à implémenter selon l'action
  };

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord</h1>
        <p className="text-gray-600 mt-2">Bienvenue ! Voici un résumé de vos activités.</p>
      </div>

      {/* Stats Grid with hover animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="bg-white border border-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600 mb-1">{stat.name}</p>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className={`text-xs ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className="bg-brand-primary/10 p-2 rounded-lg">
                    <Icon className="h-4 w-4 text-brand-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="xl:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Activity className="h-5 w-5 mr-2" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-2 h-2 bg-brand-primary rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{activity.message}</p>
                    <p className="text-xs text-gray-500">Il y a {activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="xl:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <Calendar className="h-5 w-5 mr-2" />
              Prochains Événements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium truncate text-gray-900">{event.title}</h4>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {event.venue}, {event.city}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {event.attendees} participants
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card className="xl:col-span-1 bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-gray-900">
              <CheckSquare className="h-5 w-5 mr-2" />
              Tâches Prioritaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-200 rounded-lg hover:border-brand-primary/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center text-xs text-gray-600">
                    <Clock className="h-3 w-3 mr-1" />
                    Échéance: {new Date(task.deadline).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Artists Performance */}
      <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center text-gray-900">
            <Star className="h-5 w-5 mr-2" />
            Top Artistes - Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topArtists.map((artist, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-brand-primary/30 hover:shadow-sm transition-all">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{artist.name}</h4>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" />
                    <span className="text-sm text-gray-600">{artist.rating}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Spectacles:</span>
                    <span className="font-medium text-gray-900">{artist.shows}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Revenus:</span>
                    <span className="font-medium text-green-600">{artist.revenue}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions with clickable buttons */}
      <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-gray-900">Actions Rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
              onClick={() => handleQuickAction('nouveau-contact')}
            >
              <Users className="h-6 w-6 text-brand-primary mb-2" />
              <span className="text-gray-900">Nouveau Contact</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
              onClick={() => handleQuickAction('planifier-evenement')}
            >
              <Calendar className="h-6 w-6 text-brand-primary mb-2" />
              <span className="text-gray-900">Planifier Événement</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
              onClick={() => handleQuickAction('creer-tache')}
            >
              <CheckSquare className="h-6 w-6 text-brand-primary mb-2" />
              <span className="text-gray-900">Créer Tâche</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center border-gray-200 hover:border-brand-primary hover:bg-brand-primary/5 hover:scale-105 transition-all"
              onClick={() => handleQuickAction('envoyer-email')}
            >
              <Mail className="h-6 w-6 text-brand-primary mb-2" />
              <span className="text-gray-900">Envoyer Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
