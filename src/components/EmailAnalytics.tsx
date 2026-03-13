import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEmailCampaigns } from '@/hooks/useEmailCampaigns';
import { useEmailTracking } from '@/hooks/useEmailTracking';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Mail, MousePointer, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface AnalyticsData {
  campaign_id: string;
  campaign_name: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

interface EventData {
  id: string;
  event_type: string;
  created_at: string;
  contact_id: string;
  event_data: any;
  contact_first_name?: string;
  contact_last_name?: string;
  contact_email?: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--muted))', 'hsl(var(--accent))'];

export const EmailAnalytics: React.FC = () => {
  const { campaigns } = useEmailCampaigns();
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [eventHistory, setEventHistory] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Charger les données d'analytics
  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('email_campaigns')
        .select('*');

      if (selectedCampaign !== 'all') {
        query = query.eq('id', selectedCampaign);
      }

      const { data: campaignData, error } = await query;
      
      if (error) throw error;

      const analytics: AnalyticsData[] = campaignData?.map(campaign => ({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        total_sent: campaign.sent_count || 0,
        total_delivered: campaign.delivered_count || 0,
        total_opened: campaign.opened_count || 0,
        total_clicked: campaign.clicked_count || 0,
        total_bounced: campaign.bounced_count || 0,
        total_unsubscribed: campaign.unsubscribed_count || 0,
        open_rate: campaign.open_rate || 0,
        click_rate: campaign.click_rate || 0,
        bounce_rate: campaign.sent_count ? ((campaign.bounced_count || 0) / campaign.sent_count) * 100 : 0,
      })) || [];

      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Erreur lors du chargement des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Charger l'historique des événements
  const fetchEventHistory = async () => {
    try {
      let query = supabase
        .from('email_analytics')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (selectedCampaign !== 'all') {
        query = query.eq('campaign_id', selectedCampaign);
      }

      const { data, error } = await query;
      if (error) throw error;

      const events = data || [];
      const contactIds = Array.from(new Set(events.map((event) => event.contact_id).filter((id): id is string => Boolean(id))));

      if (contactIds.length === 0) {
        setEventHistory(events);
        return;
      }

      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, email')
        .in('id', contactIds);

      if (contactsError) throw contactsError;

      const contactsById = new Map((contactsData || []).map((contact) => [contact.id, contact]));

      setEventHistory(
        events.map((event) => {
          const contact = contactsById.get(event.contact_id);
          return {
            ...event,
            contact_first_name: contact?.first_name,
            contact_last_name: contact?.last_name,
            contact_email: contact?.email,
          };
        })
      );
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    fetchEventHistory();
  }, [selectedCampaign]);

  // Calculer les totaux globaux
  const globalStats = analyticsData.reduce((acc, data) => ({
    total_sent: acc.total_sent + data.total_sent,
    total_delivered: acc.total_delivered + data.total_delivered,
    total_opened: acc.total_opened + data.total_opened,
    total_clicked: acc.total_clicked + data.total_clicked,
    total_bounced: acc.total_bounced + data.total_bounced,
    total_unsubscribed: acc.total_unsubscribed + data.total_unsubscribed,
  }), {
    total_sent: 0,
    total_delivered: 0,
    total_opened: 0,
    total_clicked: 0,
    total_bounced: 0,
    total_unsubscribed: 0,
  });

  const globalOpenRate = globalStats.total_sent ? (globalStats.total_opened / globalStats.total_sent) * 100 : 0;
  const globalClickRate = globalStats.total_sent ? (globalStats.total_clicked / globalStats.total_sent) * 100 : 0;
  const globalBounceRate = globalStats.total_sent ? (globalStats.total_bounced / globalStats.total_sent) * 100 : 0;

  // Données pour les graphiques
  const chartData = analyticsData.map(data => ({
    name: data.campaign_name,
    Envoyés: data.total_sent,
    Livrés: data.total_delivered,
    Ouverts: data.total_opened,
    Cliqués: data.total_clicked,
  }));

  const pieData = [
    { name: 'Ouverts', value: globalStats.total_opened },
    { name: 'Non ouverts', value: globalStats.total_sent - globalStats.total_opened },
    { name: 'Cliqués', value: globalStats.total_clicked },
    { name: 'Rebonds', value: globalStats.total_bounced },
  ].filter(item => item.value > 0);

  const getTrendIcon = (rate: number, benchmark: number) => {
    if (rate > benchmark) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (rate < benchmark) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const formatEventType = (type: string) => {
    const types = {
      'sent': 'Envoyé',
      'delivered': 'Livré',
      'opened': 'Ouvert',
      'clicked': 'Cliqué',
      'bounced': 'Rebond',
      'unsubscribed': 'Désabonnement'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="flex gap-4 items-center">
        <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Sélectionner une campagne" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les campagnes</SelectItem>
            {campaigns.map(campaign => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { fetchAnalytics(); fetchEventHistory(); }}>
          Actualiser
        </Button>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emails envoyés</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.total_sent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.total_delivered} livrés ({globalStats.total_sent > 0 ? ((globalStats.total_delivered / globalStats.total_sent) * 100).toFixed(1) : 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux d'ouverture</CardTitle>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(globalOpenRate, 20)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.total_opened.toLocaleString()} ouvertures - Benchmark: 20%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de clic</CardTitle>
            <div className="flex items-center gap-1">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              {getTrendIcon(globalClickRate, 3)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalClickRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.total_clicked.toLocaleString()} clics - Benchmark: 3%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de rebond</CardTitle>
            <div className="flex items-center gap-1">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{globalBounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {globalStats.total_bounced.toLocaleString()} rebonds - Max acceptable: 2%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques et données détaillées */}
      <Tabs defaultValue="charts" className="w-full">
        <TabsList>
          <TabsTrigger value="charts">Graphiques</TabsTrigger>
          <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
          <TabsTrigger value="events">Événements</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Graphique en barres */}
            <Card>
              <CardHeader>
                <CardTitle>Performance par campagne</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="Envoyés" fill="hsl(var(--primary))" />
                    <Bar dataKey="Ouverts" fill="hsl(var(--secondary))" />
                    <Bar dataKey="Cliqués" fill="hsl(var(--accent))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Graphique en secteurs */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des engagements</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <CardTitle>Détails des campagnes</CardTitle>
              <CardDescription>
                Performance détaillée de chaque campagne
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.map(campaign => (
                  <div key={campaign.campaign_id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{campaign.campaign_name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary">{campaign.total_sent} envoyés</Badge>
                        <Badge variant="outline">{campaign.open_rate.toFixed(1)}% ouverture</Badge>
                        <Badge variant="outline">{campaign.click_rate.toFixed(1)}% clic</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Livrés:</span>
                        <div className="font-medium">{campaign.total_delivered}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ouverts:</span>
                        <div className="font-medium">{campaign.total_opened}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Cliqués:</span>
                        <div className="font-medium">{campaign.total_clicked}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rebonds:</span>
                        <div className="font-medium">{campaign.total_bounced}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Historique des événements</CardTitle>
              <CardDescription>
                Événements de tracking en temps réel
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {eventHistory.map(event => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        event.event_type === 'opened' ? 'default' :
                        event.event_type === 'clicked' ? 'secondary' :
                        event.event_type === 'bounced' ? 'destructive' : 'outline'
                      }>
                        {formatEventType(event.event_type)}
                      </Badge>
                      <button
                        onClick={() => navigate(`/contacts/${event.contact_id}`)}
                        className="text-sm text-left hover:underline text-primary"
                      >
                        {event.contact_first_name || event.contact_last_name
                          ? `${event.contact_first_name || ''} ${event.contact_last_name || ''}`.trim()
                          : event.contact_id.slice(0, 8) + '...'}
                        {event.contact_email && (
                          <span className="ml-1 text-muted-foreground">({event.contact_email})</span>
                        )}
                      </button>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};