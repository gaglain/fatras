import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Mail, Send, Inbox, Eye, TrendingUp, Users, Clock } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface EmailStats {
  total_sent: number;
  total_received: number;
  total_opened: number;
  open_rate: number;
  sent_today: number;
  received_today: number;
  sent_this_week: number;
  received_this_week: number;
}

interface UserEmailStats {
  user_id: string;
  user_name: string;
  sent_count: number;
  received_count: number;
  opened_count: number;
}

interface TimeSeriesData {
  date: string;
  sent: number;
  received: number;
}

export const TeamEmailDashboard: React.FC = () => {
  const [stats, setStats] = useState<EmailStats>({
    total_sent: 0,
    total_received: 0,
    total_opened: 0,
    open_rate: 0,
    sent_today: 0,
    received_today: 0,
    sent_this_week: 0,
    received_this_week: 0,
  });
  const [userStats, setUserStats] = useState<UserEmailStats[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmailStats = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfDay = today.toISOString();
      
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      weekAgo.setHours(0, 0, 0, 0);
      const startOfWeek = weekAgo.toISOString();

      // Récupérer tous les emails de la table emails
      const { data: allEmails, error } = await supabase
        .from('emails')
        .select('id, user_id, direction, status, sent_at, received_at, opened_at, created_at');

      if (error) {
        console.error('Erreur requête emails:', error);
      }

      const emails = allEmails || [];
      
      // Filtrer par direction
      const sentEmails = emails.filter(e => e.direction === 'sent');
      const receivedEmails = emails.filter(e => e.direction === 'received');

      const totalSent = sentEmails.length;
      const totalReceived = receivedEmails.length;
      const totalOpened = sentEmails.filter(e => e.opened_at).length;

      // Stats aujourd'hui - utiliser created_at ou sent_at/received_at
      const sentToday = sentEmails.filter(e => {
        const date = e.sent_at || e.created_at;
        return date && date >= startOfDay;
      }).length;
      
      const receivedToday = receivedEmails.filter(e => {
        const date = e.received_at || e.created_at;
        return date && date >= startOfDay;
      }).length;

      // Stats cette semaine
      const sentThisWeek = sentEmails.filter(e => {
        const date = e.sent_at || e.created_at;
        return date && date >= startOfWeek;
      }).length;
      
      const receivedThisWeek = receivedEmails.filter(e => {
        const date = e.received_at || e.created_at;
        return date && date >= startOfWeek;
      }).length;

      setStats({
        total_sent: totalSent,
        total_received: totalReceived,
        total_opened: totalOpened,
        open_rate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        sent_today: sentToday,
        received_today: receivedToday,
        sent_this_week: sentThisWeek,
        received_this_week: receivedThisWeek,
      });

      // Statistiques par utilisateur - utiliser user_profiles au lieu de user_roles
      const { data: users } = await supabase
        .from('user_profiles')
        .select('user_id, email, first_name, last_name')
        .not('user_id', 'is', null);

      const userStatsData: UserEmailStats[] = [];
      
      if (users) {
        for (const user of users) {
          const sentCount = sentEmails.filter(e => e.user_id === user.user_id).length;
          const receivedCount = receivedEmails.filter(e => e.user_id === user.user_id).length;
          const openedCount = sentEmails.filter(e => e.user_id === user.user_id && e.opened_at).length;

          if (sentCount > 0 || receivedCount > 0) {
            const displayName = user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.email?.split('@')[0] || 'Utilisateur';
            
            userStatsData.push({
              user_id: user.user_id,
              user_name: displayName,
              sent_count: sentCount,
              received_count: receivedCount,
              opened_count: openedCount,
            });
          }
        }
      }

      setUserStats(userStatsData);

      // Données de série temporelle (7 derniers jours)
      const timeData: TimeSeriesData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);

        const sentOnDate = sentEmails.filter(e => {
          const d = e.sent_at || e.created_at;
          return d && d >= dayStart.toISOString() && d <= dayEnd.toISOString();
        }).length;

        const receivedOnDate = receivedEmails.filter(e => {
          const d = e.received_at || e.created_at;
          return d && d >= dayStart.toISOString() && d <= dayEnd.toISOString();
        }).length;

        timeData.push({
          date: new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          sent: sentOnDate,
          received: receivedOnDate,
        });
      }

      setTimeSeriesData(timeData);

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmailStats();
  }, []);

  const chartConfig = {
    sent: {
      label: "Envoyés",
      color: "hsl(var(--primary))",
    },
    received: {
      label: "Reçus",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Emails</h2>
          <p className="text-muted-foreground">Statistiques d'emails de l'équipe</p>
        </div>
        <Button variant="outline" onClick={fetchEmailStats} disabled={loading}>
          <Clock className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_sent}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.sent_this_week} cette semaine
            </p>
            <p className="text-xs text-primary">
              {stats.sent_today} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails reçus</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_received}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.received_this_week} cette semaine
            </p>
            <p className="text-xs text-primary">
              {stats.received_today} aujourd'hui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.open_rate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.total_opened} emails ouverts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume total</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.total_sent + stats.total_received}
            </div>
            <p className="text-xs text-muted-foreground">
              Emails envoyés + reçus
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et données détaillées */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList>
          <TabsTrigger value="timeline">Évolution</TabsTrigger>
          <TabsTrigger value="team">Par membre</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Activité emails (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <YAxis 
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--foreground))' }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sent" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Envoyés"
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="received" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Reçus"
                      dot={{ fill: 'hsl(var(--secondary))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Performance par membre de l'équipe</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userStats.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Aucune activité email enregistrée</p>
                  </div>
                ) : (
                  <>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userStats}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="user_name" 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--foreground))' }}
                          />
                          <Tooltip 
                            contentStyle={{
                              backgroundColor: 'hsl(var(--background))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '6px',
                            }}
                          />
                          <Legend />
                          <Bar dataKey="sent_count" fill="hsl(var(--primary))" name="Envoyés" />
                          <Bar dataKey="received_count" fill="hsl(var(--secondary))" name="Reçus" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-6">
                      {userStats.map(user => (
                        <div key={user.user_id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {user.user_name}
                            </h3>
                            <div className="flex gap-2 text-xs">
                              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                                {user.sent_count} envoyés
                              </span>
                              <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                                {user.received_count} reçus
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {user.opened_count} ouverts
                              {user.sent_count > 0 && (
                                <span className="ml-1">
                                  ({((user.opened_count / user.sent_count) * 100).toFixed(1)}%)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
