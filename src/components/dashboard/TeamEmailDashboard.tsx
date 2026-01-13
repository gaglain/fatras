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
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const startOfWeek = new Date(today.setDate(today.getDate() - 7)).toISOString();

      // Statistiques globales d'emails envoyés
      const { data: sentEmails } = await supabase
        .from('emails')
        .select('*');

      // Statistiques d'emails reçus
      const { data: receivedEmails } = await supabase
        .from('inbound_emails')
        .select('*');

      const totalSent = sentEmails?.length || 0;
      const totalReceived = receivedEmails?.length || 0;
      const totalOpened = sentEmails?.filter(e => e.opened_at).length || 0;

      const sentToday = sentEmails?.filter(e => e.sent_at && e.sent_at >= startOfDay).length || 0;
      const receivedToday = receivedEmails?.filter(e => e.received_at && e.received_at >= startOfDay).length || 0;
      const sentThisWeek = sentEmails?.filter(e => e.sent_at && e.sent_at >= startOfWeek).length || 0;
      const receivedThisWeek = receivedEmails?.filter(e => e.received_at && e.received_at >= startOfWeek).length || 0;

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

      // Statistiques par utilisateur
      const { data: users } = await supabase
        .from('user_roles')
        .select('user_id, users!inner(email)');

      const userStatsData: UserEmailStats[] = [];
      
      if (users) {
        for (const user of users) {
          const sentCount = sentEmails?.filter(e => e.user_id === user.user_id).length || 0;
          const receivedCount = receivedEmails?.filter(e => e.user_id === user.user_id).length || 0;
          const openedCount = sentEmails?.filter(e => e.user_id === user.user_id && e.opened_at).length || 0;

          if (sentCount > 0 || receivedCount > 0) {
            userStatsData.push({
              user_id: user.user_id,
              user_name: (user.users as any)?.email?.split('@')[0] || 'Utilisateur',
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
        const startOfDate = new Date(date.setHours(0, 0, 0, 0)).toISOString();
        const endOfDate = new Date(date.setHours(23, 59, 59, 999)).toISOString();

        const sentOnDate = sentEmails?.filter(e => 
          e.sent_at && e.sent_at >= startOfDate && e.sent_at <= endOfDate
        ).length || 0;

        const receivedOnDate = receivedEmails?.filter(e => 
          e.received_at && e.received_at >= startOfDate && e.received_at <= endOfDate
        ).length || 0;

        timeData.push({
          date: new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
          sent: sentOnDate,
          received: receivedOnDate,
        });
      }

      setTimeSeriesData(timeData);

    } catch {
      // Erreur silencieuse
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
