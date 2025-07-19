import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Eye, MousePointer, Ban, UserMinus, TrendingUp } from 'lucide-react';

interface EmailAnalyticsProps {
  campaignId: string;
}

interface AnalyticsData {
  sent_count: number;
  delivered_count: number;
  opened_count: number;
  clicked_count: number;
  bounced_count: number;
  unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
}

export const EmailAnalytics: React.FC<EmailAnalyticsProps> = ({ campaignId }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [campaignId]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch campaign data with analytics
      const { data: campaign, error: campaignError } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (campaignError) throw campaignError;

      if (campaign) {
        const openRate = campaign.sent_count > 0 ? (campaign.opened_count / campaign.sent_count) * 100 : 0;
        const clickRate = campaign.opened_count > 0 ? (campaign.clicked_count / campaign.opened_count) * 100 : 0;

        setAnalytics({
          sent_count: campaign.sent_count || 0,
          delivered_count: campaign.delivered_count || 0,
          opened_count: campaign.opened_count || 0,
          clicked_count: campaign.clicked_count || 0,
          bounced_count: campaign.bounced_count || 0,
          unsubscribed_count: campaign.unsubscribed_count || 0,
          open_rate: openRate,
          click_rate: clickRate,
        });
      }
    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Chargement des analytics...</div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Aucune donnée disponible</div>
        </CardContent>
      </Card>
    );
  }

  const stats = [
    {
      title: "Envoyés",
      value: analytics.sent_count,
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Ouverts",
      value: analytics.opened_count,
      icon: Eye,
      color: "text-green-600",
      bgColor: "bg-green-50",
      percentage: `${analytics.open_rate.toFixed(1)}%`,
    },
    {
      title: "Clics",
      value: analytics.clicked_count,
      icon: MousePointer,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      percentage: `${analytics.click_rate.toFixed(1)}%`,
    },
    {
      title: "Rebonds",
      value: analytics.bounced_count,
      icon: Ban,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Désabonnements",
      value: analytics.unsubscribed_count,
      icon: UserMinus,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Analytics de la campagne
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className={`p-4 rounded-lg ${stat.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      {stat.percentage && (
                        <Badge variant="secondary" className="mt-1">
                          {stat.percentage}
                        </Badge>
                      )}
                    </div>
                    <Icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taux d'ouverture</span>
                <span>{analytics.open_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(analytics.open_rate, 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Taux de clic</span>
                <span>{analytics.click_rate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${Math.min(analytics.click_rate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};